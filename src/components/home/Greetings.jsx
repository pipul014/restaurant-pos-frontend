import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Greetings = () => {
  const userData = useSelector((state) => state.user);

  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = dateTime.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";

    return "Good Night";
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour12: false,
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-5">
      <div className="bg-[#1a1a1a] rounded-xl p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left Section */}
          <div className="min-w-0">
            <h1 className="text-[#f5f5f5] text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide break-words">
              {getGreeting()},{" "}
              <span className="text-[#F6B100]">
                {userData?.name || "TEST USER"}
              </span>
            </h1>

            <p className="text-[#ababab] text-sm sm:text-base mt-2">
              Give your best service to customers 😀
            </p>
          </div>

          {/* Right Section */}
          <div className="lg:text-right">
            <h2 className="text-[#f5f5f5] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide">
              {formatTime(dateTime)}
            </h2>

            <p className="text-[#ababab] text-sm sm:text-base mt-1">
              {formatDate(dateTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Greetings;
