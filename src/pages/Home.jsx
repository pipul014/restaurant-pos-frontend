import React, { useCallback, useEffect, useMemo, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import PopularDishes from "../components/home/PopularDishes";
import SoldItemsTable from "../components/home/SoldItemsTable";
import { getOrders, getSoldItems } from "../https";

const getLocalDateValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const ACTIVE_ORDER_STATUSES = [
  "CREATED",
  "SENT_TO_KITCHEN",
  "PREPARING",
  "PARTIALLY_READY",
  "READY",
  "PAYMENT_PENDING",
  "PARTIALLY_CANCELLED",
];

const Home = () => {
  const [filterType, setFilterType] = useState("today");
  const [selectedDate, setSelectedDate] = useState(getLocalDateValue());

  const [soldItems, setSoldItems] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalSoldQuantity, setTotalSoldQuantity] = useState(0);
  const [inProgressOrders, setInProgressOrders] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  const dashboardParams = useMemo(() => {
    const createLocalDayRange = (dateValue) => {
      const [year, month, day] = String(dateValue).split("-").map(Number);

      const start = new Date(year, month - 1, day, 0, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59, 999);

      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    };

    const today = new Date();
    const todayValue = getLocalDateValue(today);

    if (filterType === "all") {
      return {
        range: "all",
      };
    }

    if (filterType === "specificDate") {
      const range = createLocalDayRange(selectedDate);

      return {
        range: "specificDate",
        ...range,
      };
    }

    let days = 1;

    if (filterType === "last7") days = 7;
    if (filterType === "last15") days = 15;
    if (filterType === "last30") days = 30;

    const startValue = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (days - 1),
    );

    const startRange = createLocalDayRange(getLocalDateValue(startValue));

    const endRange = createLocalDayRange(todayValue);

    return {
      range: filterType,
      startDate: startRange.startDate,
      endDate: endRange.endDate,
    };
  }, [filterType, selectedDate]);

  const fetchHomeData = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setErrorMessage("");

        const [soldItemsResponse, ordersResponse] = await Promise.all([
          getSoldItems(dashboardParams),

          getOrders({
            activeOnly: "true",
            includeCount: "false",
            page: 1,
            limit: 100,
          }),
        ]);

        const soldItemsPayload = soldItemsResponse?.data || {};
        const nextSoldItems = Array.isArray(soldItemsPayload.data)
          ? soldItemsPayload.data
          : [];

        const summary = soldItemsPayload.summary || {};

        const calculatedSoldAmount = nextSoldItems.reduce(
          (total, item) => total + Number(item.total || 0),
          0,
        );

        const calculatedQuantity = nextSoldItems.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        );

        const nextTotalEarnings = Number(
          summary.totalEarnings ??
            summary.netRevenue ??
            summary.totalAmount ??
            calculatedSoldAmount,
        );

        const nextTotalQuantity = Number(
          summary.totalItems ?? summary.totalQuantity ?? calculatedQuantity,
        );

        const orders = Array.isArray(ordersResponse?.data?.data)
          ? ordersResponse.data.data
          : [];

        const activeOrdersCount = orders.filter((order) => {
          const orderStatus = String(order?.orderStatus || "").toUpperCase();
          const paymentStatus = String(
            order?.paymentStatus || "",
          ).toUpperCase();

          return (
            paymentStatus !== "PAID" &&
            ACTIVE_ORDER_STATUSES.includes(orderStatus)
          );
        }).length;

        setSoldItems(nextSoldItems);
        setTotalEarnings(nextTotalEarnings);
        setTotalSoldQuantity(nextTotalQuantity);
        setInProgressOrders(activeOrdersCount);
      } catch (error) {
        console.error("Home dashboard fetch error:", error);

        setSoldItems([]);
        setTotalEarnings(0);
        setTotalSoldQuantity(0);
        setInProgressOrders(0);

        setErrorMessage(
          error?.response?.data?.message ||
            "Unable to load dashboard information.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dashboardParams],
  );

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const handleFilterChange = (nextFilter) => {
    setFilterType(nextFilter);

    if (nextFilter === "today") {
      setSelectedDate(getLocalDateValue());
    }
  };

  const handleSelectedDateChange = (nextDate) => {
    setSelectedDate(nextDate);
    setFilterType("specificDate");
  };

  const handleResetFilter = () => {
    setSelectedDate(getLocalDateValue());
    setFilterType("today");
  };

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#1f1f1f] pb-24 lg:pb-6">
      <div className="grid grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <Greetings />

          <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2">
            <MiniCard
              title="Total Earnings"
              icon={<BsCashCoin />}
              number={isLoading ? 0 : totalEarnings}
              footerText="Selected period"
            />

            <MiniCard
              title="In Progress"
              icon={<GrInProgress />}
              number={isLoading ? 0 : inProgressOrders}
              footerText="Active orders"
            />
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 overflow-x-auto sm:mt-8">
            <SoldItemsTable
              soldItemsData={soldItems}
              totalSoldQuantity={totalSoldQuantity}
              totalEarnings={totalEarnings}
              filterType={filterType}
              selectedDate={selectedDate}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              onFilterChange={handleFilterChange}
              onSelectedDateChange={handleSelectedDateChange}
              onRefresh={() => fetchHomeData({ refresh: true })}
              onResetFilter={handleResetFilter}
            />
          </div>
        </div>

        <div className="min-w-0">
          <PopularDishes />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Home;
