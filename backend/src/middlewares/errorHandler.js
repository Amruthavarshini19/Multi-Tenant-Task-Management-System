export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

// Async route wrapper to catch promise rejections and pass to errorHandler
export const asyncWrap = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
