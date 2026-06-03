export class SystemFileDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SystemFileDeleteError';
    Object.setPrototypeOf(this, SystemFileDeleteError.prototype);
  }
}
