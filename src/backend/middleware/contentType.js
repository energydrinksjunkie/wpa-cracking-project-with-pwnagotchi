const verifyContentTypeMiddleware = (req, res, next) => {
    if (!req.is('multipart/form-data')) {
        return res.status(400).json({ error: 'Content type must be multipart/form-data' });
    }
    next();
};

module.exports = verifyContentTypeMiddleware;