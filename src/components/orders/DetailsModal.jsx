import SmallModal from "./SmallModal";
import BillSummary from "./BillSummary";
import StatusBadge from "./StatusBadge";
import { displayStatus } from "./statusMapper";

const DetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const items = order.items || [];

  const pendingCount = items.filter((item) => item.status === "PENDING").length;

  const preparingCount = items.filter(
    (item) => item.status === "PREPARING",
  ).length;

  const readyCount = items.filter((item) => item.status === "READY").length;

  const cancelledCount = items.filter((item) =>
    ["CANCELLED", "REJECTED"].includes(item.status),
  ).length;

  return (
    <SmallModal
      title={`Order Details - ${
        order.orderNumber || order.invoiceNo || order._id
      }`}
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Order Information */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Order Information</h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Invoice" value={order.invoiceNo || "N/A"} />

            <Info label="Order No" value={order.orderNumber || "N/A"} />

            <Info
              label="Status"
              value={<StatusBadge status={order.orderStatus} small />}
            />

            <Info label="Payment" value={displayStatus(order.paymentStatus)} />

            <Info label="Method" value={order.paymentMethod || "Pending"} />

            <Info
              label="Created"
              value={
                order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN")
                  : "N/A"
              }
            />
          </div>
        </div>

        {/* Customer */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">
            Customer Information
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info
              label="Name"
              value={order.customerDetails?.name || "Walk-In Customer"}
            />

            <Info label="Phone" value={order.customerDetails?.phone || "N/A"} />

            <Info label="Guests" value={order.customerDetails?.guests || 1} />

            <Info label="Type" value={displayStatus(order.orderType)} />

            {order.table?.tableNo && (
              <Info label="Table" value={`Table ${order.table.tableNo}`} />
            )}
          </div>

          {order.customerDetails?.systemNotes && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-400 text-xs font-semibold">Notes</p>

              <p className="text-white text-sm mt-1">
                {order.customerDetails.systemNotes}
              </p>
            </div>
          )}
        </div>

        {/* Item Summary */}
        <div className="grid grid-cols-4 gap-2">
          <CountBox
            label="Pending"
            count={pendingCount}
            color="text-yellow-400"
          />

          <CountBox
            label="Preparing"
            count={preparingCount}
            color="text-blue-400"
          />

          <CountBox label="Ready" count={readyCount} color="text-green-400" />

          <CountBox
            label="Cancelled"
            count={cancelledCount}
            color="text-red-400"
          />
        </div>

        {/* Items */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">
            Order Items ({items.length})
          </h3>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="border border-[#333] rounded-lg p-3"
              >
                <div className="flex justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold break-words">
                      {item.name}
                    </h4>

                    <p className="text-[#ababab] text-xs mt-1">
                      Qty: {item.quantity}
                    </p>

                    <p className="text-[#ababab] text-xs">
                      Rate: ₹{item.finalItemPrice || item.originalPrice || 0}
                    </p>

                    <p className="text-white text-xs font-semibold">
                      Total: ₹
                      {(
                        (item.finalItemPrice || item.originalPrice || 0) *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                    {item.notes && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Note: {item.notes}
                      </p>
                    )}

                    {item.cancellationReason && (
                      <p className="text-red-400 text-xs mt-1">
                        Cancelled: {item.cancellationReason}
                      </p>
                    )}

                    {item.rejectionReason && (
                      <p className="text-red-400 text-xs mt-1">
                        Rejected: {item.rejectionReason}
                      </p>
                    )}
                  </div>

                  <StatusBadge status={item.status} small />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <BillSummary order={order} />
      </div>
    </SmallModal>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-[#ababab] text-xs">{label}</p>

    <div className="text-white text-sm mt-1">{value}</div>
  </div>
);

const CountBox = ({ label, count, color }) => (
  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
    <p className="text-[#ababab] text-xs">{label}</p>

    <h4 className={`font-bold text-lg mt-1 ${color}`}>{count}</h4>
  </div>
);

export default DetailsModal;
