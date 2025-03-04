import React from 'react';
import { FaPlay } from "react-icons/fa";
import { usePlaylistThumbnail } from '../hooks/usePlaylistThumbnail';

const PlaylistCard = ({ playlist, onClick, truncateTitle }) => {
  const thumbnail = usePlaylistThumbnail(playlist.id);

  return (
    <button
      onClick={() => onClick(playlist)}
      className='flex flex-col bg-white bg-opacity-[2%] rounded-xl w-[11.45rem] h-full p-3 gap-4 hover:border-none transition-all relative group hover:bg-opacity-5'
    >
      <div className="opacity-0 group-hover:opacity-100 flex bg-white w-10 h-10 rounded-full shadow-2xl absolute right-6 top-[7.5rem] hover:scale-110 transition-all duration-300">
        <FaPlay className='m-auto shadow-lg fill-black' />
      </div>
      <img
        src={thumbnail || '/thumbnail.png'}
        className="rounded-xl h-auto w-full shadow-md object-cover"
        alt={playlist.title}
        loading="lazy"
      />
      <div className="flex flex-col text-left">
        <p className='font-bold text-lg'>{truncateTitle(playlist.title, 12)}</p>
        <p className='font-bold text-sm text-neutral-400'>{truncateTitle(playlist.artist, 18)}</p>
      </div>
    </button>
  );
};

export default PlaylistCard;