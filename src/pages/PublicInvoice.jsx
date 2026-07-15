import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublicInvoice } from "../https";

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const BILLABLE_STATUSES = ["SERVED", "PAID"];

const PublicInvoice = () => {
  const { invoiceNo } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-invoice", invoiceNo],
    queryFn: () => getPublicInvoice(invoiceNo),
    enabled: Boolean(invoiceNo),
    retry: 1,
  });

  const order = data?.data?.data;

  const billableItems = useMemo(() => {
    return (
      order?.items?.filter((item) =>
        BILLABLE_STATUSES.includes(String(item.status || "").toUpperCase()),
      ) || []
    );
  }, [order]);

  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4">
        <p className="text-gray-700 font-semibold">Loading invoice...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md text-center">
          <h1 className="text-red-600 text-xl font-bold">
            Invoice not available
          </h1>

          <p className="text-gray-600 mt-2 text-sm">
            {error?.response?.data?.message ||
              "This invoice could not be opened."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f4f4f4] p-4 flex justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow p-5">
        <div className="text-center">
          <h1 className="text-xl font-black">SAS CAFE & RESTAURANT</h1>
          <p className="text-sm text-gray-600">Pathar Pratima Bus Stand</p>
          <p className="text-sm text-gray-600">South 24 Parganas</p>
          <p className="text-sm text-gray-600">Phone: +91 9999999999</p>
        </div>

        <hr className="my-4" />

        <h2 className="text-center font-bold text-lg">CUSTOMER BILL</h2>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Invoice" value={order?.invoiceNo} />
          <Info label="Order" value={order?.orderNumber} />
          <Info
            label="Date"
            value={
              order?.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : "N/A"
            }
          />
          <Info label="Payment" value={order?.paymentMethod || "N/A"} />
          <Info
            label="Customer"
            value={order?.customerDetails?.name || "Walk-In Customer"}
          />
          <Info label="Phone" value={order?.customerDetails?.phone || "N/A"} />
          <Info
            label="Type"
            value={
              order?.orderType === "dinein"
                ? `Dine-In / Table ${order?.table?.tableNo || "N/A"}`
                : order?.orderType === "takeaway"
                  ? "Takeaway"
                  : "Walk-In"
            }
          />
          <Info label="Status" value={order?.paymentStatus || "PENDING"} />
        </div>

        <hr className="my-4" />

        <h3 className="font-bold mb-3">Items</h3>

        <div className="space-y-3">
          {billableItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No billable items.</p>
          ) : (
            billableItems.map((item) => {
              const qty = Number(item.quantity || 1);
              const rate = Number(
                item.finalItemPrice || item.originalPrice || 0,
              );
              const total = qty * rate;

              return (
                <div
                  key={item._id || item.name}
                  className="border rounded-lg p-3 text-sm"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    <p className="font-semibold">{formatMoney(total)}</p>
                  </div>

                  <p className="text-gray-500 text-xs mt-1">
                    {qty} × {formatMoney(rate)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <hr className="my-4" />

        <AmountRow label="Subtotal" value={order?.subtotal} />
        <AmountRow
          label="Category Discount"
          value={order?.categoryDiscountTotal}
          discount
        />
        <AmountRow
          label="Bill Discount"
          value={order?.billDiscountAmount}
          discount
        />

        <div className="flex justify-between font-black text-lg mt-3">
          <span>Grand Total</span>
          <span>{formatMoney(order?.grandTotal)}</span>
        </div>

        <AmountRow label="Paid" value={order?.paidAmount} />
        <AmountRow label="Due" value={order?.dueAmount} />

        <button
          onClick={() => window.print()}
          className="mt-5 w-full bg-black text-white py-3 rounded-lg font-bold"
        >
          Print / Save PDF
        </button>

        <p className="text-center text-xs text-gray-500 mt-5">
          Thank you for visiting us.
        </p>
      </div>
    </section>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-semibold break-words">{value || "N/A"}</p>
  </div>
);

const AmountRow = ({ label, value, discount }) => (
  <div className="flex justify-between text-sm py-1">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold">
      {discount && Number(value || 0) > 0 ? "-" : ""}
      {formatMoney(value)}
    </span>
  </div>
);

export default PublicInvoice;
