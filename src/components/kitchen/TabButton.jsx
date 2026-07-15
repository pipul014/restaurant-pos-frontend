const TabButton = ({ title, activeTab, setActiveTab }) => {
  return (
    <button
      onClick={() => setActiveTab(title)}
      className={`px-5 sm:px-6 py-3 rounded-lg font-bold whitespace-nowrap transition ${
        activeTab === title
          ? "bg-yellow-400 text-black"
          : "bg-[#262626] text-[#ababab] hover:text-white"
      }`}
    >
      {title}
    </button>
  );
};

export default TabButton;
