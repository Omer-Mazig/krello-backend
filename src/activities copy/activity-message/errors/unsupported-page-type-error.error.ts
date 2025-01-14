export class UnsupportedPageTypeError extends Error {
  constructor(page: string, className: string) {
    super(`[${className}] Unsupported page type: ${page}`);
    this.name = 'UnsupportedPageTypeError';
  }
}
