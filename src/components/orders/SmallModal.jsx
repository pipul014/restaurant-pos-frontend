const SmallModal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
      <div className="bg-[#262626] rounded-2xl p-4 sm:p-6 w-full max-w-lg border border-[#333] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-white text-lg sm:text-xl font-bold">{title}</h2>

          <button
            onClick={onClose}
            className="bg-[#1f1f1f] text-white px-3 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export default SmallModal;
