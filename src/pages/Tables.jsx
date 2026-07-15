import React, { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  const {
    data: resData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong while loading tables!", {
        variant: "error",
      });
    }
  }, [isError]);

  const tableData = resData?.data?.data || [];

  const filteredTables = useMemo(() => {
    if (status === "all") return tableData;

    return tableData.filter((table) => table.status?.toLowerCase() === status);
  }, [tableData, status]);

  const counts = useMemo(() => {
    return {
      all: tableData.length,
      booked: tableData.filter(
        (table) => table.status?.toLowerCase() === "booked",
      ).length,
      available: tableData.filter(
        (table) => table.status?.toLowerCase() === "available",
      ).length,
    };
  }, [tableData]);

  return (
    <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-24">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton />

            <div>
              <h1 className="text-[#f5f5f5] text-2xl sm:text-3xl font-bold tracking-wider">
                Tables
              </h1>

              <p className="text-[#ababab] text-sm mt-1">
                Select a table for dine-in orders.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-3 min-w-max">
              <FilterButton
                label={`All (${counts.all})`}
                active={status === "all"}
                onClick={() => setStatus("all")}
              />

              <FilterButton
                label={`Booked (${counts.booked})`}
                active={status === "booked"}
                onClick={() => setStatus("booked")}
              />

              <FilterButton
                label={`Available (${counts.available})`}
                active={status === "available"}
                onClick={() => setStatus("available")}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-[#262626] rounded-xl p-8 text-center text-white mt-6">
            Loading tables...
          </div>
        ) : filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 mt-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-1">
            {filteredTables.map((table) => (
              <TableCard
                key={table._id}
                id={table._id}
                name={table.tableNo}
                status={table.status}
                initials={table?.currentOrder?.customerDetails?.name}
                seats={table.seats}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#262626] rounded-xl p-8 text-center text-[#ababab] mt-6">
            No tables found
          </div>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

const FilterButton = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 sm:px-5 py-2 font-semibold text-sm sm:text-base whitespace-nowrap transition ${
        active
          ? "bg-[#383838] text-[#f5f5f5]"
          : "bg-[#262626] text-[#ababab] hover:bg-[#333] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
};

export default Tables;
