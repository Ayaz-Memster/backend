export class InvalidArgumentError extends Error {
  name = 'InvalidArgumentError';
  constructor(message: string) {
    super();
    this.message = message;
  }
}
