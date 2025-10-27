import React from 'react';
import SideBar from '../components/SideBar';
import TopNav from '../components/TopNav';
import BottomPlayer from '../components/BottomPlayer';
import PlayerHome from '../components/PlayerHome';
import SongList from '../components/SongList';

const MusicPlayer = () => {
  return (
    <div className="flex">
      <SideBar />
      <div className="flex flex-col min-h-screen w-full ml-[15rem]">
        <TopNav />
        <div className="flex-1">
          <PlayerHome />
        </div>
        <BottomPlayer />
      </div>
    </div>
  );
};

export default MusicPlayer;