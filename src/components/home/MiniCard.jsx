// import React from "react";

// const MiniCard = ({ title, icon, number, footerNum = 0 }) => {
//   const isRevenueCard = title === "Total Earnings";

//   return (
//     <div className="bg-[#1a1a1a] rounded-xl p-4 sm:p-5 lg:p-6 w-full">
//       <div className="flex items-start justify-between gap-3">
//         <h2 className="text-[#f5f5f5] text-sm sm:text-base lg:text-lg font-semibold tracking-wide leading-tight">
//           {title}
//         </h2>

//         <div
//           className={`${
//             isRevenueCard ? "bg-[#02ca3a]" : "bg-[#f6b100]"
//           } flex items-center justify-center rounded-lg p-3 text-white text-lg sm:text-xl lg:text-2xl shrink-0`}
//         >
//           {icon}
//         </div>
//       </div>

//       <div className="mt-4 sm:mt-5">
//         <h1
//           className={`text-[#f5f5f5] font-bold break-words ${
//             isRevenueCard
//               ? "text-xl sm:text-2xl lg:text-3xl xl:text-4xl"
//               : "text-3xl sm:text-4xl"
//           }`}
//         >
//           {isRevenueCard
//             ? `₹${Number(number || 0).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}`
//             : Number(number || 0)}
//         </h1>

//         <p className="text-[#ababab] text-xs sm:text-sm lg:text-base mt-2">
//           <span className="text-[#02ca3a] font-semibold">{footerNum}%</span>{" "}
//           than yesterday
//         </p>
//       </div>
//     </div>
//   );
// };

// export default MiniCard;

import React from "react";

const MiniCard = ({ title, icon, number, footerNum, footerText = "" }) => {
  const isRevenueCard = title === "Total Earnings";

  return (
    <div className="w-full rounded-xl bg-[#1a1a1a] p-4 sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold leading-tight tracking-wide text-[#f5f5f5] sm:text-base lg:text-lg">
          {title}
        </h2>

        <div
          className={`${
            isRevenueCard ? "bg-[#02ca3a]" : "bg-[#f6b100]"
          } flex shrink-0 items-center justify-center rounded-lg p-3 text-lg text-white sm:text-xl lg:text-2xl`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 sm:mt-5">
        <h1
          className={`break-words font-bold text-[#f5f5f5] ${
            isRevenueCard
              ? "text-xl sm:text-2xl lg:text-3xl xl:text-4xl"
              : "text-3xl sm:text-4xl"
          }`}
        >
          {isRevenueCard
            ? `₹${Number(number || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : Number(number || 0)}
        </h1>

        <p className="mt-2 text-xs text-[#ababab] sm:text-sm lg:text-base">
          {footerNum !== undefined && footerNum !== null ? (
            <>
              <span className="font-semibold text-[#02ca3a]">
                {Number(footerNum || 0)}%
              </span>{" "}
              {footerText || "than yesterday"}
            </>
          ) : (
            footerText
          )}
        </p>
      </div>
    </div>
  );
};

export default MiniCard;
