export class SystemFileRenameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SystemFileRenameError';
    Object.setPrototypeOf(this, SystemFileRenameError.prototype);
  }
}
