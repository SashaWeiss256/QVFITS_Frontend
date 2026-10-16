/* Checkout Page, Steps 2 And 3 (port of Quivogue cart.html) */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { usePlaceOrder } from "@/store/tanstackStore/queries/site";
import { useSeo } from "@/seo/useSeo";
import { readStored, writeStored } from "@/utils/storage";
import BagEmpty from "./sections/BagEmpty";
import Shell from "./sections/CheckoutShell";
import DeliveryForm from "./sections/checkoutForm/DeliveryForm";
import ReviewOrder from "./sections/checkoutForm/ReviewOrder";
import OrderSummary from "./sections/OrderSummary";
import SendOrder from "./sections/SendOrder";
import { useBag } from "./sections/useBag";

const KEY = "qvfits:checkout-details";

// Guest-friendly by design: signing in only fills the form in.
export default function CheckoutPage() {
  useSeo({ title: "Checkout", noindex: true });
  const { customer } = useCustomerAuth();
  const { lines, clear } = useCart();
  const { money } = useCurrency();
  const navigate = useNavigate();
  const placeOrder = usePlaceOrder();

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
      payment: saved.payment ?? "mtn",
    };
  });
  const [region, setRegion] = useState(details.region);
  const [step, setStep] = useState(2);
  const [placed, setPlaced] = useState(null);
  const bag = useBag(region);

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
  if (bag.isLoading || !bag.settings) return <Shell><PageLoader /></Shell>;

  const review = (values) => {
    setDetails(values);
    // Remembered on this device for next time; the note is not.
    writeStored(KEY, { ...values, note: undefined });
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const place = async () => {
    const order = await placeOrder.mutateAsync({ input: { ...details, lines }, customerId: customer?.id }).catch(() => null);
    if (!order) return;
    setPlaced(order);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Shell step={step}>
      <div className="cart-layout">
        {step === 2 ? (
          <div>
            {!customer && (
              <p className="mb-4 text-sm text-ink-3">
                Have an account? <Link to="/login?next=/checkout" className="text-brand-600 underline">Sign in</Link> to fill this in, or carry on as a guest.
              </p>
            )}
            <DeliveryForm defaults={details} settings={bag.settings} onRegion={setRegion} onSubmit={review} onBack={() => navigate("/cart")} />
          </div>
        ) : (
          <ReviewOrder
            bag={bag}
            details={details}
            money={money}
            address={bag.settings.address}
            onPlace={place}
            onBack={() => setStep(2)}
            placing={placeOrder.isPending}
            error={placeOrder.error?.message}
          />
        )}
        <OrderSummary bag={bag} region={region}>
          <p className="mt-4 text-[.78rem] text-ink-4">
            By placing an order you agree to our <Link to="/terms" className="underline">terms of sale</Link>,{" "}
            <Link to="/returns" className="underline">exchanges policy</Link> and <Link to="/privacy" className="underline">privacy policy</Link>.
          </p>
        </OrderSummary>
      </div>
    </Shell>
  );
}
