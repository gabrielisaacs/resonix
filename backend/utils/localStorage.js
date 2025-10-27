import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  readFile,
  stat,
  writeFile,
} from 'fs';
import { RX_ROOT_DIR as rootDir } from '../defaults/index.js';
import path from 'path';

class LocalStorage {
  #root = null;

  constructor(dirPath) {
    mkdirSync(path.join(dirPath, '/'), { recursive: true });
    this.#root = dirPath;
  }

  get root() {
    return this.#root;
  }

  async isReady() {
    let status;
    const checker = () => {
      return new Promise((resolve, reject) => {
        stat(this.root, (err, stats) => {
          if (err || !stats.isDirectory()) {
            reject(new Error(error.message || 'not a directory'));
          } else {
            resolve(true);
          }
        })
      });
    }
    try {
      status = await checker();
    } catch (err) {
      console.error(err.message);
      status = false;
    }
    return status;
  }

  async getWriteStream(fileName) {
    const filePath = path.join(this.root, fileName);
    return createWriteStream(filePath);
  }

  async getReadStream(fileName) {
    const filePath = path.join(this.root, fileName);
    return createReadStream(filePath);
  }

  async read(fileName, format = null) {
    const filePath = path.join(this.root, fileName);
    readFile(filePath, format, (err, data) => {
      if (err) {
        reject(null);
      } else {
        resolve(data);
      }
    });
  }

  async save(fileName, content) {
    const filePath = path.join(this.root, fileName);
    writeFile(filePath, content, (err) => {
      if (err) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  async getFileSize(fileName) {
    const filePath = path.join(this.root, fileName);
    let size;
    const checker = () => {
      return new Promise((resolve, reject) => {
        stat(filePath, (err, stats) => {
          if (err) {
            reject(err);
          } else {
            resolve(stats.size);
          }
        });
      });
    };

    try {
      size = await checker();
    } catch (err) {
      console.error(err.message);
      size = -1;
    }
    return size;
  }
}
const store = new LocalStorage(rootDir);
const isReady = await store.isReady();
console.log(`storage is Ready: [${isReady}]. DIR: ${store.root}`);
export default store;
