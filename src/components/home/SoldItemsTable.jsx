import React, { useEffect, useMemo, useState } from "react";
import { getSoldItems } from "../../https";
import { FiSearch } from "react-icons/fi";

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const SoldItemsTable = () => {
  const [soldItemsData, setSoldItemsData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchSoldItems = async () => {
    try {
      setIsLoading(true);

      const params = {};
      if (selectedDate) params.date = selectedDate;

      const { data } = await getSoldItems(params);

      setSoldItemsData(data?.data || []);
    } catch (error) {
      console.log("Sold items fetch error:", error);
      setSoldItemsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSoldItems();
  }, []);

  const soldItems = useMemo(() => {
    let result = [...soldItemsData];

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((item) =>
        item.name?.toLowerCase().includes(query),
      );
    }

    return result.sort(
      (a, b) => Number(b.quantity || 0) - Number(a.quantity || 0),
    );
  }, [soldItemsData, search]);

  const totalQuantity = soldItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const totalAmount = soldItems.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  return (
    <div className="mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#262626] rounded-xl p-4 sm:p-5 overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-[#f5f5f5] text-lg sm:text-xl font-semibold">
              Sold Items
            </h2>

            <p className="text-[#ababab] text-sm mt-1">
              Paid order items summary
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full xl:w-auto">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <FiSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />

              <input
                type="text"
                placeholder="Search item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1a1a1a] pl-10 p-3 rounded-lg text-white outline-none w-full xl:w-[230px]"
              />
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#1a1a1a] p-3 rounded-lg text-white outline-none w-full"
            />

            <button
              onClick={fetchSoldItems}
              disabled={isLoading}
              className="bg-[#f6b100] hover:bg-yellow-500 disabled:opacity-60 text-black px-5 py-3 rounded-lg font-semibold"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>

            <button
              onClick={() => {
                setSearch("");
                setSelectedDate("");
              }}
              className="bg-[#1a1a1a] hover:bg-[#333] text-[#ababab] px-5 py-3 rounded-lg font-semibold"
            >
              Clear
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-[#ababab]">
            Loading sold items...
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <div className="max-h-[420px] overflow-y-auto scrollbar-hide min-w-[720px]">
                <table className="w-full text-left text-white">
                  <thead className="bg-[#333] sticky top-0 z-10">
                    <tr>
                      <th className="p-4">S.No</th>
                      <th className="p-4">Item Name</th>
                      <th className="p-4">No. of Items</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {soldItems.length > 0 ? (
                      soldItems.map((item, index) => (
                        <tr
                          key={`${item.name}-${item.price}-${index}`}
                          className="border-b border-gray-700 hover:bg-[#2d2d2d]"
                        >
                          <td className="p-4">{index + 1}</td>
                          <td className="p-4">{item.name}</td>
                          <td className="p-4">{item.quantity}</td>
                          <td className="p-4">{formatMoney(item.price)}</td>
                          <td className="p-4 font-semibold">
                            {formatMoney(item.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-8 text-gray-400"
                        >
                          No sold items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {soldItems.length > 0 ? (
                soldItems.map((item, index) => (
                  <div
                    key={`${item.name}-${item.price}-${index}`}
                    className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[#ababab] text-xs">#{index + 1}</p>

                        <h3 className="text-white font-semibold mt-1 break-words">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-yellow-400 font-bold whitespace-nowrap">
                        x {item.quantity}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div>
                        <p className="text-[#ababab]">Price</p>
                        <p className="text-white font-semibold">
                          {formatMoney(item.price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#ababab]">Total</p>
                        <p className="text-green-400 font-semibold">
                          {formatMoney(item.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 bg-[#1a1a1a] rounded-xl">
                  No sold items found
                </div>
              )}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 text-white">
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-[#ababab] text-sm">Total Items</p>
            <h3 className="text-xl font-bold mt-1">{totalQuantity}</h3>
          </div>

          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-[#ababab] text-sm">Total Amount</p>
            <h3 className="text-xl font-bold mt-1">
              {formatMoney(totalAmount)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoldItemsTable;
