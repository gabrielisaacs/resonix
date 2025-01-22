import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaEllipsisH, FaClock, FaDownload } from 'react-icons/fa';
import { MdErrorOutline } from "react-icons/md";
import { usePlayer } from '../context/PlayerContext';
import api from '../services/api';
import { saveAs } from 'file-saver';

const CURRENT_DATE = '2025-01-17 21:19:53';
const CURRENT_USER = 'gabrielisaacs';

const AlbumDetails = ({ id }) => {
  const { setCurrentTrack, setQueue, isPlaying, currentTrack } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.getAlbumDetails(id);
        console.log('Album details response:', response);

        if (response.data) {
          setAlbum(response.data.album);
          setTracks(response.data.tracks || []);
        } else {
          throw new Error('No album data received');
        }
      } catch (err) {
        console.error('Error fetching album details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [id]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setQueue(tracks.slice(1));
    }
  };

  const handlePlayTrack = (track, index) => {
    setCurrentTrack(track);
    setQueue(tracks.slice(index + 1));
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDownloadTrack = async (track) => {
    if (!track.download_url) {
      console.error('No download URL available');
      return;
    }

    try {
      const response = await fetch(track.download_url);
      const blob = await response.blob();
      saveAs(blob, `${track.title}.mp3`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDownloadAlbum = async () => {
    if (!tracks.length) return;

    // Create a zip file of all tracks
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    try {
      // Add all tracks to zip
      const downloadPromises = tracks.map(async (track) => {
        if (!track.download_url) return;

        const response = await fetch(track.download_url);
        const blob = await response.blob();
        zip.file(`${track.title}.mp3`, blob);
      });

      await Promise.all(downloadPromises);

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${album.title}.zip`);
    } catch (error) {
      console.error('Album download failed:', error);
    }
  };

  const truncateTitle = (title, maxLength) => {
    if (!title) return '';
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;
  if (!album) return <div>Album not found</div>;

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="flex flex-col bg-transparent px-10 -mt-16">
        {/* Album Header */}
        <div className="flex items-end gap-6 p-6 h-[20rem] bg-transparent">
          <img
            src={album.thumbnail}
            alt={album.title}
            className="w-[10.75rem] h-[10.75rem] shadow-2xl rounded-lg"
          />
          <div className="flex flex-col gap-3">
            <span className="text-md font-bold">Album</span>
            <h1 className="text-[5rem] font-bold leading-tight">{truncateTitle(album.title, 15)}</h1>
            <div className="flex items-center gap-2 text-md">
              <img
                src={album.artist_image || '/artist_thumb.jpeg'}
                alt={album.artist}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-bold hover:underline cursor-pointer">
                {album.artist}
              </span>
              <span className="text-neutral-400">• {album.releaseDate?.split('-')[0]}</span>
              <span className="text-neutral-400">• {tracks.length} songs</span>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-8 p-6">
          <button
            onClick={handlePlayAll}
            className="w-42 h-12 flex items-center justify-center bg-transparent hover:bg-neutral-800 border border-neutral-600 rounded-full hover:scale-105 transition-all duration-300 text-white text-sm px-10 gap-2"
          >
            <FaPlay />
            Play all
          </button>
          <button className="bg-transparent text-white">
            <FaHeart size={24} className='hover:fill-red-500' />
          </button>
          <button
            onClick={handleDownloadAlbum}
            className="bg-transparent text-white hover:text-[#08B2F0] transition-colors"
          >
            <FaDownload size={24} />
          </button>
          <button className="bg-transparent text-white">
            <FaEllipsisH size={24} />
          </button>
        </div>

        {/* Tracks List */}
        <div className="px-6 pb-36">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-neutral-400 border-b border-neutral-800 transition-all duration-300">
                <th className="px-4 py-2 text-left w-12">#</th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Plays</th>
                <th className="px-4 py-2 text-center">Download</th>
                <th className="px-4 py-2 text-right">
                  <FaClock className="ml-auto mr-2.5" />
                </th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, index) => (
                <tr
                  key={track.id}
                  className="group hover:bg-neutral-800/50 rounded-lg transition-colors"
                  onClick={() => handlePlayTrack(track, index)}
                >
                  <td className="px-4 py-3 text-neutral-400 w-12">
                    <div className="relative w-4">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <FaPlay className="hidden group-hover:block absolute -top-2 text-white" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-10 h-10 rounded"
                      />
                      <div className="flex flex-col">
                        <span className={`font-normal ${currentTrack?.id === track.id ? 'text-[#08B2F0]' : ''
                          }`}>
                          {track.title}
                        </span>
                        <span className="text-sm text-neutral-400">
                          {track.artist}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {track.likes}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadTrack(track);
                      }}
                      className="bg-transparent text-neutral-400 hover:text-[#08B2F0] transition-colors"
                    >
                      <FaDownload size={16} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-400">
                    {formatDuration(track.duration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col min-h-screen bg-neutral-900 p-6 animate-pulse">
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col bg-neutral-900 p-6 animate-pulse">
        <div className="flex flex-col gap-4">
          <div className="w-20 h-6 bg-neutral-800 rounded"></div>
          <div className="w-96 h-24 bg-neutral-800 rounded"></div>
          <div className="w-64 h-6 bg-neutral-800 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center h-[75vh] w-[60rem] mx-16 fixed">
    <div className="text-neutral-600 flex flex-col items-center">
      <MdErrorOutline size={102} className='m-auto' />
      <p className="text-2xl mb-2 font-extrabold">Unable to load content</p>
      <p className="text-sm">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-sm mt-4 px-8 py-2 bg-transparent border rounded-full border-neutral-700 hover:bg-neutral-800 transition-all duration-200"
      >
        Retry
      </button>
    </div>
  </div>
);

export default AlbumDetails;