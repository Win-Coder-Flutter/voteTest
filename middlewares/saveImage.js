const saveImage = (req, res, next) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    next(); // Move to the controller, where image saving will be handled after validation
};

module.exports = saveImage;
