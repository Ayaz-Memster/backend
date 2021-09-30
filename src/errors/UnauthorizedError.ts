export class UnauthorizedError extends Error {
  name = 'UnauthorizedError';
  constructor(message: string) {
    super();
    this.message = message;
  }
}
