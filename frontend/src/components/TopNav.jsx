import React from 'react';
import SearchBar from './SearchBar';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const TopNav = () => {
  return (
    <div className='flex flex-row bg-transparent items-center py-10 px-16 h-[4.375rem] w-full '>
      {/* Searchbar */}
      <SearchBar />

      {/* Profile */}

      <button className="flex w-[2.5rem] h-[2.5rem] bg-[#212121] rounded-full ml-auto border border-neutral-800">
        <p className="text-white opacity-60 text-xs text-center m-auto ">Gi</p>
      </button>
    </div>
  )
}

export default TopNav;