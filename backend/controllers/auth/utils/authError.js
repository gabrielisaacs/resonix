class AuthError extends Error {
  #name = 'AuthError';
  constructor(message, options = {}) {
    super(message, options);
  }

  get name(){
    return this.#name;
  }

  [Symbol.toStringTag] = this.#name;
  toString () {
    const details = {
      message: this.message || 'An error occured',
      code: this.code || 'UNKNOWN',
      errno: this.errno,
      stack: this.stack,
    };
    return `${this[Symbol.toStringTag]} ${details}`;
  }
  toJSON() {
    return {
      'name': this.#name,
      'message': this.message,
      'code': this.code,
      'errno': this.errno,
      'stack': this.stack
    }
  }
}

export default AuthError;
