export class UnsupportedActivityTypeError extends Error {
  constructor(type: string, className: string) {
    super(`[${className}] Unsupported activity type: ${type}`);
    this.name = 'UnsupportedActivityTypeError';
  }
}

export class UnsupportedPageTypeError extends Error {
  constructor(page: string, className: string) {
    super(`[${className}] Unsupported page type: ${page}`);
    this.name = 'UnsupportedPageTypeError';
  }
}
