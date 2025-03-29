const middleware = require('../models/middlewareModel');

const middlewareController = {
    async saveWithValidation(req, res) {
        try {
            const respose = await middleware.saveWithValidation(req.body);
            res.status(200).json(respose);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

module.exports = middlewareController;