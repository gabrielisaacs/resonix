import React from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const TopNav = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-row bg-transparent items-center py-10 px-16 h-[4.375rem] mx-auto sticky top-0 z-50 bg-white-400 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20">
      {/* Searchbar */}
      <div className="w-3/4 flex bg-neutral-800 h-[2.5rem] rounded-xl border border-neutral-600 my-4 items-center p-4 transition-all duration-400 hover:w-full shadow-2xl">
        <LuSearch className="w-4 h-4" />
        <input
          type="search"
          name="searchbar"
          id="searchbar"
          placeholder="Search"
          className="bg-transparent w-full focus:outline-none p-2 placeholder:text-sm"
        />
      </div>
    </div>
  );
};

export default TopNav;
