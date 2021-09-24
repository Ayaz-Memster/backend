export class AlreadyExistsError extends Error {
  name = 'AlreadyExistsError';
  constructor(message: string) {
    super();
    this.message = message;
  }
}
