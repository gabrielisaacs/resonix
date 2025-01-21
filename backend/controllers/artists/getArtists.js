import {
  matchedData,
  validationResult,
} from 'express-validator';
import {
  errorHandlers as handlers,
  requestClient,
  RequestClientError,
} from '../../utils/index.js';
import {
  REQPARAMS as defaultParams,
  TRACKSPARAMS as defaultTrackParams,
} from '../../defaults/index.js';


async function getArtists(req, res) {
  const validation = validationResult(req);
  let lang = null;
  if (!validation.isEmpty()) {
    return handlers.validationError(validation.array(), res);
  }
  delete defaultParams['imagesize'];
  const config = {
    url: '/artists',
    params: {
      ...defaultParams,
    },
  };

  const queryParams = matchedData(req, { locations: ['query'] });
  requestClient.setQueryParams(queryParams, config);
  console.log(config, queryParams);
  try {
     const response = await requestClient.make(config);
    requestClient.setDataHeaders(response.data, {
      options: { 'x-took': response.timeTaken },
    });
    requestClient.log({ req });
    if (lang) {
      response.data.results = response.data.filter((track) => {
        return track?.musicinfo?.lang === lang;
      });
    }
    return res.send(response.data);
  } catch (error) {
    const resData = {};
    requestClient.setDataHeaders(resData, {
      error, options: {'x-took': error.timeTaken },
    });
    if (error.errno > 0) {
      requestClient.log({ message: error.message, type: 'error' });
      return res.status(error.errno).send(resData);
    }
    requestClient.setResStatus(error.code, res);
    requestClient.log({ req });
    return res.send(resData);
  }
}

export default getArtists;
