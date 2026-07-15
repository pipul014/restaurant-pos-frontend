import { useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

const PAYMENT_METHODS = ["Cash", "QR", "Online"];
const DISCOUNT_TYPES = [
  { value: "NONE", label: "No Discount" },
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED", label: "Fixed Amount (₹)" },
];

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const PostBillingCheckoutModal = ({
  open,
  customerData,
  originalTotal,
  categoryDiscountTotal,
  cartTotal,
  totalItems,
  loading,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState(customerData.customerName || "");
  const [phone, setPhone] = useState(customerData.customerPhone || "");
  const [systemNotes, setSystemNotes] = useState(
    customerData.systemNotes || "",
  );
  const [discountType, setDiscountType] = useState("NONE");
  const [discountValue, setDiscountValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");

  const billDiscountAmount = useMemo(() => {
    const value = Math.max(Number(discountValue || 0), 0);

    if (discountType === "PERCENTAGE") {
      return Math.min((Number(cartTotal || 0) * value) / 100, cartTotal);
    }

    if (discountType === "FIXED") {
      return Math.min(value, Number(cartTotal || 0));
    }

    return 0;
  }, [cartTotal, discountType, discountValue]);

  const finalTotal = Math.max(
    Number(cartTotal || 0) - Number(billDiscountAmount || 0),
    0,
  );

  if (!open) return null;

  const handleSubmit = () => {
    onConfirm({
      customerDetails: {
        name: name.trim(),
        phone: phone.trim(),
        systemNotes: systemNotes.trim(),
        guests: customerData.guests || 1,
      },
      billDiscountType: discountType,
      billDiscountValue:
        discountType === "NONE" ? 0 : Math.max(Number(discountValue || 0), 0),
      paymentMethod,
      paymentReference: paymentReference.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#3a3a3a] bg-[#262626] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Review & Pay Bill
            </h2>
            <p className="mt-1 text-sm text-[#ababab]">
              Update customer details, apply discount and collect payment.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1f1f1f] text-white disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer Name">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Walk-In Customer"
              className="input-style"
            />
          </Field>

          <Field label="Customer Phone">
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="numeric"
              placeholder="Phone number"
              className="input-style"
            />
          </Field>
        </div>

        <Field label="Customer / Bill Note" className="mt-4">
          <textarea
            value={systemNotes}
            onChange={(event) => setSystemNotes(event.target.value)}
            placeholder="Optional note"
            className="input-style min-h-[92px] resize-none"
          />
        </Field>

        <div className="mt-6 rounded-2xl border border-[#333] bg-[#1f1f1f] p-4">
          <h3 className="font-black text-white">Discount</h3>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Discount Type">
              <select
                value={discountType}
                onChange={(event) => {
                  setDiscountType(event.target.value);
                  if (event.target.value === "NONE") setDiscountValue("");
                }}
                className="input-style"
              >
                {DISCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Discount Value">
              <input
                type="number"
                min="0"
                max={discountType === "PERCENTAGE" ? 100 : undefined}
                value={discountValue}
                disabled={discountType === "NONE"}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder={
                  discountType === "PERCENTAGE" ? "Example: 10" : "Example: 50"
                }
                className="input-style disabled:cursor-not-allowed disabled:opacity-50"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#333] bg-[#1f1f1f] p-4">
          <h3 className="font-black text-white">Payment</h3>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-xl py-3 text-sm font-black transition ${
                  paymentMethod === method
                    ? "bg-[#f6b100] text-black"
                    : "bg-[#2b2b2b] text-[#ababab] hover:text-white"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {(paymentMethod === "QR" || paymentMethod === "Online") && (
            <input
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
              placeholder="Payment reference / UPI transaction ID"
              className="input-style mt-4"
            />
          )}
        </div>

        <div className="mt-6 space-y-2 rounded-2xl border border-[#333] bg-[#1f1f1f] p-4">
          <SummaryRow label="Total Items" value={totalItems} plain />
          <SummaryRow label="Original Subtotal" value={originalTotal} />
          <SummaryRow
            label="Category Discount"
            value={categoryDiscountTotal}
            discount
          />
          <SummaryRow
            label="Bill Discount"
            value={billDiscountAmount}
            discount
          />
          <div className="mt-2 border-t border-[#333] pt-3">
            <SummaryRow label="Amount To Pay" value={finalTotal} highlight />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl bg-[#1f1f1f] py-3 font-black text-white disabled:opacity-50"
          >
            Back To Cart
          </button>

          <button
            type="button"
            disabled={loading || finalTotal <= 0}
            onClick={handleSubmit}
            className="rounded-xl bg-green-500 py-3 font-black text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing Payment..." : `Pay ${formatMoney(finalTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-2 block text-sm font-bold text-[#ababab]">{label}</span>
    {children}
  </label>
);

const SummaryRow = ({ label, value, plain, discount, highlight }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm font-semibold text-[#ababab]">{label}</span>
    <span
      className={`font-black ${
        highlight
          ? "text-lg text-[#f6b100]"
          : discount
            ? "text-green-400"
            : "text-white"
      }`}
    >
      {plain
        ? value
        : `${discount && Number(value || 0) > 0 ? "-" : ""}${formatMoney(value)}`}
    </span>
  </div>
);

export default PostBillingCheckoutModal;
