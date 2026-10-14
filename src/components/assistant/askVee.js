/* Ask Vee */

// Opens the fit assistant from anywhere, optionally with a question already
// sent (Quivogue's window.askVee). FitAssistant listens for the event, so
// pages never import the widget.
const EVENT = "qvfits:ask-vee";

export function askVee(question = "") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { question } }));
}

export function onAskVee(handler) {
  const listener = (e) => handler(e.detail?.question ?? "");
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
