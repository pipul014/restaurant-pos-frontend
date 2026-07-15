import React from "react";
import { motion } from "framer-motion";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-lg border border-[#333] max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center gap-4 px-4 sm:px-6 py-4 border-b border-[#333]">
          <h2 className="text-lg sm:text-xl text-[#f5f5f5] font-semibold break-words">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-[#ababab] hover:text-red-500 bg-[#262626] w-9 h-9 rounded-lg text-2xl flex items-center justify-center shrink-0"
          >
            &times;
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-76px)]">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Modal;
