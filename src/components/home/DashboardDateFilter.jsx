import React, { useEffect, useState } from "react";

const getTodayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const OPTIONS = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom" },
];

const DashboardDateFilter = ({ value, onApply, isLoading = false }) => {
  const today = getTodayInputValue();
  const [preset, setPreset] = useState(value?.preset || "today");
  const [startDate, setStartDate] = useState(value?.startDate || today);
  const [endDate, setEndDate] = useState(value?.endDate || today);

  useEffect(() => {
    setPreset(value?.preset || "today");
    setStartDate(value?.startDate || today);
    setEndDate(value?.endDate || today);
  }, [value?.preset, value?.startDate, value?.endDate, today]);

  const applyPreset = (nextPreset) => {
    setPreset(nextPreset);

    if (nextPreset !== "custom") {
      onApply({ preset: nextPreset });
    }
  };

  const applyCustom = () => {
    if (!startDate || !endDate) return;

    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      return;
    }

    onApply({
      preset: "custom",
      startDate,
      endDate,
    });
  };

  return (
    <div className="mt-6 rounded-xl border border-[#333] bg-[#1a1a1a] p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Dashboard Period
          </h2>
          <p className="mt-1 text-xs text-[#ababab] sm:text-sm">
            Earnings and sold items use the same selected period.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isLoading}
              onClick={() => applyPreset(option.value)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                preset === option.value
                  ? "bg-[#f6b100] text-black"
                  : "border border-[#3a3a3a] bg-[#262626] text-[#ababab] hover:bg-[#333] hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {preset === "custom" && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-xs font-medium text-[#ababab]">
            From
            <input
              type="date"
              value={startDate}
              max={endDate || today}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#333] bg-[#262626] p-3 text-white outline-none focus:border-[#f6b100]"
            />
          </label>

          <label className="text-xs font-medium text-[#ababab]">
            To
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#333] bg-[#262626] p-3 text-white outline-none focus:border-[#f6b100]"
            />
          </label>

          <button
            type="button"
            disabled={
              isLoading ||
              !startDate ||
              !endDate ||
              new Date(startDate).getTime() > new Date(endDate).getTime()
            }
            onClick={applyCustom}
            className="self-end rounded-lg bg-[#f6b100] px-6 py-3 font-bold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Apply"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardDateFilter;
