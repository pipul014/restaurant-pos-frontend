import React from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go Back"
      className="
        bg-[#025cca]
        hover:bg-[#0a6be8]
        active:scale-95
        transition-all
        duration-200
        rounded-full
        text-white
        shadow-md
        flex
        items-center
        justify-center
        w-10
        h-10
        sm:w-11
        sm:h-11
        md:w-12
        md:h-12
      "
    >
      <IoArrowBackOutline className="text-lg sm:text-xl md:text-2xl" />
    </button>
  );
};

export default BackButton;
