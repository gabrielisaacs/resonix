import {
  requestClient,
} from '../../utils/index.js';

export const getPlaylistById = async (req, res) => {
  const config = {
    url: `/playlists/${req.params.id}`,
  };

  try {
    const result = await requestClient.client(config);
    return res.send({ data: result?.data?.data ?? [] });
  } catch(err) {
    return globalErrorHandler(err, res);
  }
};

export const getPlaylistTracks = async(req, res) => {
  const config = {
    url: `/playlists/${req.params.id}/tracks`,
  };
  try {
    const result = await requestClient.client(config);
    return res.send({ data: result?.data?.data ?? [] });
  } catch (err) {
    return globalErrorHandler(err, res);
  }
};

export const getTrendingPlaylists = async (req, res) => {
  const config = {
    url: '/playlists/trending',
    params: {
      time: req.query.time || 'week',
      limit: req.query.limit || 10
    }
  };

  try {
    const result = await requestClient.client(config);
    // Ensure we're sending a consistent response structure
    return res.send({ 
      results: result?.data?.results || [],
      headers: result?.data?.headers || {}
    });
  } catch (err) {
    return res.status(500).send({ 
      error: err.message,
      results: []
    });
  }
};

export const searchPlaylists = async(req, res) => {
  const config = {
    url: '/playlists/search',
    params: {
      query: req.query.query,
      ...req.query
    }
  };

  try {
    const result = await requestClient.client(config);
    return res.send({ data: result?.data?.data ?? [] });
  } catch (err) {
    return globalErrorHandler(err, res);
  }
};
