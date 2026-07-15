const ActionButton = ({ label, onClick, disabled, danger, success }) => {
  const color = danger
    ? "bg-red-500 hover:bg-red-600 text-white"
    : success
      ? "bg-green-500 hover:bg-green-600 text-white"
      : "bg-[#333] hover:bg-[#444] text-white";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${color} disabled:bg-[#1f1f1f] disabled:text-[#777] py-2.5 rounded-xl text-xs font-bold transition`}
    >
      {label}
    </button>
  );
};

export default ActionButton;
