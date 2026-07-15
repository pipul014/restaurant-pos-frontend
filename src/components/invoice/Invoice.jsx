//final kds
import React, { useMemo, useRef } from "react";

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const billableStatuses = ["SERVED", "PAID"];

const Invoice = ({ orderInfo, setShowInvoice, clearOrder }) => {
  const invoiceRef = useRef(null);

  const billableItems = useMemo(() => {
    return (
      orderInfo?.items?.filter((item) =>
        billableStatuses.includes(item.status),
      ) || []
    );
  }, [orderInfo]);

  const orderDate = new Date(orderInfo?.createdAt || Date.now());

  const invoiceLink = `${window.location.origin}/public/invoice/${orderInfo?.invoiceNo}`;

  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printContent = invoiceRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=350,height=700");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SAS CAFE Receipt</title>
          <style>
            @page { size: 58mm auto; margin: 0; }
            * { box-sizing: border-box; }
            html, body {
              width: 54mm;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              overflow: hidden;
              font-family: Arial, sans-serif;
              font-size: 9px;
            }
            .receipt {
              width: 46mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff;
              color: #000;
            }
            .line {
              border-top: 1px dashed #000;
              margin: 3px 0;
              width: 100%;
            }
            .row {
              display: flex;
              justify-content: space-between;
              gap: 3px;
              width: 100%;
              font-size: 9px;
              line-height: 1.25;
              margin-bottom: 1px;
            }
            .item {
              margin-bottom: 4px;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="receipt">${printContent}</div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();

      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  const handlePdf = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const phone = orderInfo?.customerDetails?.phone || "";

    if (!phone) {
      alert("Customer phone number is required for WhatsApp sharing.");
      return;
    }

    const message = encodeURIComponent(
      `🍽️ Thank you for visiting SAS CAFE

Invoice No: ${orderInfo?.invoiceNo || "N/A"}

Amount Paid: ${formatMoney(orderInfo?.grandTotal)}

View Invoice:
${invoiceLink}

Thank you. Visit Again 🙏`,
    );

    const cleanPhone = phone.replace(/\D/g, "");
    const finalPhone = cleanPhone.startsWith("91")
      ? cleanPhone
      : `91${cleanPhone}`;

    window.open(`https://wa.me/${finalPhone}?text=${message}`, "_blank");
  };

  const handleClose = () => {
    clearOrder?.();
    setShowInvoice(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-[340px]">
        <div
          ref={invoiceRef}
          style={{
            width: "46mm",
            margin: 0,
            padding: 0,
            background: "#fff",
            color: "#000",
            fontFamily: "Arial, sans-serif",
            fontSize: "8px",
          }}
        >
          <div style={styles.shopName}>SAS CAFE & RESTAURANT</div>
          <div style={styles.small}>Pathar Pratima Bus Stand</div>
          <div style={styles.small}>South 24 Parganas</div>
          <div style={styles.small}>Phone: +91 6296013236</div>

          <Line />

          <div style={styles.title}>INVOICE</div>

          <InfoRow label="Invoice" value={orderInfo?.invoiceNo || "N/A"} />
          <InfoRow label="Order" value={orderInfo?.orderNumber || "N/A"} />
          <InfoRow
            label="Date"
            value={
              isNaN(orderDate.getTime())
                ? "N/A"
                : orderDate.toLocaleDateString("en-IN")
            }
          />
          <InfoRow
            label="Time"
            value={
              isNaN(orderDate.getTime())
                ? "N/A"
                : orderDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
            }
          />

          <Line />

          <InfoRow
            label="Customer"
            value={orderInfo?.customerDetails?.name || "Walk-In Customer"}
          />

          {orderInfo?.customerDetails?.phone && (
            <InfoRow label="Phone" value={orderInfo.customerDetails.phone} />
          )}

          <InfoRow
            label="Type"
            value={
              orderInfo?.orderType === "dinein"
                ? `Dine-In / Table ${orderInfo?.table?.tableNo || "N/A"}`
                : orderInfo?.orderType === "takeaway"
                  ? "Takeaway"
                  : "Walk-In"
            }
          />

          {orderInfo?.customerDetails?.systemNotes && (
            <InfoRow
              label="Note"
              value={orderInfo.customerDetails.systemNotes}
            />
          )}

          <Line />

          <div style={styles.headerRow}>
            <span style={{ width: "42%" }}>Item</span>
            <span style={{ width: "15%", textAlign: "right" }}>Qty</span>
            <span style={{ width: "20%", textAlign: "right" }}>Rate</span>
            <span style={{ width: "23%", textAlign: "right" }}>Amt</span>
          </div>

          <Line />

          {billableItems.length === 0 ? (
            <div style={styles.small}>No served billable items</div>
          ) : (
            billableItems.map((item) => {
              const qty = Number(item.quantity || 1);
              const finalPrice = Number(item.finalItemPrice || 0);
              const amount = finalPrice * qty;

              return (
                <div key={item._id || item.id} style={styles.item}>
                  <div style={styles.itemName}>{item.name}</div>

                  <div style={styles.row}>
                    <span>
                      {qty} x {formatMoney(finalPrice)}
                    </span>
                    <span>{formatMoney(amount)}</span>
                  </div>

                  {Number(item.categoryDiscountPercent || 0) > 0 && (
                    <div style={styles.small}>
                      {item.categoryName || "Category"} Discount:{" "}
                      {item.categoryDiscountPercent}% | Original:{" "}
                      {formatMoney(item.originalPrice)}
                    </div>
                  )}

                  {item.notes && (
                    <div style={styles.small}>Note: {item.notes}</div>
                  )}
                </div>
              );
            })
          )}

          <Line />

          <AmountRow label="Served Subtotal" value={orderInfo?.subtotal} />
          <AmountRow
            label="Category Discount"
            value={orderInfo?.categoryDiscountTotal}
          />
          <AmountRow
            label="Bill Discount"
            value={orderInfo?.billDiscountAmount}
          />

          <Line />

          <div style={styles.totalRow}>
            <span>Grand Total</span>
            <span>{formatMoney(orderInfo?.grandTotal)}</span>
          </div>

          <AmountRow label="Paid" value={orderInfo?.paidAmount} />
          <AmountRow label="Due" value={orderInfo?.dueAmount} />

          <Line />

          <InfoRow label="Payment" value={orderInfo?.paymentMethod || "N/A"} />

          {(orderInfo?.paymentData?.paymentReference ||
            orderInfo?.paymentData?.razorpay_payment_id) && (
            <InfoRow
              label="Ref"
              value={
                orderInfo?.paymentData?.paymentReference ||
                orderInfo?.paymentData?.razorpay_payment_id
              }
            />
          )}

          <InfoRow
            label="Status"
            value={orderInfo?.paymentStatus || "PENDING"}
          />

          <Line />

          <div style={styles.footer}>
            <div style={styles.thanks}>THANK YOU!</div>
            <div style={styles.small}>Please visit again.</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handlePrint}
            className="bg-[#1f1f1f] text-white py-2 rounded-lg text-sm font-bold"
          >
            Print
          </button>

          <button
            onClick={handlePdf}
            className="bg-[#f6b100] text-black py-2 rounded-lg text-sm font-bold"
          >
            PDF
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="bg-green-500 text-white py-2 rounded-lg text-sm font-bold"
          >
            WhatsApp
          </button>

          <button
            onClick={handleClose}
            className="bg-red-500 text-white py-2 rounded-lg text-sm font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Line = () => <div style={styles.line} />;

const InfoRow = ({ label, value }) => (
  <div style={styles.row}>
    <span>{label}:</span>
    <span style={{ textAlign: "right", wordBreak: "break-word" }}>{value}</span>
  </div>
);

const AmountRow = ({ label, value }) => (
  <div style={styles.row}>
    <span>{label}:</span>
    <span>{formatMoney(value)}</span>
  </div>
);

const styles = {
  shopName: {
    fontSize: "12px",
    fontWeight: 900,
    lineHeight: 1.2,
    textTransform: "uppercase",
  },
  small: {
    fontSize: "10px",
    lineHeight: 1.2,
  },
  title: {
    fontSize: "10px",
    fontWeight: 900,
    margin: "3px 0",
  },
  line: {
    borderTop: "1px dashed #000",
    margin: "3px 0",
    width: "100%",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "3px",
    width: "100%",
    fontSize: "9px",
    lineHeight: 1.25,
    marginBottom: "1px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9px",
    fontWeight: 900,
  },
  item: {
    marginBottom: "4px",
    pageBreakInside: "avoid",
  },
  itemName: {
    fontSize: "9px",
    fontWeight: 800,
    lineHeight: 1.25,
    wordBreak: "break-word",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    fontSize: "10px",
    fontWeight: 900,
    lineHeight: 1.3,
  },
  footer: {
    marginTop: "4px",
  },
  thanks: {
    fontSize: "10px",
    fontWeight: 900,
  },
};

export default Invoice;
