const COLORS = {
  ready: "#22c55e",
  preparing: "#f59e0b",
  waiting: "#6366f1",
};

const polarToCartesian = (cx, cy, r, angle) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

const OrderPieProgress = ({ ready = 0, preparing = 0, waiting = 0 }) => {
  const total = Math.max(ready + preparing + waiting, 1);

  const data = [
    { label: "Ready", value: ready, color: COLORS.ready },
    { label: "Preparing", value: preparing, color: COLORS.preparing },
    { label: "Waiting", value: waiting, color: COLORS.waiting },
  ].filter((item) => item.value > 0);

  let currentAngle = 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28">
        {data.map((item) => {
          const angle = (item.value / total) * 360;
          const path = describeArc(
            50,
            50,
            45,
            currentAngle,
            currentAngle + angle,
          );
          currentAngle += angle;

          return <path key={item.label} d={path} fill={item.color} />;
        })}
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px] font-bold">
        {data.map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
};

export default OrderPieProgress;
