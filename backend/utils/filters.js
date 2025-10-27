import { requestClient } from './index.js';

const hasTracks = async (playlist, index) => {
  return new Promise((resolve, reject) =>{
    const time = Date.now();
    setTimeout(async () => {
      try {
        const config = {
          url: '/playlists/tracks',
          params: {
            id: playlist.id,
          }
        }
        const response = await requestClient.make(config);
        let length;
        if (response?.data?.results?.length) {
          const tracksCount = response.data.results[0].tracks.length;
          if (tracksCount >= 10) {
            length = tracksCount;
          } else {
            length = 0;
          }
        } else {
          length = 0;
        }
        if (length) {
          //console.log(`resolve[${playlist.id}](${length}) after`,
          //          Date.now() - time);
          resolve(index);
        } else {
          // console.log(`reject[${playlist.id}](${length}) after`,
          // Date.now() - time);
          reject(index);
        }
      } catch (error) {
        requestClient.log({
          message: `[HASTRACKS]: ${error.message}`,
          type: 'error',
        })
        reject(index);
      }
    }, 1000);
  })
}

const playlists = {
  // filter out playlists without tracks
  byTracks: async (playlists) => {
    const filtered = [];
    let index;
    for (let i = 0; i < playlists.length; i++) {
      try {
        index = await hasTracks(playlists[i], i);
        filtered.push(playlists[index]);
      } catch (rIndex) {
        requestClient.log({
          message: `[TFILTER] playlist:${playlists[rIndex].id} has no tracks`,
          type: 'error',
        });
      }
    }
    const count = filtered.length;
    requestClient.log({
      message: `[TFILTER] Valid Playlists: ${count}`,
      type: count ? 'success' : 'error',
    });
    return filtered;
  }
}
const filters = {
  playlists,
};

export default filters;
