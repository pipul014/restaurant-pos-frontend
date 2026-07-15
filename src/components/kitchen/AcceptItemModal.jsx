//update time
import { getOrderDisplayId } from "./helpers";

const QUICK_TIMES = [5, 10, 15, 20, 25, 30];

const AcceptItemModal = ({
  data,
  customPrepTime,
  setCustomPrepTime,
  onClose,
  onSubmit,
  loading,
}) => {
  const selectedTime = Number(customPrepTime || 10);
  const isUpdateMode = ["ACCEPTED", "PREPARING"].includes(
    String(data?.item?.status || "").toUpperCase(),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#262626] border border-[#333] shadow-2xl p-5 sm:p-6 animate-[slideUp_0.2s_ease-out]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#555] sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              {isUpdateMode ? "Update Timer" : "Accept Item"}
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              {isUpdateMode ? "Change Preparation Time" : "Start Preparation"}
            </h2>

            <p className="mt-1 text-sm text-[#ababab] break-words">
              {data.item.name} / {getOrderDisplayId(data.order)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 w-10 shrink-0 rounded-full bg-[#1f1f1f] text-white font-black border border-[#333] disabled:opacity-60"
          >
            ×
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-[#1a1a1a] border border-[#333] p-4">
          <label className="block text-sm font-bold text-[#e5e5e5]">
            Select preparation time
          </label>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {QUICK_TIMES.map((minute) => (
              <button
                key={minute}
                type="button"
                disabled={loading}
                onClick={() => setCustomPrepTime(minute)}
                className={`rounded-2xl py-3 text-sm font-black transition active:scale-[0.98] disabled:opacity-60 ${
                  selectedTime === minute
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                    : "bg-[#262626] text-white border border-[#3a3a3a]"
                }`}
              >
                {minute}
                <span className="ml-1 text-xs opacity-70">min</span>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#ababab]">
              Custom minutes
            </label>

            <input
              value={customPrepTime}
              onChange={(e) => setCustomPrepTime(e.target.value)}
              type="number"
              min="1"
              max="180"
              inputMode="numeric"
              placeholder="Enter minutes"
              className="w-full rounded-2xl border border-[#333] bg-[#111] px-4 py-4 text-lg font-black text-white outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 px-4 py-3">
          <p className="text-xs leading-5 text-yellow-200">
            Selected time:{" "}
            <span className="font-black text-yellow-400">
              {selectedTime || 10} minutes
            </span>
            . Customer tracking will update automatically.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl bg-[#1f1f1f] border border-[#333] py-4 text-sm font-black text-white disabled:opacity-60 active:scale-[0.98]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-2xl bg-yellow-400 py-4 text-sm font-black text-black disabled:opacity-60 active:scale-[0.98]"
          >
            {loading
              ? isUpdateMode
                ? "Updating..."
                : "Accepting..."
              : isUpdateMode
                ? "Update Time"
                : "Accept & Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptItemModal;
