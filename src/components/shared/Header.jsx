import React, { useEffect, useMemo, useState } from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard, MdSettings } from "react-icons/md";
import { GiCookingPot } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import logo from "../../assets/images/logo.png";
import { getNotifications, logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { setWorkflow } from "../../redux/slices/settingsSlice";
import useSocket from "../../hooks/useSocket";
import useNotificationSound from "../../hooks/useNotificationSound";
import NotificationDrawer from "./NotificationDrawer";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { unlockSound, playOneTimeAlert, stopSound } = useNotificationSound();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const role = userData?.role;
  const isCook = role === "Cook";
  const isAdmin = role === "Admin";
  const isCashier = role === "Cashier";
  const isAdminOrCashier = isAdmin || isCashier;

  const { data: notificationData, refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: Boolean(role),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const allNotifications = notificationData?.data?.data || [];

  const notifications = useMemo(() => {
    return allNotifications.filter((notification) => {
      if (notification.targetRole === role) return true;
      if (role === "Admin" && notification.targetRole === "Cashier")
        return true;
      return false;
    });
  }, [allNotifications, role]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  useEffect(() => {
    const handleFirstUserAction = async () => {
      await unlockSound();

      window.removeEventListener("click", handleFirstUserAction);
      window.removeEventListener("keydown", handleFirstUserAction);
      window.removeEventListener("touchstart", handleFirstUserAction);
    };

    window.addEventListener("click", handleFirstUserAction);
    window.addEventListener("keydown", handleFirstUserAction);
    window.addEventListener("touchstart", handleFirstUserAction);

    return () => {
      window.removeEventListener("click", handleFirstUserAction);
      window.removeEventListener("keydown", handleFirstUserAction);
      window.removeEventListener("touchstart", handleFirstUserAction);
    };
  }, [unlockSound]);

  useEffect(() => {
    if (!socket || !role) return;

    const handleNotificationCreated = (notification) => {
      const notificationRole = notification?.targetRole;
      const notificationType = notification?.type;

      const isForCurrentUser =
        notificationRole === role ||
        (role === "Admin" && notificationRole === "Cashier");

      if (!isForCurrentUser) return;

      const isCancelOrReject = [
        "ORDER_ITEM_CANCELLED",
        "ORDER_ITEM_REJECTED",
        "ORDER_CANCELLED",
      ].includes(notificationType);

      if (isCancelOrReject) {
        enqueueSnackbar(notification?.title || "Cancel / reject update", {
          variant: "warning",
        });

        playOneTimeAlert("cancel-order.mp3");
      } else {
        enqueueSnackbar(notification?.title || "Order update", {
          variant: "info",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const handleNotificationChange = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      stopSound();
    };

    const handleWorkflowUpdated = (payload) => {
      dispatch(setWorkflow(payload?.workflow));
      enqueueSnackbar(`Workflow changed to ${payload?.workflow === "POST_BILLING" ? "Post Billing" : "Kitchen Service"}`, { variant: "info" });
    };

    socket.on("WORKFLOW_UPDATED", handleWorkflowUpdated);
    socket.on("notification_created", handleNotificationCreated);
    socket.on("NOTIFICATION_READ", handleNotificationChange);
    socket.on("ALL_NOTIFICATIONS_READ", handleNotificationChange);
    socket.on("NOTIFICATION_DELETED", handleNotificationChange);
    socket.on("ALL_NOTIFICATIONS_DELETED", handleNotificationChange);

    return () => {
      socket.off("WORKFLOW_UPDATED", handleWorkflowUpdated);
      socket.off("notification_created", handleNotificationCreated);
      socket.off("NOTIFICATION_READ", handleNotificationChange);
      socket.off("ALL_NOTIFICATIONS_READ", handleNotificationChange);
      socket.off("NOTIFICATION_DELETED", handleNotificationChange);
      socket.off("ALL_NOTIFICATIONS_DELETED", handleNotificationChange);
    };
  }, [socket, role, playOneTimeAlert, stopSound, queryClient]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      stopSound();
      queryClient.clear();
      dispatch(removeUser());
      navigate("/auth", { replace: true });
    },
    onError: () => {
      enqueueSnackbar("Logout failed", { variant: "error" });
    },
  });

  const handleLogoClick = () => {
    if (isCook) {
      navigate("/cook-dashboard?tab=Pending");
      return;
    }

    if (isAdminOrCashier) {
      navigate("/orders?tab=Orders&status=All");
      return;
    }

    navigate("/");
  };

  const handleBellClick = () => {
    stopSound();
    setIsNotificationOpen((prev) => !prev);
  };

  return (
    <header className="relative bg-[#1a1a1a] border-b border-[#2a2a2a]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <img
              src={logo}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              alt="Sas Cafe logo"
            />

            <h1 className="hidden sm:block text-base sm:text-lg font-semibold text-[#f5f5f5] tracking-wide whitespace-nowrap">
              Sas Cafe
            </h1>
          </div>

          {!isCook && (
            <div className="hidden lg:flex items-center gap-4 bg-[#1f1f1f] rounded-xl px-5 py-2 w-full max-w-[500px]">
              <FaSearch className="text-[#f5f5f5] shrink-0" />
              <input
                type="text"
                placeholder="Search"
                className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-0">
            {isAdmin && (
              <IconButton title="Settings" onClick={() => navigate("/settings")}>
                <MdSettings className="text-[#f5f5f5] text-xl sm:text-2xl" />
              </IconButton>
            )}

            {isAdmin && (
              <IconButton
                title="Dashboard"
                onClick={() => navigate("/dashboard")}
              >
                <MdDashboard className="text-[#f5f5f5] text-xl sm:text-2xl" />
              </IconButton>
            )}

            {isCook && (
              <IconButton
                title="Kitchen"
                onClick={() => navigate("/cook-dashboard?tab=Pending")}
              >
                <GiCookingPot className="text-[#f5f5f5] text-xl sm:text-2xl" />
              </IconButton>
            )}

            {(isAdminOrCashier || isCook) && (
              <IconButton
                title="Notifications"
                onClick={handleBellClick}
                badge={unreadNotificationCount}
                badgeColor="bg-red-500"
              >
                <FaBell className="text-[#f5f5f5] text-xl sm:text-2xl" />
              </IconButton>
            )}

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <FaUserCircle className="text-[#f5f5f5] text-3xl sm:text-4xl shrink-0" />

              <div className="hidden md:flex flex-col items-start min-w-0 max-w-[160px]">
                <h1 className="text-sm sm:text-md text-[#f5f5f5] font-semibold tracking-wide truncate w-full">
                  {userData?.name || "User"}
                </h1>

                <p className="text-xs text-[#ababab] font-medium truncate w-full">
                  {role || "Role"}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logoutMutation.mutate();
                }}
                disabled={logoutMutation.isPending}
                className="text-[#f5f5f5] hover:text-red-500 disabled:opacity-60 transition"
                title="Logout"
              >
                <IoLogOut size={32} className="sm:w-9 sm:h-9" />
              </button>
            </div>
          </div>
        </div>

        {!isCook && (
          <div className="lg:hidden mt-3 flex items-center gap-3 bg-[#1f1f1f] rounded-xl px-4 py-2">
            <FaSearch className="text-[#f5f5f5] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full text-sm"
            />
          </div>
        )}
      </div>

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        refetchNotifications={refetchNotifications}
        stopSound={stopSound}
        userRole={role}
      />
    </header>
  );
};

const IconButton = ({ title, onClick, children, badge = 0, badgeColor }) => {
  return (
    <button
      onClick={onClick}
      className="relative bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-xl p-2.5 sm:p-3 cursor-pointer transition"
      title={title}
    >
      {children}
      {badge > 0 && <Badge count={badge} color={badgeColor} />}
    </button>
  );
};

const Badge = ({ count, color }) => {
  return (
    <span
      className={`absolute -top-2 -right-2 ${color} text-white text-[10px] sm:text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default Header;
