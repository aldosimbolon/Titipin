// Membungkus controller async supaya error-nya otomatis diteruskan ke
// Global Error Handler di server.js, tanpa perlu try/catch berulang di tiap controller.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
