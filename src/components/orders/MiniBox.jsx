const MiniBox = ({ label, value, tone }) => {
  const tones = {
    yellow: "bg-yellow-500/15 text-yellow-400",
    blue: "bg-blue-500/15 text-blue-400",
    green: "bg-green-500/15 text-green-400",
    sky: "bg-sky-500/15 text-sky-400",
    purple: "bg-purple-500/15 text-purple-400",
    red: "bg-red-500/15 text-red-400",
  };

  return (
    <div className={`${tones[tone]} rounded-xl py-2 px-1`}>
      <p className="text-[10px]">{label}</p>
      <p className="font-black text-sm">{value}</p>
    </div>
  );
};

export default MiniBox;
