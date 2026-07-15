const CountCard = ({ title, count, icon, color }) => {
  return (
    <div className="bg-[#262626] p-4 sm:p-5 rounded-xl flex justify-between items-center">
      <div>
        <p className="text-[#ababab] text-sm">{title}</p>

        <h2 className="text-white text-3xl sm:text-4xl font-bold mt-2">
          {count}
        </h2>
      </div>

      <div className={`${color} text-white p-3 sm:p-4 rounded-lg text-xl`}>
        {icon}
      </div>
    </div>
  );
};

export default CountCard;
