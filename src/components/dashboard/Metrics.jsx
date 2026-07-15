import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getPayments, getDishes, getCategories } from "../../https";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const formatMoney = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const normalizeStatus = (status = "") => {
  return String(status).trim().toUpperCase().replace(/\s+/g, "_");
};

const Metrics = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const [ordersRes, paymentsRes, dishesRes, categoriesRes] =
        await Promise.all([
          getOrders({ limit: 100, includeCount: false }),
          getPayments(),
          getDishes(),
          getCategories(),
        ]);

      return {
        orders: ordersRes?.data?.data || [],
        payments: paymentsRes?.data?.data || [],
        dishes: dishesRes?.data?.data || [],
        categories: categoriesRes?.data?.data || [],
      };
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const orders = data?.orders || [];
  const payments = data?.payments || [];
  const dishes = data?.dishes || [];
  const categories = data?.categories || [];

  const metricsData = useMemo(() => {
    const totalRevenue = payments.reduce((acc, curr) => {
      return acc + Number(curr.amount || 0);
    }, 0);

    const totalOrders = orders.length;

    const completedOrders = orders.filter((order) => {
      const status = normalizeStatus(order.orderStatus);
      return ["COMPLETED", "PAID"].includes(status);
    }).length;

    const totalDishes = dishes.length;

    return [
      {
        title: "Total Revenue",
        value: formatMoney(totalRevenue),
        color: "#1f8a70",
      },
      {
        title: "Total Orders",
        value: totalOrders,
        color: "#5b8fb9",
      },
      {
        title: "Completed Orders",
        value: completedOrders,
        color: "#9c6644",
      },
      {
        title: "Total Dishes",
        value: totalDishes,
        color: "#7b2cbf",
      },
    ];
  }, [orders, payments, dishes]);

  const itemsData = useMemo(() => {
    return categories.map((category, index) => {
      const count = dishes.filter((dish) => {
        const categoryId =
          typeof dish.category === "object"
            ? dish.category?._id
            : dish.category;

        return String(categoryId) === String(category._id);
      }).length;

      return {
        title: category.name,
        value: `${count} Dishes`,
        color: colors[index % colors.length],
      };
    });
  }, [categories, dishes]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 text-white bg-[#262626] rounded-xl">
        Loading dashboard...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 text-red-400 bg-[#262626] rounded-xl">
        {error?.response?.data?.message || "Failed to load dashboard metrics"}
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <SectionHeader
        title="Overall Performance"
        subtitle="Restaurant performance overview"
      />

      <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricsData.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            color={metric.color}
          />
        ))}
      </div>

      <div className="mt-10 sm:mt-12">
        <SectionHeader
          title="Category Details"
          subtitle="Dish count by category"
        />

        {itemsData.length > 0 ? (
          <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {itemsData.map((item) => (
              <MetricCard
                key={item.title}
                title={item.title}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 bg-[#262626] rounded-xl p-6 text-center text-[#ababab]">
            No categories found
          </div>
        )}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => {
  return (
    <div>
      <h2 className="font-semibold text-[#f5f5f5] text-lg sm:text-xl">
        {title}
      </h2>

      <p className="text-sm sm:text-base text-[#ababab] mt-1">{subtitle}</p>
    </div>
  );
};

const MetricCard = ({ title, value, color }) => {
  return (
    <div
      className="shadow-sm rounded-xl p-4 sm:p-5 min-h-[120px] flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: color }}
    >
      <p className="font-medium text-xs sm:text-sm text-[#f5f5f5] uppercase tracking-wide break-words">
        {title}
      </p>

      <p className="mt-3 font-bold text-2xl sm:text-3xl text-[#f5f5f5] break-words">
        {value}
      </p>
    </div>
  );
};

export default Metrics;
