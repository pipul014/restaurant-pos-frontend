import React from "react";
import { popularDishes } from "../../constants";

const PopularDishes = () => {
  return (
    <div className="mt-6 w-full">
      <div className="bg-[#1a1a1a] w-full rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-[#2a2a2a]">
          <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold tracking-wide">
            Popular Dishes
          </h1>

          <button
            type="button"
            className="text-[#025cca] text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            View all
          </button>
        </div>

        <div className="max-h-[420px] xl:max-h-[680px] overflow-y-auto scrollbar-hide p-4 sm:p-6 space-y-4">
          {popularDishes.length > 0 ? (
            popularDishes.map((dish) => (
              <div
                key={dish.id}
                className="flex items-center gap-3 sm:gap-4 bg-[#1f1f1f] rounded-xl px-4 sm:px-5 py-4"
              >
                <h1 className="text-[#f5f5f5] font-bold text-base sm:text-xl min-w-[32px]">
                  {dish.id < 10 ? `0${dish.id}` : dish.id}
                </h1>

                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-12 h-12 sm:w-[55px] sm:h-[55px] rounded-full object-cover shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <h1 className="text-[#f5f5f5] font-semibold tracking-wide text-sm sm:text-base truncate">
                    {dish.name}
                  </h1>

                  <p className="text-[#f5f5f5] text-xs sm:text-sm font-semibold mt-1">
                    <span className="text-[#ababab]">Orders: </span>
                    {dish.numberOfOrders}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-[#ababab] py-10">
              No popular dishes found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
