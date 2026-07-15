const InfoPill = ({ label, value }) => (
  <div className="bg-[#1f1f1f] border border-[#333] rounded-xl px-3 py-2">
    <p className="text-[#777] text-[11px]">{label}</p>
    <p className="text-white text-sm font-bold truncate">{value}</p>
  </div>
);

export default InfoPill;
