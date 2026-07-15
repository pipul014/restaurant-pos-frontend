import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  acceptOrderItem,
  getOrders,
  markItemReady,
  rejectOrderItem,
  updateItemPreparationTime,
} from "../https";

import useNotificationSound from "../hooks/useNotificationSound";

import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUtensils,
} from "react-icons/fa";
import { GiCookingPot } from "react-icons/gi";

import {
  ACTIVE_ORDER_STATUSES,
  KITCHEN_TABS,
  REJECTION_REASONS,
} from "../components/kitchen/constants";

import CountCard from "../components/kitchen/CountCard";
import TabButton from "../components/kitchen/TabButton";
import KitchenOrderCard from "../components/kitchen/KitchenOrderCard";
import AcceptItemModal from "../components/kitchen/AcceptItemModal";
import RejectItemModal from "../components/kitchen/RejectItemModal";
import { normalizeStatus } from "../components/orders/statusMapper";

const getItemCountByStatus = (orders = [], statuses = []) => {
  return orders.reduce((sum, order) => {
    const count =
      order.items?.filter((item) =>
        statuses.includes(normalizeStatus(item.status)),
      ).length || 0;

    return sum + count;
  }, 0);
};

const CookDashboard = () => {
  const workflow = useSelector(
    (state) => state.settings?.workflow || "KITCHEN",
  );
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const focusedOrderId = searchParams.get("orderId");

  const previousPendingCountRef = useRef(null);
  const previousRejectedCancelledCountRef = useRef(null);

  const {
    soundUnlocked,
    unlockSound,
    playRepeatSound,
    playOneTimeAlert,
    stopSound,
  } = useNotificationSound();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Pending",
  );

  const [mobileOpenTab, setMobileOpenTab] = useState(
    searchParams.get("tab") || "Pending",
  );

  const [acceptData, setAcceptData] = useState(null);
  const [timeEditData, setTimeEditData] = useState(null);
  const [customPrepTime, setCustomPrepTime] = useState("");

  const [rejectData, setRejectData] = useState(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);

  const [actionItemId, setActionItemId] = useState(null);
  const [actionType, setActionType] = useState("");

  const {
    data: resData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders", "kitchen-active"],
    queryFn: () =>
      getOrders({
        activeOnly: true,
        limit: 100,
        includeCount: false,
        workflow: "KITCHEN",
      }),
    enabled: workflow === "KITCHEN",
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const orders = resData?.data?.data || [];

  const updateOrderInCache = useCallback(
    (updatedOrder) => {
      if (!updatedOrder?._id) return;

      queryClient.setQueryData(["orders", "kitchen-active"], (oldData) => {
        if (!oldData?.data?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order,
            ),
          },
        };
      });
    },
    [queryClient],
  );

  const patchItemInCache = useCallback(
    ({ orderId, itemId, patch }) => {
      queryClient.setQueryData(["orders", "kitchen-active"], (oldData) => {
        if (!oldData?.data?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((order) => {
              if (order._id !== orderId) return order;

              return {
                ...order,
                items: order.items.map((item) =>
                  item._id === itemId ? { ...item, ...patch } : item,
                ),
              };
            }),
          },
        };
      });
    },
    [queryClient],
  );

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab && KITCHEN_TABS.includes(tab)) {
      setActiveTab(tab);
      setMobileOpenTab(tab);
    }
  }, [searchParams]);

  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      const paymentStatus = normalizeStatus(order.paymentStatus);
      const orderStatus = normalizeStatus(order.orderStatus);

      return (
        paymentStatus !== "PAID" && ACTIVE_ORDER_STATUSES.includes(orderStatus)
      );
    });
  }, [orders]);

  const pendingCount = useMemo(
    () => getItemCountByStatus(activeOrders, ["PENDING"]),
    [activeOrders],
  );

  const preparingCount = useMemo(
    () => getItemCountByStatus(activeOrders, ["PREPARING"]),
    [activeOrders],
  );

  const readyCount = useMemo(
    () => getItemCountByStatus(activeOrders, ["READY"]),
    [activeOrders],
  );

  const rejectedCancelledCount = useMemo(
    () =>
      getItemCountByStatus(activeOrders, ["REJECTED", "CANCELLED", "REMOVED"]),
    [activeOrders],
  );

  useEffect(() => {
    if (previousPendingCountRef.current === null) {
      previousPendingCountRef.current = pendingCount;
      return;
    }

    if (pendingCount > previousPendingCountRef.current) {
      enqueueSnackbar("New order received in kitchen", { variant: "info" });
      setActiveTab("Pending");
      setMobileOpenTab("Pending");

      if (soundUnlocked) {
        playRepeatSound("new-order.mp3");
      }
    }

    previousPendingCountRef.current = pendingCount;
  }, [pendingCount, soundUnlocked, playRepeatSound]);

  useEffect(() => {
    if (previousRejectedCancelledCountRef.current === null) {
      previousRejectedCancelledCountRef.current = rejectedCancelledCount;
      return;
    }

    if (rejectedCancelledCount > previousRejectedCancelledCountRef.current) {
      enqueueSnackbar("Cancellation update received", { variant: "warning" });

      if (soundUnlocked) {
        playOneTimeAlert("cancel-order.mp3");
      }
    }

    previousRejectedCancelledCountRef.current = rejectedCancelledCount;
  }, [rejectedCancelledCount, soundUnlocked, playOneTimeAlert]);

  const pendingOrders = useMemo(() => {
    return activeOrders.filter((order) =>
      order.items?.some((item) => normalizeStatus(item.status) === "PENDING"),
    );
  }, [activeOrders]);

  const preparingOrders = useMemo(() => {
    return activeOrders.filter((order) =>
      order.items?.some((item) => normalizeStatus(item.status) === "PREPARING"),
    );
  }, [activeOrders]);

  const readyOrders = useMemo(() => {
    return activeOrders.filter((order) =>
      order.items?.some((item) => normalizeStatus(item.status) === "READY"),
    );
  }, [activeOrders]);

  const rejectedCancelledOrders = useMemo(() => {
    return activeOrders.filter((order) =>
      order.items?.some((item) =>
        ["REJECTED", "CANCELLED", "REMOVED"].includes(
          normalizeStatus(item.status),
        ),
      ),
    );
  }, [activeOrders]);

  const getOrdersByTab = useCallback(
    (tab) => {
      if (tab === "Pending") return pendingOrders;
      if (tab === "Preparing") return preparingOrders;
      if (tab === "Ready") return readyOrders;
      if (tab === "Rejected/Cancelled") return rejectedCancelledOrders;
      return [];
    },
    [pendingOrders, preparingOrders, readyOrders, rejectedCancelledOrders],
  );

  const visibleOrders = useMemo(() => {
    let list = getOrdersByTab(activeTab);

    if (focusedOrderId) {
      list = [...list].sort((a, b) => {
        if (a._id === focusedOrderId) return -1;
        if (b._id === focusedOrderId) return 1;
        return 0;
      });
    }

    return list;
  }, [activeTab, getOrdersByTab, focusedOrderId]);

  const mobileVisibleOrders = useMemo(() => {
    let list = getOrdersByTab(mobileOpenTab);

    if (focusedOrderId) {
      list = [...list].sort((a, b) => {
        if (a._id === focusedOrderId) return -1;
        if (b._id === focusedOrderId) return 1;
        return 0;
      });
    }

    return list;
  }, [mobileOpenTab, getOrdersByTab, focusedOrderId]);

  const acceptMutation = useMutation({
    mutationFn: acceptOrderItem,
    onMutate: async ({ orderId, itemId, estimatedPreparationMinutes }) => {
      setActionItemId(itemId);
      setActionType("accept");

      await queryClient.cancelQueries({
        queryKey: ["orders", "kitchen-active"],
      });

      const previousOrders = queryClient.getQueryData([
        "orders",
        "kitchen-active",
      ]);

      const now = new Date();

      patchItemInCache({
        orderId,
        itemId,
        patch: {
          status: "PREPARING",
          acceptedAt: now.toISOString(),
          preparingAt: now.toISOString(),
          timerStartedAt: now.toISOString(),
          estimatedPreparationMinutes,
          expectedReadyAt: new Date(
            now.getTime() +
              Number(estimatedPreparationMinutes || 10) * 60 * 1000,
          ).toISOString(),
        },
      });

      setAcceptData(null);
      setCustomPrepTime("");

      return { previousOrders };
    },
    onSuccess: (res) => {
      updateOrderInCache(res?.data?.data);

      enqueueSnackbar("Item accepted and timer started", {
        variant: "success",
      });

      if (pendingCount <= 1) {
        stopSound();
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders", "kitchen-active"],
          context.previousOrders,
        );
      }

      enqueueSnackbar(
        error?.response?.data?.message || "Failed to accept item",
        { variant: "error" },
      );
    },
    onSettled: () => {
      setActionItemId(null);
      setActionType("");
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: updateItemPreparationTime,
    onMutate: async ({ orderId, itemId, estimatedPreparationMinutes }) => {
      setActionItemId(itemId);
      setActionType("change-time");

      await queryClient.cancelQueries({
        queryKey: ["orders", "kitchen-active"],
      });

      const previousOrders = queryClient.getQueryData([
        "orders",
        "kitchen-active",
      ]);

      const now = new Date();

      patchItemInCache({
        orderId,
        itemId,
        patch: {
          estimatedPreparationMinutes,
          timerStartedAt: now.toISOString(),
          expectedReadyAt: new Date(
            now.getTime() + Number(estimatedPreparationMinutes) * 60 * 1000,
          ).toISOString(),
        },
      });

      setTimeEditData(null);
      setCustomPrepTime("");

      return { previousOrders };
    },
    onSuccess: (res) => {
      updateOrderInCache(res?.data?.data);
      enqueueSnackbar("Preparation time updated", { variant: "success" });
    },
    onError: (error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders", "kitchen-active"],
          context.previousOrders,
        );
      }

      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update preparation time",
        { variant: "error" },
      );
    },
    onSettled: () => {
      setActionItemId(null);
      setActionType("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectOrderItem,
    onMutate: ({ itemId }) => {
      setActionItemId(itemId);
      setActionType("reject");
    },
    onSuccess: (res) => {
      updateOrderInCache(res?.data?.data);

      enqueueSnackbar("Item rejected", { variant: "success" });

      setRejectData(null);
      setRejectReason(REJECTION_REASONS[0]);

      if (pendingCount <= 1) {
        stopSound();
      }
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to reject item",
        { variant: "error" },
      );
    },
    onSettled: () => {
      setActionItemId(null);
      setActionType("");
    },
  });

  const readyMutation = useMutation({
    mutationFn: markItemReady,
    onMutate: async ({ orderId, itemId }) => {
      setActionItemId(itemId);
      setActionType("ready");

      await queryClient.cancelQueries({
        queryKey: ["orders", "kitchen-active"],
      });

      const previousOrders = queryClient.getQueryData([
        "orders",
        "kitchen-active",
      ]);

      patchItemInCache({
        orderId,
        itemId,
        patch: {
          status: "READY",
          readyAt: new Date().toISOString(),
        },
      });

      return { previousOrders };
    },
    onSuccess: (res) => {
      updateOrderInCache(res?.data?.data);
      enqueueSnackbar("Item marked as ready", { variant: "success" });
    },
    onError: (error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders", "kitchen-active"],
          context.previousOrders,
        );
      }

      enqueueSnackbar(
        error?.response?.data?.message || "Failed to mark item ready",
        { variant: "error" },
      );
    },
    onSettled: () => {
      setActionItemId(null);
      setActionType("");
    },
  });

  const handleAcceptSubmit = () => {
    if (!acceptData) return;

    const minutes = Number(
      customPrepTime || acceptData.item.estimatedPreparationMinutes || 10,
    );

    if (!minutes || minutes <= 0) {
      enqueueSnackbar("Enter valid preparation minutes", {
        variant: "warning",
      });
      return;
    }

    acceptMutation.mutate({
      orderId: acceptData.order._id,
      itemId: acceptData.item._id,
      estimatedPreparationMinutes: minutes,
    });
  };

  const handleUpdateTimeSubmit = () => {
    if (!timeEditData) return;

    const minutes = Number(
      customPrepTime || timeEditData.item.estimatedPreparationMinutes || 10,
    );

    if (!minutes || minutes <= 0 || minutes > 180) {
      enqueueSnackbar("Enter valid preparation minutes", {
        variant: "warning",
      });
      return;
    }

    updateTimeMutation.mutate({
      orderId: timeEditData.order._id,
      itemId: timeEditData.item._id,
      estimatedPreparationMinutes: minutes,
    });
  };

  const handleRejectSubmit = () => {
    if (!rejectData) return;

    if (!rejectReason) {
      enqueueSnackbar("Select rejection reason", { variant: "warning" });
      return;
    }

    rejectMutation.mutate({
      orderId: rejectData.order._id,
      itemId: rejectData.item._id,
      reason: rejectReason,
    });
  };

  const handleEnableSound = async () => {
    const ok = await unlockSound();

    if (ok) {
      enqueueSnackbar("Kitchen sound enabled", { variant: "success" });

      if (pendingCount > 0) {
        playRepeatSound("new-order.mp3");
      }
    } else {
      enqueueSnackbar("Click again or check browser sound permission", {
        variant: "warning",
      });
    }
  };

  const openMobileTab = (tab) => {
    setMobileOpenTab((prev) => (prev === tab ? "" : tab));
    setActiveTab(tab);
  };

  const renderOrderList = (list, tab) => {
    if (list.length === 0) {
      return (
        <div className="hidden lg:block md:col-span-2 2xl:col-span-3 bg-[#262626] p-8 rounded-lg text-center">
          <p className="text-[#ababab] text-base sm:text-lg">
            No {tab} items found
          </p>
        </div>
      );
    }

    return list.map((order) => (
      <div
        key={order._id}
        className={
          focusedOrderId === order._id
            ? "ring-2 ring-yellow-400 rounded-xl"
            : ""
        }
      >
        <KitchenOrderCard
          order={order}
          activeTab={tab}
          actionItemId={actionItemId}
          actionType={actionType}
          onAcceptItem={(item) => {
            setAcceptData({ order, item });
            setCustomPrepTime(item.estimatedPreparationMinutes || 10);
          }}
          onRejectItem={(item) => {
            setRejectData({ order, item });
            setRejectReason(REJECTION_REASONS[0]);
          }}
          onMarkReady={(item) =>
            readyMutation.mutate({
              orderId: order._id,
              itemId: item._id,
            })
          }
          onChangeTime={(item) => {
            setTimeEditData({ order, item });
            setCustomPrepTime(item.estimatedPreparationMinutes || 10);
          }}
        />
      </div>
    ));
  };

  const mobileSections = [
    {
      tab: "Pending",
      title: "New Items",
      count: pendingCount,
      icon: <FaClock />,
      color: "bg-yellow-500",
    },
    {
      tab: "Preparing",
      title: "Preparing",
      count: preparingCount,
      icon: <FaUtensils />,
      color: "bg-blue-500",
    },
    {
      tab: "Ready",
      title: "Ready",
      count: readyCount,
      icon: <FaCheckCircle />,
      color: "bg-green-500",
    },
    {
      tab: "Rejected/Cancelled",
      title: "Rejected/Cancelled",
      count: rejectedCancelledCount,
      icon: <FaTimesCircle />,
      color: "bg-red-500",
    },
  ];

  if (workflow === "POST_BILLING") {
    return (
      <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 text-white">
        <div className="max-w-xl text-center bg-[#262626] border border-[#333] rounded-2xl p-8">
          <GiCookingPot className="mx-auto text-5xl text-[#f6b100]" />
          <h1 className="text-2xl font-bold mt-4">Post Billing Mode Active</h1>
          <p className="text-[#ababab] mt-2">
            Kitchen dashboard is disabled because orders are billed directly
            without the KDS workflow.
          </p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="bg-[#1f1f1f] min-h-screen p-4 flex items-center justify-center">
        <h1 className="text-white text-xl font-bold">
          Loading Kitchen Display.
        </h1>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-[#1f1f1f] min-h-screen p-4 flex items-center justify-center">
        <div className="bg-[#262626] p-6 rounded-xl text-center max-w-md">
          <h1 className="text-red-500 text-xl font-bold">
            Failed to load kitchen orders
          </h1>

          <p className="text-[#ababab] mt-3 text-sm">
            {error?.response?.data?.message ||
              error?.message ||
              "Something went wrong"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1f1f1f] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">
            Kitchen Display System
          </h1>

          <p className="text-[#ababab] mt-1 text-sm sm:text-base">
            Accept, reject, prepare and mark each item ready individually.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEnableSound}
            className={`px-4 py-3 rounded-lg text-sm font-bold ${
              soundUnlocked
                ? "bg-green-500 text-white"
                : "bg-yellow-400 text-black"
            }`}
          >
            {soundUnlocked ? "Sound Enabled" : "Enable Sound"}
          </button>

          <button
            onClick={stopSound}
            className="bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-bold"
          >
            Stop Sound
          </button>

          <div className="bg-[#262626] px-4 py-3 rounded-lg text-[#ababab] text-sm w-fit">
            Showing:{" "}
            <span className="text-white font-bold">
              {mobileVisibleOrders.length}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 lg:hidden">
        {mobileSections.map((section) => {
          const isOpen = mobileOpenTab === section.tab;
          const sectionOrders = getOrdersByTab(section.tab);

          return (
            <div key={section.tab} className="rounded-2xl bg-[#262626]">
              <button
                type="button"
                onClick={() => openMobileTab(section.tab)}
                className="w-full text-left active:scale-[0.99] transition"
              >
                <CountCard
                  title={section.title}
                  count={section.count}
                  icon={section.icon}
                  color={section.color}
                />
              </button>

              {isOpen && (
                <div className="border-t border-[#333] p-3">
                  {sectionOrders.length > 0 ? (
                    <div className="space-y-4">
                      {renderOrderList(sectionOrders, section.tab)}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-[#1a1a1a] p-4 text-center text-sm text-[#ababab]">
                      No {section.tab} items found
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden lg:grid lg:grid-cols-4 gap-4 sm:gap-5 mt-6 sm:mt-8">
        <button
          type="button"
          onClick={() => setActiveTab("Pending")}
          className="text-left active:scale-[0.98] transition"
        >
          <CountCard
            title="New Items"
            count={pendingCount}
            icon={<FaClock />}
            color="bg-yellow-500"
          />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("Preparing")}
          className="text-left active:scale-[0.98] transition"
        >
          <CountCard
            title="Preparing"
            count={preparingCount}
            icon={<FaUtensils />}
            color="bg-blue-500"
          />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("Ready")}
          className="text-left active:scale-[0.98] transition"
        >
          <CountCard
            title="Ready"
            count={readyCount}
            icon={<FaCheckCircle />}
            color="bg-green-500"
          />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("Rejected/Cancelled")}
          className="text-left active:scale-[0.98] transition"
        >
          <CountCard
            title="Rejected/Cancelled"
            count={rejectedCancelledCount}
            icon={<FaTimesCircle />}
            color="bg-red-500"
          />
        </button>
      </div>

      <div className="hidden lg:flex gap-3 mt-6 sm:mt-8 overflow-x-auto pb-2">
        {KITCHEN_TABS.map((tab) => (
          <TabButton
            key={tab}
            title={tab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </div>

      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5 mt-5 sm:mt-6">
        {renderOrderList(visibleOrders, activeTab)}
      </div>

      {acceptData && (
        <AcceptItemModal
          data={acceptData}
          customPrepTime={customPrepTime}
          setCustomPrepTime={setCustomPrepTime}
          onClose={() => {
            setAcceptData(null);
            setCustomPrepTime("");
          }}
          onSubmit={handleAcceptSubmit}
          loading={acceptMutation.isPending}
        />
      )}

      {timeEditData && (
        <AcceptItemModal
          data={timeEditData}
          customPrepTime={customPrepTime}
          setCustomPrepTime={setCustomPrepTime}
          onClose={() => {
            setTimeEditData(null);
            setCustomPrepTime("");
          }}
          onSubmit={handleUpdateTimeSubmit}
          loading={updateTimeMutation.isPending}
        />
      )}

      {rejectData && (
        <RejectItemModal
          data={rejectData}
          reason={rejectReason}
          setReason={setRejectReason}
          onClose={() => {
            setRejectData(null);
            setRejectReason(REJECTION_REASONS[0]);
          }}
          onSubmit={handleRejectSubmit}
          loading={rejectMutation.isPending}
        />
      )}
    </section>
  );
};

export default CookDashboard;
