import SmallModal from "./SmallModal";

const QuantityModal = ({
  quantityData,
  newQuantity,
  setNewQuantity,
  onClose,
  onSubmit,
  loading,
}) => {
  return (
    <SmallModal title="Update Quantity" onClose={onClose}>
      <p className="text-white font-semibold">{quantityData.item.name}</p>

      <p className="text-[#ababab] text-sm mt-1">
        Quantity can be changed only while item is PENDING.
      </p>

      <input
        value={newQuantity}
        onChange={(e) => setNewQuantity(e.target.value)}
        type="number"
        min="1"
        className="w-full mt-4 bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
      />

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full mt-4 bg-[#f6b100] hover:bg-yellow-500 disabled:opacity-60 text-black py-3 rounded-xl font-bold"
      >
        Update Quantity
      </button>
    </SmallModal>
  );
};

export default QuantityModal;
