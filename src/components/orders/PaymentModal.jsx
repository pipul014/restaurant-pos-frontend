import SmallModal from "./SmallModal";
import BillSummary from "./BillSummary";
import { PAYMENT_METHODS } from "./constants";

const PaymentModal = ({
  payData,
  paymentMethod,
  setPaymentMethod,
  paymentReference,
  setPaymentReference,
  onClose,
  onSubmit,
  loading,
}) => {
  return (
    <SmallModal title="Collect Payment" onClose={onClose}>
      <BillSummary order={payData} />

      <div className="grid grid-cols-3 gap-2 mt-4">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            onClick={() => setPaymentMethod(method)}
            className={`py-3 rounded-xl font-bold ${
              paymentMethod === method
                ? "bg-[#f6b100] text-black"
                : "bg-[#1f1f1f] text-[#ababab]"
            }`}
          >
            {method}
          </button>
        ))}
      </div>

      {(paymentMethod === "QR" || paymentMethod === "Online") && (
        <input
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Payment reference / UPI transaction ID"
          className="w-full mt-4 bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
        />
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </SmallModal>
  );
};

export default PaymentModal;
