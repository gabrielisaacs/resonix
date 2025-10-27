import axios from "axios";
import { API_BASE_URL } from "../constants/config";
console.log("API_BASE_URL: ", API_BASE_URL);
const CURRENT_DATE = "2025-01-17 20:36:43";
const CURRENT_USER = "gabrielisaacs";

// Define dummy data that matches Jamendo API structure
const DUMMY_DATA = {
  tracks: Array(30)
    .fill(null)
    .map((_, index) => ({
      id: `track-${index + 1}`,
      name: `Track ${index + 1}`,
      artist_name: `Artist ${Math.floor(index / 3) + 1}`,
      image: `https://picsum.photos/400/400?random=${index}`,
      audio: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${
        (index % 15) + 1
      }.mp3`,
      duration: 180 + index * 30,
      sharecount: Math.floor(Math.random() * 500) + 50,
      is_streamable: "true",
      listened: Math.floor(Math.random() * 100000),
    })),

  artists: Array(15)
    .fill(null)
    .map((_, index) => ({
      id: `artist-${index + 1}`,
      name: `Artist ${index + 1}`,
      image: `https://picsum.photos/400/400?random=${index + 100}`,
      joindate: CURRENT_DATE,
      website: "https://example.com",
    })),

  albums: Array(15)
    .fill(null)
    .map((_, index) => ({
      id: `album-${index + 1}`,
      name: `Album ${index + 1}`,
      artist_name: `Artist ${Math.floor(Math.random() * 15) + 1}`,
      image: `https://picsum.photos/400/400?random=${index + 200}`,
      tracks_count: Math.floor(Math.random() * 20) + 5,
      releasedate: CURRENT_DATE,
    })),

  playlists: Array(15)
    .fill(null)
    .map((_, index) => ({
      id: `playlist-${index + 1}`,
      name: `Playlist ${index + 1}`,
      creationdate: CURRENT_DATE,
      user_id: `user-${index + 1}`,
      user_name: `User ${index + 1}`,
      image: `https://picsum.photos/400/400?random=${index + 200}`,
      shorturl: `https://jamen.do/l/p${index + 1}`,
      shareurl: `https://www.jamendo.com/list/p${index + 1}`,
    })),
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 2000;
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const imageapi = axios.create({
  baseURL: "https://api.unsplash.com/photos/",
});

const getRandomImage = async (orientation) => {
  try {
    const response = await imageapi.get("/random", {
      params: {
        query: "dark music",
        orientation,
        client_id: "IS8nNFC4MfhBLi-F8KZdlaGMfELuMhY7-3RK3iIPtgk",
      },
    });
    return response?.data?.urls?.full;
  } catch (error) {
    console.log("RANDOM IMAGE ERROR\n\t", error);
  }
};

// Transform functions to match frontend format
const transformTrackData = (track) => ({
  id: track.id,
  title: track.name,
  artist: track.artist_name,
  artwork: track.image,
  thumbnail: track.image,
  url: track.audio,
  duration: track.duration,
  likes: `${Math.floor((track.listened || 0) / 1000)}k Plays`,
  stream_url: track.audio,
});

const transformArtistData = (artist) => ({
  id: artist.id,
  name: artist.name,
  image: artist.image,
  description: artist.description || "",
  joindate: artist.joindate || "2025-01-22 23:01:16",
  website: artist.website || "",
  shorturl: artist.shorturl || "",
  shareurl: artist.shareurl || "",
});

const transformAlbumData = (album) => ({
  id: album.id,
  title: album.name,
  artist: album.artist_name,
  thumbnail: album.image,
  releaseDate: album.releasedate,
  trackCount: album.tracks_count || 0,
});

const transformPlaylistData = (playlist) => ({
  id: playlist.id,
  title: playlist.name,
  artist: playlist.user_name,
  creationDate: playlist.creationdate,
  userId: playlist.user_id,
  shortUrl: playlist.shorturl,
  shareUrl: playlist.shareurl,
  thumbnailId: playlist.id,
});

const getTrendingTracks = async (params = {}) => {
  try {
    console.log("Fetching trending tracks...");
    const response = await api.get("/tracks", { params });
    console.log("Trending tracks response:", response);

    if (response.data && response.data.results) {
      return { data: response.data.results.map(transformTrackData) };
    }
    console.warn("Using fallback data for trending tracks");
    return { data: DUMMY_DATA.tracks.map(transformTrackData) };
  } catch (error) {
    console.warn("Error fetching tracks, using fallback data:", error);
    return { data: DUMMY_DATA.tracks.map(transformTrackData) };
  }
};

const getAlbums = async (params = {}) => {
  try {
    console.log("Fetching albums...");
    const response = await api.get("/albums", {
      params: {
        ...params,
        format: "json",
        imagesize: 500,
      },
    });

    if (response.data?.results) {
      return { data: response.data.results.map(transformAlbumData) };
    }
    throw new Error("No data received from server");
  } catch (error) {
    console.warn("Error fetching albums, using fallback data:", error);
    return { data: DUMMY_DATA.albums.map(transformAlbumData) };
  }
};

const getTopArtists = async (params = {}) => {
  try {
    console.log("Fetching top artists...");
    const response = await api.get("/artists", {
      params: {
        ...params,
        limit: params.limit || 20,
        order: "popularity_week_desc",
      },
    });

    if (response.data?.results) {
      return {
        data: response.data.results.map((artist) =>
          transformArtistData(artist)
        ),
      };
    }
    throw new Error("No data received from server");
  } catch (error) {
    console.warn("Error fetching artists, using fallback data:", error);
    return { data: DUMMY_DATA.artists.map(transformArtistData) };
  }
};

const getAlbumDetails = async (albumId) => {
  try {
    console.log("Fetching album details for:", albumId);

    const response = await api.get("/albums/tracks", {
      params: {
        id: [albumId],
        image_size: 400,
        audio_format: "mp32",
      },
    });

    console.log("Album and tracks response:", response);

    if (response.data?.results?.[0]) {
      const albumData = response.data.results[0];
      const tracks = albumData.tracks || [];

      // Transform the album data
      const transformedAlbum = {
        id: albumData.id,
        title: albumData.name,
        artist: albumData.artist_name,
        artist_id: albumData.artist_id, // Add artist_id
        thumbnail: albumData.image,
        artist_image: `https://usercontent.jamendo.com?type=artist&id=${albumData.artist_id}&width=300`, // Add artist_image
        releaseDate: albumData.releasedate,
        // Transform tracks
        tracks: tracks.map((track) => ({
          id: track.id,
          title: track.name,
          artist: albumData.artist_name,
          thumbnail: track.image || track.album_image || albumData.image,
          url: track.audio,
          duration: parseInt(track.duration),
          position: parseInt(track.position),
          likes: `${Math.floor(Math.random() * 100)}k`,
          download_url: track.audiodownload,
          download_allowed: track.audiodownload_allowed,
        })),
      };

      // Sort tracks by position
      transformedAlbum.tracks.sort((a, b) => a.position - b.position);

      return {
        data: {
          album: transformedAlbum,
          tracks: transformedAlbum.tracks,
        },
      };
    }

    throw new Error("Album not found");
  } catch (error) {
    console.error("Error fetching album details:", error);
    throw error;
  }
};

const getPlaylists = async (params = {}) => {
  try {
    console.log("Fetching playlists...");
    const response = await api.get("/playlists", {
      params: {
        ...params,
        format: "json",
      },
    });

    if (response.data?.results) {
      console.log("PLAYLISTS FETCHED:\n", response.data.results);
      const transformedPlaylists = response.data.results.map(
        transformPlaylistData
      );
      return { data: transformedPlaylists };
    }
    throw new Error("No data received from server");
  } catch (error) {
    console.warn("Error fetching playlists, using fallback data:", error);
    return { data: DUMMY_DATA.playlists.map(transformPlaylistData) };
  }
};

const getRecentTracks = async (params = {}) => {
  try {
    console.log("Fetching recent tracks...");
    const response = await api.get("/tracks", {
      params: {
        orderby: ["releasedate_desc"],
        limit: params.limit || 30,
        ...params,
      },
    });
    console.log("Recent tracks response:", response);

    if (response.data && response.data.results) {
      return { data: response.data.results.map(transformTrackData) };
    }
    console.warn("Using fallback data for recent tracks");
    return { data: DUMMY_DATA.tracks.map(transformTrackData) };
  } catch (error) {
    console.warn("Error fetching recent tracks, using fallback data:", error);
    return { data: DUMMY_DATA.tracks.map(transformTrackData) };
  }
};

const getPlaylistDetails = async (playlistId) => {
  try {
    console.log("Fetching playlist details for:", playlistId);
    // First, get the playlist details
    const playlistResponse = await api.get(`/playlists`, {
      params: {
        id: [parseInt(playlistId)],
      },
    });

    console.log("Playlist response:", playlistResponse);

    if (!playlistResponse.data?.results?.[0]) {
      throw new Error("Playlist not found");
    }

    // Transform the playlist data
    const playlistData = transformPlaylistData(
      playlistResponse.data.results[0]
    );
    console.log("TRANSFORMED PLAYLIST DATA\n", playlistData);
    // Then, get the tracks for this playlist
    const tracksResponse = await api.get(`/playlists/tracks`, {
      params: {
        id: [playlistId],
        format: "jsonpretty",
      },
    });

    console.log("Playlist tracks response:", tracksResponse);

    let tracks = [];
    if (tracksResponse.data?.results?.length) {
      tracks = tracksResponse.data.results[0].tracks.map((track) => ({
        id: track.id,
        name: track.name,
        artist_name: track.artist_name,
        image:
          track.image ||
          `https://usercontent.jamendo.com?type=album&id=${track.album_id}&width=300`,
        audio: track.audio,
        duration: parseInt(track.duration) || 0,
        listened: track.listened || 0,
      }));
    }

    return {
      data: {
        ...playlistData,
        tracks,
      },
    };
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    throw error;
  }
};

const getArtistDetails = async (artistId) => {
  try {
    console.log("Fetching artist details for:", artistId);
    const response = await api.get("/artists/info", {
      params: {
        id: [artistId],
        format: "jsonpretty",
      },
    });

    if (response.data?.results?.[0]) {
      const artistData = response.data.results[0];
      return {
        data: {
          id: artistData.id,
          name: artistData.name,
          website: artistData.website,
          joindate: artistData.joindate,
          image:
            artistData.image ||
            `https://usercontent.jamendo.com?type=artist&id=${artistData.id}&width=500`,
          shorturl: artistData.shorturl,
          shareurl: artistData.shareurl,
          musicinfo: {
            tags: artistData.musicinfo?.tags || [],
            description: artistData.musicinfo?.description || {},
          },
        },
      };
    }
    throw new Error("Artist not found");
  } catch (error) {
    console.error("Error fetching artist details:", error);
    throw error;
  }
};

const getArtistTracks = async (artistId) => {
  try {
    console.log("Fetching artist tracks for:", artistId);
    const response = await api.get("/artists/tracks", {
      params: {
        id: [artistId],
        audioformat: "mp31",
      },
    });

    if (response.data?.results?.[0]?.tracks) {
      // Access the tracks array from the nested structure
      const tracks = response.data.results[0].tracks;
      return {
        data: tracks.map((track) => ({
          id: track.id,
          title: track.name,
          artist: response.data.results[0].name,
          thumbnail: track.image || track.album_image,
          url: track.audio,
          stream_url: track.audio,
          duration: parseInt(track.duration || 0),
          likes: `${Math.floor(Math.random() * 100)}k`,
          album_name: track.album_name,
          album_id: track.album_id,
          releasedate: track.releasedate,
        })),
      };
    }
    throw new Error("No tracks found");
  } catch (error) {
    console.error("Error fetching artist tracks:", error);
    throw error;
  }
};

const getArtistAlbums = async (artistId) => {
  try {
    console.log("Fetching artist albums for:", artistId);
    const response = await api.get("/artists/albums", {
      params: {
        id: [artistId],
      },
    });

    if (response.data?.results?.[0]?.albums) {
      // Access the albums array from the nested structure
      const albums = response.data.results[0].albums;
      const artistName = response.data.results[0].name;

      return {
        data: albums.map((album) => ({
          id: album.id,
          title: album.name,
          artist: artistName,
          thumbnail: album.image,
          releaseDate: album.releasedate,
        })),
      };
    }
    throw new Error("No albums found");
  } catch (error) {
    console.error("Error fetching artist albums:", error);
    throw error;
  }
};

const getSimilarArtists = async (artistId) => {
  try {
    console.log("Fetching similar artists for:", artistId);
    const response = await api.get("/artists", {
      params: {
        format: "jsonpretty",
        limit: 15,
        order: "popularity_total",
      },
    });

    if (response.data?.results) {
      return {
        data: response.data.results
          .filter((artist) => artist.id !== artistId)
          .map((artist) => ({
            id: artist.id,
            name: artist.name,
            image:
              artist.image ||
              `https://usercontent.jamendo.com?type=artist&id=${artist.id}&width=300`,
            followerCount: artist.sharecount || 0,
          })),
      };
    }
    throw new Error("No similar artists found");
  } catch (error) {
    console.error("Error fetching similar artists:", error);
    throw error;
  }
};

// Enhanced debug interceptors
api.interceptors.request.use(
  (config) => {
    config.params = {
      format: "json",
      ...config.params,
    };

    // Add imagesize if the endpoint is albums or playlists
    if (config.url.includes("/albums") || config.url.includes("/playlists")) {
      config.params.imagesize = config.params.imagesize || 500;
    }

    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("[API Request]", {
      method: config.method.toUpperCase(),
      url: config.url,
      params: config.params,
      timestamp: new Date().toISOString(),
    });
    return config;
  },
  (error) => {
    console.error("[API Request Error]", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.retry) {
      return Promise.reject(error);
    }

    config.retryCount += 1;

    const delayRetry = new Promise((resolve) => {
      setTimeout(resolve, config.retryDelay(config.retryCount));
    });

    await delayRetry;
    return api(config);
  }
);

export default {
  getRandomImage,
  getPlaylists,
  getTrendingTracks,
  getTopArtists,
  getAlbumDetails,
  getPlaylistDetails,
  getRecentTracks,
  getAlbums,
  getArtistDetails,
  getArtistTracks,
  getArtistAlbums,
  getSimilarArtists,
};
