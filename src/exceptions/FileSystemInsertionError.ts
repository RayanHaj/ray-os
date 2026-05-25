export class FileSystemInsertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileSystemInsertionError';
    Object.setPrototypeOf(this, FileSystemInsertionError.prototype);
  }
}
