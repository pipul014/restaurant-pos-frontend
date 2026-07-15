import AmountRow from "./AmountRow";

const BillSummary = ({ order }) => {
  const isPostBilling = order?.workflow === "POST_BILLING";
  const totalDiscount =
    Number(order.categoryDiscountTotal || 0) +
    Number(order.billDiscountAmount || 0);

  return (
    <div className="mt-4 bg-[#1f1f1f] border border-[#333] rounded-2xl p-4 space-y-2">
      <AmountRow label={isPostBilling ? "Billable Subtotal" : "Served Subtotal"} value={order.subtotal} />

      <AmountRow
        label="Category-wise Discount"
        value={order.categoryDiscountTotal}
        discount
      />

      <AmountRow label="Total Discount" value={totalDiscount} discount />

      <div className="border-t border-[#333] pt-2">
        <AmountRow label="Grand Total" value={order.grandTotal} highlight />
      </div>
    </div>
  );
};

export default BillSummary;
