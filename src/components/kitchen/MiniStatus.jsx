const MiniStatus = ({ label, count, className }) => (
  <div className={`${className} rounded-lg py-2`}>
    <p>{label}</p>
    <p className="font-bold">{count}</p>
  </div>
);

export default MiniStatus;
