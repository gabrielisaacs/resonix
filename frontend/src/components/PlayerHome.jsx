import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { usePlayer } from '../context/PlayerContext';
import { useDataFetching } from '../hooks/useDataFetching';
import api from '../services/api';
import { MdErrorOutline } from "react-icons/md";
import PlaylistCard from './PlaylistCard';
import ArtistCard from './ArtistCard';
import helpers from '../utils/utilityFunctions.js';

// Constants
const CURRENT_DATE = '2025-01-23 00:03:46';
const CURRENT_USER = 'gabrielisaacs';
const DEFAULT_THUMBNAIL = '/thumbnail.png';

// Data transformation functions
const transformJamendoTrack = (track) => ({
  id: track.id,
  title: track.name || track.title,
  artist: track.artist_name || track.artist,
  thumbnail: track.image || track.thumbnail || DEFAULT_THUMBNAIL,
  url: track.audio || track.url,
  duration: track.duration,
  likes: `${Math.floor((track.listened || 0) / 1000)}k Plays`
});

const transformJamendoArtist = (artist) => ({
  id: artist.id,
  name: artist.name,
  image: artist.image && artist.image.trim() !== ''
    ? artist.image
    : `https://usercontent.jamendo.com?type=artist&id=${artist.id}&width=300`,
  followerCount: artist.sharecount || 0
});

const transformJamendoAlbum = (album) => ({
  id: album.id,
  title: album.name || album.title,
  artist: album.user_name || album.artist,
  thumbnail: album.image || album.thumbnail || DEFAULT_THUMBNAIL,
  trackCount: album.tracks_count || 0
});

const transformJamendoPlaylist = (playlist) => {
  return ({
    id: playlist.id,
    title: helpers.capitalize(playlist.title) || '',
    artist: helpers.capitalize(playlist.artist) || '',
    thumbnail: `https://usercontent.jamendo.com?type=playlist&id=${playlist.id}&width=300`,
    creationDate: playlist.creationDate,
    shareUrl: playlist.shareUrl,
    shortUrl: playlist.shortUrl,
    userId: playlist.userId
  });
};

// Loading components
const SectionLoadingMessage = () => (
  <div className="animate-pulse flex flex-col">
    <div className="h-10 w-[20rem] bg-neutral-800 rounded-2xl"></div>
    <div className="grid grid-cols-5 gap-4 mt-[1rem]">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-[11.5rem] h-[14rem] bg-neutral-800 mb-4 rounded-3xl"></div>
      ))}
    </div>
  </div>
);

const LoadingMessage = () => (
  <div className="flex mx-16 h-screen max-w-[60rem]">
    <div className="flex flex-col mt-[1.75rem] gap-[5rem]">
      {[...Array(3)].map((_, index) => (
        <SectionLoadingMessage key={index} />
      ))}
    </div>
  </div>
);

// Error message component with retry capability
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex justify-center items-center p-4 bg-neutral-900 rounded-lg">
    <div className="text-neutral-400 flex flex-col items-center">
      <MdErrorOutline size={24} className="mb-2" />
      <p className="text-sm mb-2">{message}</p>
      <button
        onClick={onRetry}
        className="text-sm px-4 py-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Section component with error handling and retry capability
const ContentSection = ({ title, loading, error, data, onRetry, children }) => {
  if (loading) return <SectionLoadingMessage />;
  if (error) return <ErrorMessage message={error.message} onRetry={onRetry} />;
  if (!data?.length) return null;

  return (
    <div className="flex flex-col mb-10">
      <h2 className="text-3xl font-extrabold mb-4">{title}</h2>
      {children}
    </div>
  );
};

const PlayerHome = () => {
  const { handleTrackSelect } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State for pagination
  const [visibleArtists, setVisibleArtists] = useState(0);
  const [visibleAlbums, setVisibleAlbums] = useState(0);
  const [visibleTrending, setVisibleTrending] = useState(0);
  const [visiblePlaylists, setVisiblePlaylists] = useState(0);

  // Constants
  const cardsPerSet = 5;
  const trendingCardsPerPage = 12;

  // Use the custom hook for data fetching with caching and retry
  const {
    data: artists,
    loading: loadingArtists,
    error: artistsError,
    retry: retryArtists
  } = useDataFetching(
    () => api.getTopArtists({ limit: 20 }),
    'top-artists',
    []
  );

  const {
    data: albums,
    loading: loadingAlbums,
    error: albumsError,
    retry: retryAlbums
  } = useDataFetching(
    () => api.getAlbums({ limit: 20 }),
    'albums',
    []
  );

  const {
    data: trendingSongs,
    loading: loadingTrending,
    error: trendingError,
    retry: retryTrending
  } = useDataFetching(
    () => api.getTrendingTracks({ limit: 30 }),
    'trending-tracks',
    []
  );

  const {
    data: playlists,
    loading: loadingPlaylists,
    error: playlistsError,
    retry: retryPlaylists
  } = useDataFetching(
    () => api.getPlaylists({ limit: 20 }),
    'playlists',
    []
  );

  // Transform the data
  const transformedArtists = artists ? artists.map(transformJamendoArtist) : [];
  const transformedAlbums = albums ? albums.map(transformJamendoAlbum) : [];
  const transformedTrending = trendingSongs ? trendingSongs.map(transformJamendoTrack) : [];
  const transformedPlaylists = playlists ? playlists.map(transformJamendoPlaylist) : [];

  // Navigation handlers
  const handleNext = (setVisible, visible, totalItems) => {
    if (visible + cardsPerSet < totalItems) {
      setVisible(visible + cardsPerSet);
      const section = document.getElementById('section-id');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = (setVisible, visible) => {
    if (visible - cardsPerSet >= 0) {
      setVisible(visible - cardsPerSet);
      // Optional: Smooth scroll to the section
      const section = document.getElementById('section-id');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Playback handlers
  const handlePlaySong = (song, index) => {
    const trackToPlay = {
      id: song.id,
      title: song.title || song.name,
      artist: song.artist || song.artist_name,
      artwork: song.thumbnail || song.image || DEFAULT_THUMBNAIL,
      url: song.url || song.audio,
      duration: song.duration,
      stream_url: song.url || song.audio
    };

    // Create remaining tracks array
    const remainingTracks = transformedTrending
      .slice(index + 1)
      .map(track => ({
        id: track.id,
        title: track.title || track.name,
        artist: track.artist || track.artist_name,
        artwork: track.thumbnail || track.image || DEFAULT_THUMBNAIL,
        url: track.url || track.audio,
        duration: track.duration,
        stream_url: track.url || track.audio
      }));

    handleTrackSelect(trackToPlay, remainingTracks);
    navigate(`/song/${song.id}`);
  };

  const handlePlayAll = () => {
    if (transformedTrending.length > 0) {
      const firstTrack = transformedTrending[0];
      const trackToPlay = {
        id: firstTrack.id,
        title: firstTrack.title || firstTrack.name,
        artist: firstTrack.artist || firstTrack.artist_name,
        artwork: firstTrack.thumbnail || firstTrack.image || DEFAULT_THUMBNAIL,
        url: firstTrack.url || firstTrack.audio,
        duration: firstTrack.duration,
        stream_url: firstTrack.url || firstTrack.audio
      };

      const remainingTracks = transformedTrending.slice(1).map(track => ({
        id: track.id,
        title: track.title || track.name,
        artist: track.artist || track.artist_name,
        artwork: track.thumbnail || track.image || DEFAULT_THUMBNAIL,
        url: track.url || track.audio,
        duration: track.duration,
        stream_url: track.url || track.audio
      }));

      handleTrackSelect(trackToPlay, remainingTracks);
    }
  };

  const handleArtistClick = (artist) => {
    window.scrollTo(0, 0);
    navigate(`/artist/${artist.id}`);
  };

  const handleAlbumClick = (album) => {
    window.scrollTo(0, 0);
    navigate(`/album/${album.id}`);
  };

  const handlePlaylistClick = (playlist) => {
    window.scrollTo(0, 0);
    console.log('CLICKED ON: ', playlist.id);
    navigate(`/playlist/${playlist.id}`);
  };

  const truncateTitle = (title, maxLength) => {
    if (!title) return '';
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  // Check if all sections are loading
  const isPageLoading = loadingArtists && loadingAlbums && loadingTrending && loadingPlaylists;

  if (isPageLoading) {
    return <LoadingMessage />;
  }

  // Check if there's no data at all
  const hasNoData = !transformedArtists.length && !transformedAlbums.length &&
    !transformedTrending.length && !transformedPlaylists.length;

  if (hasNoData && !isPageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-neutral-400">No content available</div>
      </div>
    );
  }

  // Main render
  return (
    <div className='max-w-[60rem] min-h-screen flex flex-col mt-6 mx-16 gap-10 transition-all duration-300'>
      {/* Popular Artists Section */}
      {transformedArtists.length > 0 && (
        <div className="flex flex-col mb-10 w-full">
          <div className='flex flex-row w-full mb-4 items-center'>
            <p className='text-3xl font-extrabold'>Popular Artists</p>
            <div className='ml-auto flex gap-2 items-center'>
              <button onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/artists');
              }} className="bg-transparent hover:bg-[#212121] py-2 px-4 rounded-full border border-neutral-800 text-sm">
                More
              </button>
              <button
                onClick={() => handlePrevious(setVisibleArtists, visibleArtists)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => handleNext(setVisibleArtists, visibleArtists, transformedArtists.length)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="flex flex-row bg-transparent h-[16rem] w-full gap-4">
            {transformedArtists
              .slice(visibleArtists, visibleArtists + cardsPerSet)
              .map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={handleArtistClick}
                  truncateTitle={truncateTitle}
                />
              ))}
          </div>
        </div>
      )}

      {/* Albums section */}
      {transformedAlbums.length > 0 && (
        <div className="flex flex-col mb-10">
          <div className='flex flex-row w-full mb-4 items-center'>
            <p className='text-3xl font-extrabold'>Albums for you</p>
            <div className='ml-auto flex gap-2 items-center'>
              <button
                onClick={() => handlePrevious(setVisibleAlbums, visibleAlbums)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => handleNext(setVisibleAlbums, visibleAlbums, transformedAlbums.length)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="flex flex-row bg-transparent h-[16rem] w-full gap-4 mt-4">
            {transformedAlbums
              .slice(visibleAlbums, visibleAlbums + cardsPerSet)
              .map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleAlbumClick(album)}
                  className='flex flex-col bg-white bg-opacity-[2%] rounded-xl w-[11.45rem] h-full p-3 gap-4 hover:border-none transition-all relative group hover:bg-opacity-5'
                >
                  <div className="opacity-0 group-hover:opacity-100 flex bg-white w-10 h-10 rounded-full shadow-2xl absolute right-6 top-[7.5rem] hover:scale-110 transition-all duration-300">
                    <FaPlay className='m-auto shadow-lg fill-black' />
                  </div>
                  <img
                    src={album.thumbnail}
                    className="rounded-xl h-auto w-full shadow-md object-cover"
                    alt={album.title}
                  />
                  <div className="flex flex-col text-left">
                    <p className='font-bold text-lg'>{truncateTitle(album.title, 12)}</p>
                    <p className='font-bold text-sm text-neutral-400'>{truncateTitle(album.artist, 18)}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Trending Songs Section */}
      {transformedTrending.length > 0 && (
        <div className="flex flex-col mb-10">
          <div className='flex flex-row w-full mb-4 items-center'>
            <p className='text-3xl font-extrabold'>Trending Tracks</p>
            <div className='ml-auto flex gap-2 items-center transition-all duration-300'>
              <button
                onClick={handlePlayAll}
                className="bg-transparent hover:bg-[#212121] py-2 px-4 rounded-full border border-neutral-800 text-sm"
              >
                Play all
              </button>
              <button
                onClick={() => handlePrevious(setVisibleTrending, visibleTrending)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => handleNext(setVisibleTrending, visibleTrending, transformedTrending.length)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 transition-all duration-300">
            {transformedTrending
              .slice(visibleTrending, visibleTrending + trendingCardsPerPage)
              .map((song, index) => (
                <button
                  key={song.id}
                  onClick={() => handlePlaySong(song, index + visibleTrending)}
                  className="flex flex-row bg-transparent hover:bg-white hover:bg-opacity-[2%] p-2 rounded-xl gap-3 group text-left transition-all"
                >
                  <div className="flex relative">
                    <img
                      src={song.thumbnail}
                      className='h-[3rem] w-[3rem] rounded-lg object-cover'
                      alt={song.title}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <FaPlay className='fill-white drop-shadow-lg' />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className='text-base truncate'>{truncateTitle(song.title, 20)}</p>
                    <div className="flex flex-row items-center gap-2">
                      <p className='text-sm opacity-45 truncate'>{song.artist}</p>
                      <span className='h-2 w-2 bg-white opacity-45 rounded-full flex-shrink-0'></span>
                      <p className='text-sm opacity-45 truncate'>{song.likes}</p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Playlists section */}
      {transformedPlaylists.length > 0 && (
        <div className="flex flex-col mb-[10rem]">
          <div className='flex flex-row w-full mb-4 items-center'>
            <p className='text-3xl font-extrabold'>Featured playlists</p>
            <div className='ml-auto flex gap-2 items-center'>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/playlists');
                }}
                className="bg-transparent hover:bg-[#212121] py-2 px-4 rounded-full border border-neutral-800 text-sm"
              >
                More
              </button>
              <button
                onClick={() => handlePrevious(setVisiblePlaylists, visiblePlaylists)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => handleNext(setVisiblePlaylists, visiblePlaylists, transformedPlaylists.length)}
                className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="flex flex-row bg-transparent h-[16rem] w-full gap-4 mt-4">
            {
              transformedPlaylists
              .slice(visiblePlaylists, visiblePlaylists + cardsPerSet)
              .map((playlist) => {
                { console.log("PLAYLIST MAPPED:", playlist) }
                return (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={handlePlaylistClick}
                    truncateTitle={truncateTitle}
                  />);
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerHome;
