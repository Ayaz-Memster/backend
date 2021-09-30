export class WrongPasswordError extends Error {
  name = 'WrongPasswordError';
  constructor() {
    super();
    this.message = 'Wrong password';
  }
}
