import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useSocket from "./useSocket";

const getId = (value) => String(value?._id || value?.id || value || "");

const updateOrderInCache = (oldData, updatedOrder, payload = {}) => {
  if (!oldData?.data?.data) return oldData;

  const orderId = getId(updatedOrder) || getId(payload.orderId);
  if (!orderId) return oldData;

  const oldOrders = oldData.data.data;
  const exists = oldOrders.some((order) => getId(order) === orderId);

  let nextOrders = oldOrders;

  if (payload.deleted) {
    nextOrders = oldOrders.filter((order) => getId(order) !== orderId);
  } else if (updatedOrder && exists) {
    nextOrders = oldOrders.map((order) =>
      getId(order) === orderId ? updatedOrder : order,
    );
  } else if (updatedOrder && !exists) {
    nextOrders = [updatedOrder, ...oldOrders];
  }

  return {
    ...oldData,
    data: {
      ...oldData.data,
      data: nextOrders,
    },
  };
};

const useRealtimeSync = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const fallbackTimerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const fallbackRefetch = (payload = {}) => {
      if (fallbackTimerRef.current) return;

      fallbackTimerRef.current = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["orders"],
          exact: false,
        });

        queryClient.invalidateQueries({
          queryKey: ["notifications"],
          exact: false,
        });

        if (payload.type === "PAYMENT") {
          queryClient.invalidateQueries({
            queryKey: ["payments"],
            exact: false,
          });
        }

        if (payload.type === "TABLE") {
          queryClient.invalidateQueries({
            queryKey: ["tables"],
            exact: false,
          });
        }

        fallbackTimerRef.current = null;
      }, 500);
    };

    const syncData = (payload = {}) => {
      const hasOrderPayload =
        payload.type === "ORDER" && (payload.order || payload.orderId);

      if (hasOrderPayload) {
        queryClient.setQueriesData(
          { queryKey: ["orders"], exact: false },
          (oldData) => updateOrderInCache(oldData, payload.order, payload),
        );

        queryClient.invalidateQueries({
          queryKey: ["notifications"],
          exact: false,
        });

        return;
      }

      fallbackRefetch(payload);
    };

    const handleOrderCreated = (payload = {}) => {
      const order = payload.order || payload.data;
      if (!order?._id) return fallbackRefetch({ type: "ORDER" });

      queryClient.setQueriesData(
        { queryKey: ["orders"], exact: false },
        (oldData) => updateOrderInCache(oldData, order, { type: "ORDER" }),
      );
    };

    const handleOrderUpdated = (payload = {}) => {
      const order = payload.order || payload.data;
      if (!order?._id) return fallbackRefetch({ type: "ORDER" });

      queryClient.setQueriesData(
        { queryKey: ["orders"], exact: false },
        (oldData) => updateOrderInCache(oldData, order, { type: "ORDER" }),
      );
    };

    const handleOrderDeleted = (payload = {}) => {
      queryClient.setQueriesData(
        { queryKey: ["orders"], exact: false },
        (oldData) =>
          updateOrderInCache(oldData, null, {
            type: "ORDER",
            orderId: payload.orderId,
            deleted: true,
          }),
      );
    };

    socket.on("POS_DATA_CHANGED", syncData);
    socket.on("ORDER_CREATED", handleOrderCreated);
    socket.on("ORDER_UPDATED", handleOrderUpdated);
    socket.on("ORDER_DELETED", handleOrderDeleted);

    return () => {
      socket.off("POS_DATA_CHANGED", syncData);
      socket.off("ORDER_CREATED", handleOrderCreated);
      socket.off("ORDER_UPDATED", handleOrderUpdated);
      socket.off("ORDER_DELETED", handleOrderDeleted);

      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [socket, queryClient]);
};

export default useRealtimeSync;
