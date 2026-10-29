/* Checkout Page, Steps 2 And 3 (port of Quivogue cart.html) */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { usePaymentMethods, usePlaceOrder, useQuote, useSubscribe } from "@/store/tanstackStore/queries/site";
import { useSeo } from "@/seo/useSeo";
import { readStored, writeStored } from "@/utils/storage";
import { glideTop } from "@/utils/smoothScroll";
import BagEmpty from "./sections/BagEmpty";
import DiscountCode from "./sections/DiscountCode";
import Shell from "./CheckoutShell";
import DeliveryForm from "./sections/DeliveryForm";
import ReviewStep from "./sections/ReviewStep";
import OrderSummary from "./sections/OrderSummary";
import SendOrder from "./sections/SendOrder";
import { useCheckoutBag } from "./useCheckoutBag";
import { t } from "@/i18n/translate";

const KEY = "qvfits:checkout-details";

// Guest-friendly by design: signing in only fills the form in.
export default function CheckoutPage() {
  useSeo({ title: "Checkout", noindex: true });
  const { customer } = useCustomerAuth();
  const { lines, clear } = useCart();
  const { money } = useCurrency();
  const navigate = useNavigate();
  const placeOrder = usePlaceOrder();
  const subscribe = useSubscribe();
  const { data: methods = [] } = usePaymentMethods();

  const [details, setDetails] = useState(() => {
    const saved = readStored(KEY, {});
    const home = customer?.addresses?.[0];
    return {
      name: saved.name ?? customer?.name ?? "",
      phone: saved.phone ?? customer?.phone ?? home?.phone ?? "",
      email: saved.email ?? customer?.email ?? "",
      region: saved.region ?? home?.region ?? "kampala",
      address: saved.address ?? home?.address ?? "",
      note: "",
      news: false,
      payment: saved.payment ?? "mtn",
    };
  });
  const [region, setRegion] = useState(details.region);
  const [step, setStep] = useState(2);
  const [placed, setPlaced] = useState(null);
  const bag = useCheckoutBag(region);
  const quote = useQuote();
  const [applied, setApplied] = useState(null);
  const [codeError, setCodeError] = useState("");

  // A code is priced by the service; the shown totals are its quote.
  const applyCode = async (code, where = region) => {
    setCodeError("");
    const q = await quote.mutateAsync({ lines, region: where, code, customerId: customer?.id }).catch((e) => setCodeError(e.message));
    if (!q) return;
    if (q.discountCode) setApplied(q);
    else {
      setApplied(null);
      setCodeError(q.discountReason ?? "That code is not valid.");
    }
  };

  // The shop prices the bag every time it or the delivery area changes: kits,
  // sale prices and the code are worked out there, never trusted from here.
  // A code the bag no longer qualifies for drops off with its reason.
  const appliedCode = applied?.discountCode;
  const { mutateAsync: requote } = quote;
  const [server, setServer] = useState(null);
  useEffect(() => {
    if (!lines.length) return;
    requote({ lines, region, code: appliedCode, customerId: customer?.id })
      .then((q) => {
        setServer(q);
        if (appliedCode && !q.discountCode) {
          setApplied(null);
          setCodeError(q.discountReason ?? "That code no longer applies to your bag.");
        }
      })
      .catch(() => {});
  }, [region, appliedCode, lines, customer?.id, requote]);
  const priced = server
    ? { ...bag, subtotal: server.subtotal, kitSaving: server.kitSaving, discount: server.discount, discountCode: server.discountCode, delivery: server.delivery, total: server.total }
    : bag;

  // Once placed, show the hand-off details instead of the form; the bag is cleared below.
  if (placed) {
    return (
      <Shell step={4}>
        <div className="cart-layout">
          <SendOrder order={placed} settings={bag.settings} />
          <OrderSummary bag={{ ...placed, settings: bag.settings }} region={placed.region} />
        </div>
      </Shell>
    );
  }
  if (!lines.length) return <Shell><BagEmpty /></Shell>;
  if (bag.isLoading || !bag.settings) return <Shell><PageLoader variant="form" /></Shell>;

  const review = (values) => {
    setDetails(values);
    // Remembered on this device for next time; the note and the newsletter choice are not.
    writeStored(KEY, { ...values, note: undefined, news: undefined });
    setStep(3);
    glideTop();
  };

  const place = async () => {
    const order = await placeOrder.mutateAsync({ input: { ...details, lines, discountCode: appliedCode }, customerId: customer?.id }).catch(() => null);
    if (!order) return;
    // Opted in at checkout: the confirm email goes out; a failure never blocks the order.
    if (details.news && details.email) subscribe.mutate({ email: details.email, source: "checkout", name: details.name, customerId: customer?.id });
    setPlaced(order);
    clear();
    glideTop();
  };

  return (
    <Shell step={step}>
      <div className="cart-layout">
        {step === 2 ? (
          <div>
            {/* Sign-in is optional; authenticated details only prefill the guest-friendly form. */}
            {!customer && (
              <p className="mb-4 text-sm text-ink-3">
                Have an account? <Link to="/login?next=/checkout" className="text-brand-600 underline">{t("Sign in")}</Link> to fill this in, or carry on as a guest.
              </p>
            )}
            <DeliveryForm
              defaults={details}
              settings={bag.settings}
              methods={methods}
              subtotal={bag.subtotal}
              onRegion={setRegion}
              onSubmit={review}
              onBack={() => navigate("/cart")}
            />
          </div>
        ) : (
          <ReviewStep
            bag={priced}
            details={details}
            money={money}
            address={bag.settings.address}
            onPlace={place}
            onBack={() => setStep(2)}
            placing={placeOrder.isPending}
            error={placeOrder.error?.message}
          />
        )}
        <OrderSummary bag={priced} region={region}>
          <DiscountCode applied={applied} checking={quote.isPending} error={codeError} onApply={(code) => applyCode(code)} onRemove={() => { setApplied(null); setCodeError(""); }} />
          <p className="mt-4 text-[.78rem] text-ink-4">
            By placing an order you agree to our <Link to="/terms" className="underline">terms of sale</Link>,{" "}
            <Link to="/returns" className="underline">exchanges policy</Link> and <Link to="/privacy" className="underline">privacy policy</Link>.
          </p>
        </OrderSummary>
      </div>
    </Shell>
  );
}
