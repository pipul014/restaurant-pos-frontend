import SmallModal from "./SmallModal";
import { ITEM_NOTE_OPTIONS } from "../../redux/slices/cartSlice";

const NoteModal = ({
  noteData,
  selectedNote,
  setSelectedNote,
  onClose,
  onSubmit,
  loading,
}) => {
  return (
    <SmallModal title="Update Item Note" onClose={onClose}>
      <p className="text-white font-semibold">{noteData.item.name}</p>

      <p className="text-[#ababab] text-sm mt-1">
        Note can be changed only while item is PENDING.
      </p>

      <select
        value={selectedNote}
        onChange={(e) => setSelectedNote(e.target.value)}
        className="w-full mt-4 bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
      >
        {ITEM_NOTE_OPTIONS.map((note) => (
          <option key={note || "none"} value={note}>
            {note || "No Note"}
          </option>
        ))}
      </select>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full mt-4 bg-[#f6b100] hover:bg-yellow-500 disabled:opacity-60 text-black py-3 rounded-xl font-bold"
      >
        Update Note
      </button>
    </SmallModal>
  );
};

export default NoteModal;
