//final fast
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MdCategory, MdTableBar } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useSelector } from "react-redux";

import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";

import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/orders/RecentOrders";
import Payment from "../components/dashboard/Payment";

import Modal from "../components/dashboard/Modal";
import AddDishModal from "../components/dashboard/AddDishModal";
import AddCategoryModal from "../components/dashboard/AddCategoryModal";
import CategoryDiscountManager from "../components/dashboard/CategoryDiscountManager";

const ACTION_BUTTONS = [
  { label: "Add Table", icon: <MdTableBar />, action: "table" },
  { label: "Add Category", icon: <MdCategory />, action: "category" },
  { label: "Add Dishes", icon: <BiSolidDish />, action: "dishes" },
];

const BASE_TABS = ["Metrics", "Orders", "Payments"];
const DEFAULT_TAB = "Orders";
const DEFAULT_STATUS = "All";

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { userData, role } = useSelector((state) => state.user);
  const userRole = userData?.role || role;
  const isAdmin = userRole === "Admin";

  const DASHBOARD_TABS = useMemo(() => {
    return isAdmin ? [...BASE_TABS, "Discounts"] : BASE_TABS;
  }, [isAdmin]);

  const tabFromUrl = searchParams.get("tab");
  const statusFromUrl = searchParams.get("status");

  const activeTab = useMemo(() => {
    if (DASHBOARD_TABS.includes(tabFromUrl)) return tabFromUrl;
    return DEFAULT_TAB;
  }, [DASHBOARD_TABS, tabFromUrl]);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    document.title = "POS | Orders Dashboard";
  }, []);

  useEffect(() => {
    const shouldFixTab = !tabFromUrl || !DASHBOARD_TABS.includes(tabFromUrl);
    const shouldFixStatus = activeTab === "Orders" && !statusFromUrl;

    if (!shouldFixTab && !shouldFixStatus) return;

    const params = new URLSearchParams(searchParams);

    if (shouldFixTab) params.set("tab", DEFAULT_TAB);
    if (shouldFixStatus) params.set("status", DEFAULT_STATUS);

    setSearchParams(params, { replace: true });
  }, [
    activeTab,
    DASHBOARD_TABS,
    searchParams,
    setSearchParams,
    statusFromUrl,
    tabFromUrl,
  ]);

  const handleTabChange = useCallback(
    (tab) => {
      if (!DASHBOARD_TABS.includes(tab)) return;

      const params = new URLSearchParams(searchParams);
      params.set("tab", tab);

      if (tab === "Orders") {
        params.set("status", searchParams.get("status") || DEFAULT_STATUS);
      } else {
        params.delete("status");
      }

      setSearchParams(params);
    },
    [DASHBOARD_TABS, searchParams, setSearchParams],
  );

  const handleOpenModal = useCallback((action) => {
    if (action === "table") setIsTableModalOpen(true);
    if (action === "category") setIsCategoryModalOpen(true);
    if (action === "dishes") setIsDishModalOpen(true);
  }, []);

  return (
    <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-24">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton />

              <div>
                <h1 className="text-[#f5f5f5] text-2xl sm:text-3xl font-bold tracking-wider">
                  Orders Dashboard
                </h1>

                <p className="text-[#ababab] text-sm mt-1">
                  Manage orders, kitchen status, payment, tables, categories and
                  dishes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex items-center gap-3 min-w-max">
                {DASHBOARD_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`rounded-lg px-4 sm:px-5 py-2 font-semibold text-sm sm:text-base whitespace-nowrap transition ${
                      activeTab === tab
                        ? "bg-[#383838] text-[#f5f5f5]"
                        : "bg-[#262626] text-[#ababab] hover:bg-[#333] hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-3 min-w-max">
              {ACTION_BUTTONS.map(({ label, icon, action }) => (
                <button
                  key={action}
                  onClick={() => handleOpenModal(action)}
                  className="bg-[#262626] hover:bg-[#333] px-4 sm:px-5 py-2 rounded-lg text-[#f5f5f5] font-semibold text-sm sm:text-base flex items-center gap-2 whitespace-nowrap transition"
                >
                  <span>{label}</span>
                  <span className="text-xl">{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "Metrics" && <Metrics />}
          {activeTab === "Orders" && <RecentOrders />}
          {activeTab === "Payments" && <Payment />}
          {activeTab === "Discounts" && isAdmin && <CategoryDiscountManager />}
        </div>
      </div>

      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} />}

      {isDishModalOpen && (
        <AddDishModal setIsDishModalOpen={setIsDishModalOpen} />
      )}

      {isCategoryModalOpen && (
        <AddCategoryModal setIsCategoryModalOpen={setIsCategoryModalOpen} />
      )}
      <BottomNav />
    </section>
  );
};

export default Orders;
