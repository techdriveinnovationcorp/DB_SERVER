const middleware = require('../models/middlewareModel');
const dbProvider = require('../services/dbProvider');
const { _makeIds: makeIds } = require('../../../controllers/uuidController');
const ListenerService = require('../../../listeners/eventsListener');
const simpleCrypto = require('../../../utils/cryptoUtils');

const middlewareController = {
  async saveWithValidation(req, res) {
    try {
      const result = await middleware.saveWithValidation(req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in saveWithValidation:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  },

  async fetchStreamWithMiddleware(req, res) {
    try {
      const fetchParams = simpleCrypto.decrypt(req.body['fetchParams']);

      if (!fetchParams?.fetchMethodName || typeof dbProvider[fetchParams.fetchMethodName] !== 'function') {
        return res.status(400).end("Invalid request: fetchMethodName is required or invalid.");
      }

      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked"
      });

      const [listenerName] = await makeIds(1);

      ListenerService.subscribeToListener(listenerName, (data) => {
       
        if (data && data['status'] === 'inprogress') {
          const dataResp = `streamStart: ${simpleCrypto.encrypt(JSON.stringify(data))}streamEnd`;
          res.write(dataResp);
        } else if (data && data['status'] === 'completed') {
          res.end();
        }
      });

      await dbProvider[fetchParams.fetchMethodName](fetchParams, listenerName);

    } catch (error) {
      console.error("Error in fetchStreamWithMiddleware:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
      }
    }
  }
};

module.exports = middlewareController;
