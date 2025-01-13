export class UnsupportedActivityTypeError extends Error {
  constructor(type: string, className: string) {
    super(`[${className}] Unsupported activity type: ${type}`);
    this.name = 'UnsupportedActivityTypeError';
  }
}
