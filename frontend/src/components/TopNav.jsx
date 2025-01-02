import React from 'react';
import { LuSearch } from "react-icons/lu";


const TopNav = () => {
  return (
    <div className='flex flex-row bg-transparent items-center py-10 px-16 h-[4.375rem] w-full mx-auto sticky top-0 z-50 bg-white-400 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-20'>
      {/* Searchbar */}
      <div className='flex bg-[#212121] h-[2.5rem] rounded-xl border border-neutral-800 m-4 items-center p-4 transition-all duration-300 hover:w-[40rem] focus-within:w-[40rem] w-[30rem]'>
        <LuSearch className='w-4 h-4' />
        <input
          type='search'
          name='searchbar'
          id='searchbar'
          placeholder='Search'
          className='bg-transparent w-full focus:outline-none p-2 placeholder:text-sm'
        />
      </div>
    </div>
  )
}

export default TopNav;