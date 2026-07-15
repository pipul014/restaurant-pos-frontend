// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getPublicOrderTracking } from "../https";
// import {
//   joinPublicTrackingRoom,
//   leavePublicTrackingRoom,
//   publicTrackingSocket,
//   disconnectPublicTrackingSocket,
// } from "../socket/socket";

// const formatTime = (seconds = 0) => {
//   const safeSeconds = Math.max(Number(seconds || 0), 0);
//   const minutes = Math.floor(safeSeconds / 60);
//   const remainingSeconds = safeSeconds % 60;

//   return `${String(minutes).padStart(2, "0")}:${String(
//     remainingSeconds,
//   ).padStart(2, "0")}`;
// };

// const getItemRemainingSeconds = (item) => {
//   const status = String(item?.status || "").toUpperCase();

//   if (!["ACCEPTED", "PREPARING"].includes(status)) return 0;
//   if (!item?.expectedReadyAt) return 0;

//   const end = new Date(item.expectedReadyAt).getTime();

//   if (!Number.isFinite(end)) return 0;

//   return Math.max(0, Math.ceil((end - Date.now()) / 1000));
// };

// const getStatusLabel = (status = "") => {
//   const value = String(status || "").toUpperCase();

//   const map = {
//     SENT_TO_KITCHEN: "Order Placed",
//     PENDING: "Waiting",
//     ACCEPTED: "Accepted",
//     PREPARING: "Preparing",
//     PARTIALLY_READY: "Partially Ready",
//     READY: "Ready",
//     SERVED: "Served",
//     PAYMENT_PENDING: "Payment Pending",
//     PAID: "Completed",
//     COMPLETED: "Completed",
//     CANCELLED: "Cancelled",
//     REJECTED: "Rejected",
//     REMOVED: "Removed",
//   };

//   return map[value] || value.replaceAll("_", " ") || "Tracking";
// };

// const getItemIcon = (status = "") => {
//   const value = String(status || "").toUpperCase();

//   if (["READY", "SERVED", "PAID", "COMPLETED"].includes(value)) return "✅";
//   if (["PREPARING", "ACCEPTED"].includes(value)) return "⏳";
//   if (["CANCELLED", "REJECTED", "REMOVED"].includes(value)) return "❌";

//   return "🟡";
// };

// const getProgressPercent = (status = "") => {
//   const value = String(status || "").toUpperCase();

//   if (value === "SENT_TO_KITCHEN") return 20;
//   if (value === "PREPARING") return 50;
//   if (value === "PARTIALLY_READY") return 70;
//   if (["READY", "PAYMENT_PENDING"].includes(value)) return 90;
//   if (["PAID", "COMPLETED", "CANCELLED", "REJECTED"].includes(value))
//     return 100;

//   return 30;
// };

// const isCompletedStatus = (status = "", paymentStatus = "") => {
//   const orderStatus = String(status || "").toUpperCase();
//   const payStatus = String(paymentStatus || "").toUpperCase();

//   return (
//     ["PAID", "COMPLETED", "CANCELLED", "REJECTED"].includes(orderStatus) ||
//     payStatus === "PAID"
//   );
// };

// const PublicOrderTracking = () => {
//   const { token } = useParams();

//   const [trackingData, setTrackingData] = useState(null);
//   const [remainingSeconds, setRemainingSeconds] = useState(0);
//   const [tick, setTick] = useState(Date.now());
//   const [loading, setLoading] = useState(true);
//   const [expired, setExpired] = useState(false);
//   const [error, setError] = useState("");
//   const [connected, setConnected] = useState(false);

//   const orderStatus = trackingData?.orderStatus || "";
//   const paymentStatus = trackingData?.paymentStatus || "";

//   const progress = useMemo(
//     () => getProgressPercent(orderStatus),
//     [orderStatus],
//   );

//   useEffect(() => {
//     let isMounted = true;

//     const fetchTracking = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await getPublicOrderTracking(token);
//         const data = response?.data?.data || response?.data;

//         if (!isMounted) return;

//         if (!data || data.expired) {
//           setExpired(true);
//           setTrackingData(data || null);
//           return;
//         }

//         setTrackingData(data);
//         setRemainingSeconds(Number(data.estimatedRemainingSeconds || 0));

//         if (isCompletedStatus(data.orderStatus, data.paymentStatus)) {
//           setExpired(true);
//         }
//       } catch (err) {
//         if (!isMounted) return;

//         setError(
//           err?.response?.data?.message ||
//             "Tracking link is expired or unavailable.",
//         );
//         setExpired(true);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchTracking();

//     return () => {
//       isMounted = false;
//     };
//   }, [token]);

//   useEffect(() => {
//     if (!token || expired) return;

//     joinPublicTrackingRoom(token, (response) => {
//       setConnected(Boolean(response?.success));
//     });

//     const handleConnect = () => setConnected(true);
//     const handleDisconnect = () => setConnected(false);

//     const handleTrackingUpdated = (payload) => {
//       const nextData = payload?.data || payload;
//       if (!nextData) return;

//       setTrackingData(nextData);
//       setRemainingSeconds(Number(nextData.estimatedRemainingSeconds || 0));

//       if (isCompletedStatus(nextData.orderStatus, nextData.paymentStatus)) {
//         setExpired(true);
//       }
//     };

//     const handleTrackingExpired = (payload) => {
//       setExpired(true);
//       setTrackingData((prev) => ({
//         ...(prev || {}),
//         ...(payload || {}),
//       }));
//       setRemainingSeconds(0);
//     };

//     publicTrackingSocket.on("connect", handleConnect);
//     publicTrackingSocket.on("disconnect", handleDisconnect);
//     publicTrackingSocket.on("TRACKING_UPDATED", handleTrackingUpdated);
//     publicTrackingSocket.on("TRACKING_EXPIRED", handleTrackingExpired);

//     return () => {
//       leavePublicTrackingRoom(token);
//       publicTrackingSocket.off("connect", handleConnect);
//       publicTrackingSocket.off("disconnect", handleDisconnect);
//       publicTrackingSocket.off("TRACKING_UPDATED", handleTrackingUpdated);
//       publicTrackingSocket.off("TRACKING_EXPIRED", handleTrackingExpired);
//       disconnectPublicTrackingSocket();
//     };
//   }, [token, expired]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTick(Date.now());
//       setRemainingSeconds((prev) => Math.max(Number(prev || 0) - 1, 0));
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
//         <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
//           <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-500" />
//           <h1 className="mt-5 text-xl font-bold text-gray-900">
//             Loading your order
//           </h1>
//           <p className="mt-2 text-sm text-gray-500">
//             Connecting live tracking...
//           </p>
//         </div>
//       </main>
//     );
//   }

//   if (expired || error) {
//     return (
//       <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-6">
//         <section className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
//           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
//             ✅
//           </div>

//           <h1 className="mt-5 text-2xl font-black text-gray-900">
//             Order Completed
//           </h1>

//           <p className="mt-3 text-sm leading-6 text-gray-600">
//             {error || "This tracking link has expired. Thank you for ordering."}
//           </p>

//           {trackingData?.orderNumber && (
//             <div className="mt-5 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
//               Order: {trackingData.orderNumber}
//             </div>
//           )}
//         </section>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-[#0f172a] px-4 py-5 sm:px-6">
//       <section className="mx-auto w-full max-w-md">
//         <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
//           <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-gray-950">
//             <div className="flex items-start justify-between gap-3">
//               <div>
//                 <p className="text-xs font-bold uppercase tracking-widest opacity-80">
//                   Live Order Tracking
//                 </p>
//                 <h1 className="mt-2 text-2xl font-black">
//                   {trackingData?.orderNumber || "Your Order"}
//                 </h1>
//               </div>

//               <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold">
//                 {connected ? "Live" : "Connecting"}
//               </div>
//             </div>

//             <div className="mt-6 flex items-end justify-between gap-3">
//               <div>
//                 <p className="text-sm font-semibold opacity-80">Status</p>
//                 <p className="mt-1 text-2xl font-black">
//                   {getStatusLabel(orderStatus)}
//                 </p>
//               </div>

//               <div className="text-right">
//                 <p className="text-sm font-semibold opacity-80">Time Left</p>
//                 <p className="mt-1 text-2xl font-black">
//                   {remainingSeconds > 0
//                     ? formatTime(remainingSeconds)
//                     : "--:--"}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/40">
//               <div
//                 className="h-full rounded-full bg-gray-950 transition-all duration-500"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>

//           <div className="p-5">
//             <div className="rounded-3xl bg-gray-50 p-4">
//               <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">
//                 Order Journey
//               </h2>

//               <div className="mt-4 space-y-4">
//                 {["Order Placed", "Kitchen Accepted", "Preparing", "Ready"].map(
//                   (step, index) => {
//                     const active =
//                       progress >= [20, 40, 50, 90][index] ||
//                       getStatusLabel(orderStatus) === step;

//                     return (
//                       <div key={step} className="flex items-center gap-3">
//                         <div
//                           className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
//                             active
//                               ? "bg-green-500 text-white"
//                               : "bg-gray-200 text-gray-500"
//                           }`}
//                         >
//                           {active ? "✓" : index + 1}
//                         </div>

//                         <p
//                           className={`text-sm font-bold ${
//                             active ? "text-gray-900" : "text-gray-400"
//                           }`}
//                         >
//                           {step}
//                         </p>
//                       </div>
//                     );
//                   },
//                 )}
//               </div>
//             </div>

//             <div className="mt-5">
//               <h2 className="text-lg font-black text-gray-900">Items</h2>

//               <div className="mt-3 space-y-3">
//                 {(trackingData?.items || []).map((item, index) => {
//                   const itemSeconds = getItemRemainingSeconds(item);

//                   return (
//                     <div
//                       key={`${item.name}-${index}-${tick}`}
//                       className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
//                     >
//                       <div className="min-w-0">
//                         <p className="truncate text-sm font-black text-gray-900">
//                           {getItemIcon(item.status)} {item.name}
//                         </p>

//                         <p className="mt-1 text-xs font-semibold text-gray-500">
//                           Qty: {item.quantity || 1}
//                         </p>
//                       </div>

//                       <div className="shrink-0 text-right">
//                         <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-700">
//                           {getStatusLabel(item.status)}
//                         </span>

//                         {itemSeconds > 0 && (
//                           <p className="mt-1 text-xs font-black text-orange-600">
//                             {formatTime(itemSeconds)}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             <p className="mt-6 text-center text-xs leading-5 text-gray-400">
//               This page updates automatically. No refresh or login required.
//             </p>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default PublicOrderTracking;

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicOrderTracking } from "../https";
import {
  joinPublicTrackingRoom,
  leavePublicTrackingRoom,
  publicTrackingSocket,
  disconnectPublicTrackingSocket,
} from "../socket/socket";

import OrderPieProgress from "../components/shared/OrderPieProgress";

const formatTime = (seconds = 0) => {
  const safeSeconds = Math.max(Number(seconds || 0), 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

const getStatusLabel = (status = "") => {
  const value = String(status || "").toUpperCase();

  const map = {
    SENT_TO_KITCHEN: "Order Placed",
    PENDING: "Waiting",
    ACCEPTED: "Accepted",
    PREPARING: "Preparing",
    PARTIALLY_READY: "Partially Ready",
    READY: "Ready",
    SERVED: "Served",
    PAYMENT_PENDING: "Payment Pending",
    PAID: "Completed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
    REMOVED: "Removed",
  };

  return map[value] || value.replaceAll("_", " ") || "Tracking";
};

const getItemIcon = (status = "") => {
  const value = String(status || "").toUpperCase();

  if (["READY", "SERVED", "PAID", "COMPLETED"].includes(value)) return "✅";
  if (["PREPARING", "ACCEPTED"].includes(value)) return "⏳";
  if (["CANCELLED", "REJECTED", "REMOVED"].includes(value)) return "❌";

  return "🟡";
};

const getItemRemainingSeconds = (item) => {
  const status = String(item?.status || "").toUpperCase();

  if (!["ACCEPTED", "PREPARING"].includes(status)) return 0;
  if (!item?.expectedReadyAt) return 0;

  const end = new Date(item.expectedReadyAt).getTime();

  if (!Number.isFinite(end)) return 0;

  return Math.max(0, Math.ceil((end - Date.now()) / 1000));
};

const getProgressInfo = (items = []) => {
  const activeItems = items.filter(
    (item) =>
      !["CANCELLED", "REJECTED", "REMOVED"].includes(
        String(item.status || "").toUpperCase(),
      ),
  );

  const ready = activeItems.filter((item) =>
    ["READY", "SERVED", "PAID", "COMPLETED"].includes(
      String(item.status || "").toUpperCase(),
    ),
  ).length;

  const preparing = activeItems.filter((item) =>
    ["ACCEPTED", "PREPARING"].includes(String(item.status || "").toUpperCase()),
  ).length;

  const waiting = activeItems.filter((item) =>
    ["PENDING", "SENT_TO_KITCHEN"].includes(
      String(item.status || "").toUpperCase(),
    ),
  ).length;

  const total = activeItems.length;
  const percent = total ? Math.round((ready / total) * 100) : 0;

  return {
    total,
    ready,
    preparing,
    waiting,
    percent,
  };
};

const isCompletedStatus = (status = "", paymentStatus = "") => {
  const orderStatus = String(status || "").toUpperCase();
  const payStatus = String(paymentStatus || "").toUpperCase();

  return (
    ["PAID", "COMPLETED", "CANCELLED", "REJECTED"].includes(orderStatus) ||
    payStatus === "PAID"
  );
};

const PublicOrderTracking = () => {
  const { token } = useParams();

  const [trackingData, setTrackingData] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const orderStatus = trackingData?.orderStatus || "";
  const paymentStatus = trackingData?.paymentStatus || "";

  const progressInfo = useMemo(
    () => getProgressInfo(trackingData?.items || []),
    [trackingData?.items],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPublicOrderTracking(token);
        const data = response?.data?.data || response?.data;

        if (!isMounted) return;

        if (!data || data.expired) {
          setExpired(true);
          setTrackingData(data || null);
          return;
        }

        setTrackingData(data);
        setRemainingSeconds(Number(data.estimatedRemainingSeconds || 0));

        if (isCompletedStatus(data.orderStatus, data.paymentStatus)) {
          setExpired(true);
        }
      } catch (err) {
        if (!isMounted) return;

        setError(
          err?.response?.data?.message ||
            "Tracking link is expired or unavailable.",
        );
        setExpired(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTracking();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || expired) return;

    joinPublicTrackingRoom(token, (response) => {
      setConnected(Boolean(response?.success));
    });

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleTrackingUpdated = (payload) => {
      const nextData = payload?.data || payload;
      if (!nextData) return;

      setTrackingData(nextData);
      setRemainingSeconds(Number(nextData.estimatedRemainingSeconds || 0));

      if (isCompletedStatus(nextData.orderStatus, nextData.paymentStatus)) {
        setExpired(true);
      }
    };

    const handleTrackingExpired = (payload) => {
      setExpired(true);
      setTrackingData((prev) => ({
        ...(prev || {}),
        ...(payload || {}),
      }));
      setRemainingSeconds(0);
    };

    publicTrackingSocket.on("connect", handleConnect);
    publicTrackingSocket.on("disconnect", handleDisconnect);
    publicTrackingSocket.on("TRACKING_UPDATED", handleTrackingUpdated);
    publicTrackingSocket.on("TRACKING_EXPIRED", handleTrackingExpired);

    return () => {
      leavePublicTrackingRoom(token);
      publicTrackingSocket.off("connect", handleConnect);
      publicTrackingSocket.off("disconnect", handleDisconnect);
      publicTrackingSocket.off("TRACKING_UPDATED", handleTrackingUpdated);
      publicTrackingSocket.off("TRACKING_EXPIRED", handleTrackingExpired);
      disconnectPublicTrackingSocket();
    };
  }, [token, expired]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
      setRemainingSeconds((prev) => Math.max(Number(prev || 0) - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-500" />
          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Loading your order
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Connecting live tracking...
          </p>
        </div>
      </main>
    );
  }

  if (expired || error) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-6">
        <section className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>

          <h1 className="mt-5 text-2xl font-black text-gray-900">
            Order Completed
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {error || "This tracking link has expired. Thank you for ordering."}
          </p>

          {trackingData?.orderNumber && (
            <div className="mt-5 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
              Order: {trackingData.orderNumber}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-5 sm:px-6">
      <section className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-gray-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Live Order Tracking
                </p>
                <h1 className="mt-2 text-2xl font-black">
                  {trackingData?.orderNumber || "Your Order"}
                </h1>
              </div>

              <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold">
                {connected ? "Live" : "Connecting"}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold opacity-80">Status</p>
                <p className="mt-1 text-2xl font-black">
                  {getStatusLabel(orderStatus)}
                </p>

                <p className="mt-2 text-sm font-black">
                  {progressInfo.ready}/{progressInfo.total || 0} Items Ready
                </p>

                <p className="mt-1 text-sm font-black">
                  {remainingSeconds > 0
                    ? `${formatTime(remainingSeconds)} left`
                    : progressInfo.ready === progressInfo.total &&
                        progressInfo.total > 0
                      ? "Ready"
                      : "--:--"}
                </p>
              </div>

              <OrderPieProgress
                ready={progressInfo.ready}
                preparing={progressInfo.preparing}
                waiting={progressInfo.waiting}
              />
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/40">
              <div
                className="h-full rounded-full bg-gray-950 transition-all duration-500"
                style={{ width: `${progressInfo.percent}%` }}
              />
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-3xl bg-gray-50 p-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">
                Order Journey
              </h2>

              <div className="mt-4 space-y-4">
                {["Order Placed", "Kitchen Accepted", "Preparing", "Ready"].map(
                  (step, index) => {
                    const active =
                      [
                        "READY",
                        "PAYMENT_PENDING",
                        "PAID",
                        "COMPLETED",
                      ].includes(String(orderStatus).toUpperCase()) ||
                      getStatusLabel(orderStatus) === step ||
                      index === 0;

                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                            active
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {active ? "✓" : index + 1}
                        </div>

                        <p
                          className={`text-sm font-bold ${
                            active ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-lg font-black text-gray-900">Items</h2>

              <div className="mt-3 space-y-3">
                {(trackingData?.items || []).map((item, index) => {
                  const itemSeconds = getItemRemainingSeconds(item);

                  return (
                    <div
                      key={`${item.name}-${index}-${tick}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-gray-900">
                          {getItemIcon(item.status)} {item.name}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-700">
                          {getStatusLabel(item.status)}
                        </span>

                        {itemSeconds > 0 && (
                          <p className="mt-1 text-xs font-black text-orange-600">
                            {formatTime(itemSeconds)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-gray-400">
              This page updates automatically. No refresh or login required.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PublicOrderTracking;
