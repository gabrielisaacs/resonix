// defines some reusable configurations
import axios from 'axios';
import {
  COLOURS,
  JAMENDO,
  MAX_RETRIES,
  STATUS_CODES as statusCodes,
  TIMEOUT,
} from '../defaults/index.js';
import logger from './logMessage.js';

class RequestClientError extends Error {
  #name = 'RequestClientError';
  constructor(message, { errno = null, code = null, stack = null }) {
    super(message);
    this.code = code;
    this.errno = errno;
    this.stack = stack;
  }

  get name(){
    return this.#name;
  }

  [Symbol.toStringTag] = this.#name;
  toString () {
    const details = JSON.stringify({
      message: this.message || 'An error occured',
      code: this.code || 'UNKNOWN',
      errno: this.errno,
      stack: this.stack,
    });
    return `${this[Symbol.toStringTag]} ${details}`;
  }
}


class RequestClient {
  constructor() {
    this.client = axios.create({
      TIMEOUT,
      params: {
        format: 'jsonpretty',
        client_id: JAMENDO.id,
      },
    });
    this.client.defaults.baseURL = null;
  }
  // private properties
  #name = 'RequestClient';
  #host = `${JAMENDO.base}/${JAMENDO.version}`;

  // getters
  get host() { return this.#host }
  get isReady(){
    return this.client.defaults.baseURL != null;
  }

  // Public methods
  init() {
    this.client.defaults.baseURL = this.#host;
    if (this.isReady) {
      console.log(`[INIT SUCCESS]: HostUrl set to ${this.host}`);
    }
  }

  log({ message = null, type = 'normal', req = null }) {
    logger.log({ message, type, req });
  }

  async make(config) {
    let count = 0;
    let errorObj = null;
    let timeStart,
        timeEnd;
    this.log({
      message: `[OUTGOING] ${requestClient.host}${config.url}`
    });
    const makeRequest = async (config, delay) => {
      count += 1;
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const response = await this.client(config);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };

    timeStart = Date.now();
    while (count < MAX_RETRIES) {
      const delay = !count ? 0 : 1000;
      try {
        const response = await makeRequest(config, delay);
        timeEnd = Date.now();
        this.setTimeTaken(timeStart, timeEnd, response);
        return response;
      } catch (error) {
        errorObj = error;
        this.log({
          message: `Request failed...retrying...[${count}]`,
          type: 'error'
        });
      }
    }
    timeEnd = Date.now();
    const msg = statusCodes[errorObj.code]?.message
          ?? 'An error occured';
    const errToThrow = new RequestClientError(
      msg,
      {
        errno: errorObj.errno,
        code: errorObj.code ?? null,
        stack: errorObj.stack ?? null,
      }
    );
    this.setTimeTaken(timeStart, timeEnd, errToThrow);
    throw errToThrow;
  }

  setDataHeaders (obj, { error = null, options = {} }) {
    const newHdrs = {
      status: 'success',
      code: 0,
      error_message: '',
      warnings: '',
      ...(obj?.headers ?? {}),
      ...options,
    };
    if (error) {
      newHdrs.status = 'failed';
      newHdrs.code = newHdrs.code || error.code;
      newHdrs.error_message = error.message;
      if (error.timeTaken){
        delete error.timeTaken;
      }
      newHdrs.error = JSON.stringify(error.toString());
    }
    obj.headers = newHdrs;
    return true;
  }

  // set query parameters in configuration
  setQueryParams (params, config) {
    for (let [param, value] of Object.entries(params)){
      if (param === 'page_size') {
        param = 'limit';
      } else if (param === 'page') {
        const pg = parseInt(value);
        const sz = parseInt(params['page_size']);
        value = `${(pg - 1) * sz}`;
        param = 'offset';
      }
      config.params[param] = value;
    }
  }

  // set response status code
  async setResStatus (code, res) {
    if (statusCodes[code]) {
      await res.status(statusCodes[code].code);
      return true;
    }
    return false;
  }

  // set time successful request took
  setTimeTaken(start, end, obj) {
    obj['timeTaken'] = `${(end - start) / 1000}ms`;
    return true;
  }

  // Symbols
  [Symbol.toStringTag] = this.#name;

  // Object overwrites
  toString() {
    return `[${this[Symbol.toStringTag]} `+
      `host: ${this.#host}, isReady: ${this.isReady}]`;
  }
}

const requestClient = new RequestClient();
requestClient.init();

export {
  RequestClientError,
  requestClient,
};

