const { v4: uuidv4 } = require('uuid');

// Internal method for generating UUIDs
const makeIds = (count) => {
    return Array.from({ length: count }, () => uuidv4().replaceAll("-",""));
};

// Exported method that uses makeIds internally
exports.generateUUIDs = (req, res) => {
    const count = parseInt(req.query.count) || 1;
    if (count <= 0) {
        return res.status(400).json({ error: 'Count must be a positive integer.' });
    }
    
    const uuids = makeIds(count); // Internal usage
    res.json(uuids);
};

// Optionally export makeIds if needed elsewhere
exports._makeIds = makeIds;
