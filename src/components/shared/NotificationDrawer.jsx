import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import {
  deleteAllNotifications,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../https";

import { displayStatus, normalizeStatus } from "../orders/statusMapper";

const typeLabels = {
  ORDER_CREATED: "New Order / Item Added",
  ORDER_ACCEPTED: "Order Accepted",
  ORDER_ITEM_ACCEPTED: "Item Accepted",
  ORDER_ITEM_REJECTED: "Item Rejected",
  ORDER_ITEM_UPDATED: "Item Updated",
  ORDER_ITEM_READY: "Item Ready",
  ORDER_ITEM_SERVED: "Item Served",
  ORDER_ITEM_CANCELLED: "Item Cancelled",
  ORDER_CANCELLED: "Order Cancelled",
  ORDER_PAID: "Order Paid",
  ORDER_COMPLETED: "Order Completed",
};

const getTypeColor = (type) => {
  if (type === "ORDER_CREATED") {
    return "bg-yellow-500/20 text-yellow-400";
  }

  if (
    ["ORDER_ITEM_CANCELLED", "ORDER_ITEM_REJECTED", "ORDER_CANCELLED"].includes(
      type,
    )
  ) {
    return "bg-red-500/20 text-red-400";
  }

  if (
    [
      "ORDER_ACCEPTED",
      "ORDER_ITEM_ACCEPTED",
      "ORDER_ITEM_READY",
      "ORDER_ITEM_SERVED",
      "ORDER_COMPLETED",
    ].includes(type)
  ) {
    return "bg-green-500/20 text-green-400";
  }

  if (type === "ORDER_PAID") {
    return "bg-blue-500/20 text-blue-400";
  }

  return "bg-[#333] text-[#ababab]";
};

const getNavigateTarget = (notification, userRole) => {
  const orderStatus = normalizeStatus(notification?.orderId?.orderStatus);
  const type = notification?.type;

  if (userRole === "Cook") {
    return "/cook-dashboard?tab=Pending";
  }

  if (type === "ORDER_ITEM_READY") {
    return "/orders?tab=Orders&status=READY";
  }

  if (type === "ORDER_ITEM_SERVED") {
    return "/orders?tab=Orders&status=PAYMENT_PENDING";
  }

  if (type === "ORDER_PAID" || type === "ORDER_COMPLETED") {
    return "/orders?tab=Orders&status=COMPLETED";
  }

  if (
    type === "ORDER_ITEM_CANCELLED" ||
    type === "ORDER_ITEM_REJECTED" ||
    type === "ORDER_CANCELLED"
  ) {
    return "/orders?tab=Orders&status=CANCELLED";
  }

  if (orderStatus === "SENT_TO_KITCHEN") {
    return "/orders?tab=Orders&status=KITCHEN";
  }

  if (orderStatus === "PREPARING") {
    return "/orders?tab=Orders&status=PREPARING";
  }

  // if (
  //   ["READY", "PARTIALLY_READY", "PARTIALLY_CANCELLED"].includes(orderStatus)
  // ) {
  //   return "/orders?tab=Orders&status=READY";
  // }

  // if (orderStatus === "PAYMENT_PENDING") {
  //   return "/orders?tab=Orders&status=PAYMENT_PENDING";
  // }

  if (["READY", "PARTIALLY_READY"].includes(orderStatus)) {
    return "/orders?tab=Orders&status=READY";
  }

  if (orderStatus === "PARTIALLY_CANCELLED") {
    return "/orders?tab=Orders&status=READY";
  }
  if (["PAID", "COMPLETED"].includes(orderStatus)) {
    return "/orders?tab=Orders&status=COMPLETED";
  }

  if (["CANCELLED", "REJECTED"].includes(orderStatus)) {
    return "/orders?tab=Orders&status=CANCELLED";
  }

  return "/orders?tab=Orders&status=All";
};

const NotificationDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  refetchNotifications,
  stopSound,
  userRole,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    refetchNotifications?.();
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      stopSound?.();
      invalidate();
    },
    onError: () => {
      enqueueSnackbar("Failed to mark notification as read", {
        variant: "error",
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      stopSound?.();
      invalidate();

      enqueueSnackbar("All notifications marked as read", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to mark all notifications as read", {
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      invalidate();

      enqueueSnackbar("Notification deleted", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to delete notification", {
        variant: "error",
      });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      stopSound?.();
      invalidate();

      enqueueSnackbar("All notifications deleted", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to delete all notifications", {
        variant: "error",
      });
    },
  });

  const handleMarkRead = (notification) => {
    if (!notification?._id || notification.isRead) return;
    markReadMutation.mutate(notification._id);
  };

  const handleView = (notification) => {
    stopSound?.();

    if (notification?._id && !notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    onClose?.();

    navigate(getNavigateTarget(notification, userRole));
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const unreadCount = sortedNotifications.filter((item) => !item.isRead).length;

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#1f1f1f] z-50 shadow-2xl border-l border-[#333] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 sm:px-5 py-4 border-b border-[#333] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-white text-xl font-bold">Notifications</h2>

              <p className="text-[#ababab] text-sm mt-1">
                {unreadCount} unread / {sortedNotifications.length} total
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-[#262626] hover:bg-[#333] text-white rounded-lg px-3 py-2 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="px-4 sm:px-5 py-3 border-b border-[#333] grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              className="bg-[#f6b100] disabled:bg-[#333] disabled:text-[#777] text-black py-2 rounded-lg text-xs sm:text-sm font-bold"
            >
              Read All
            </button>

            <button
              type="button"
              onClick={() => {
                stopSound?.();
                invalidate();
              }}
              className="bg-[#262626] hover:bg-[#333] text-white py-2 rounded-lg text-xs sm:text-sm font-bold"
            >
              Refresh
            </button>

            <button
              type="button"
              disabled={
                sortedNotifications.length === 0 || deleteAllMutation.isPending
              }
              onClick={() => deleteAllMutation.mutate()}
              className="bg-red-500 disabled:bg-[#333] disabled:text-[#777] text-white py-2 rounded-lg text-xs sm:text-sm font-bold"
            >
              Delete All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {sortedNotifications.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-[#ababab]">No notifications found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleMarkRead(notification)}
                    className={`rounded-xl p-4 border cursor-pointer transition ${
                      notification.isRead
                        ? "bg-[#262626] border-[#333]"
                        : "bg-[#2b2615] border-[#f6b100]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${getTypeColor(
                            notification.type,
                          )}`}
                        >
                          {typeLabels[notification.type] || notification.type}
                        </span>

                        <h3 className="text-white font-bold mt-2 break-words">
                          {notification.title}
                        </h3>

                        <p className="text-[#ababab] text-sm mt-1 break-words">
                          {notification.message}
                        </p>

                        {notification.sound && (
                          <p className="text-[#777] text-xs mt-2">
                            Sound: {notification.sound}
                          </p>
                        )}

                        <p className="text-[#777] text-xs mt-2">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString(
                                "en-IN",
                              )
                            : "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {!notification.isRead && (
                          <span className="w-3 h-3 bg-[#f6b100] rounded-full" />
                        )}
                      </div>
                    </div>

                    {notification.orderId && (
                      <div className="mt-3 bg-[#1f1f1f] rounded-lg p-3">
                        <p className="text-[#ababab] text-xs">
                          Order:{" "}
                          <span className="text-white font-bold">
                            {notification.orderId.orderNumber ||
                              notification.orderId.invoiceNo ||
                              notification.orderId._id}
                          </span>
                        </p>

                        {notification.orderId.orderStatus && (
                          <p className="text-[#ababab] text-xs mt-1">
                            Status:{" "}
                            <span className="text-[#f6b100] font-bold">
                              {displayStatus(notification.orderId.orderStatus)}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(notification);
                        }}
                        className="bg-[#f6b100] hover:bg-yellow-500 text-black py-2 rounded-lg text-xs font-bold"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(notification._id);
                        }}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-[#333] disabled:text-[#777] text-white py-2 rounded-lg text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default NotificationDrawer;
