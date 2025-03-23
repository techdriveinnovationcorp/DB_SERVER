const designerDbModel = require('../models/designerDbModel');

const designerDbController = {

  async allDocs(req, res) {

    if (req?.params?.id) {
      try {
        const records = await designerDbModel.allDocById(req.params.id);
        if (!records) return res.status(404).json({ message: "designerDb not found" });
        res.status(200).json(records);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    } else {
      try {
        const records = await designerDbModel.allDocs();
        res.status(200).json(records);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
  },

  async save(req, res) {

    if (req?.body && req?.params?.id) {

      try {
        const updatedRecords = await designerDbModel.update(req.params.id, req.body);
        res.status(200).json(updatedRecords);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    } else {
      try {
        const newdRecord = await designerDbModel.save(req.body);
        res.status(201).json(newdRecord);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
  },

  async delete(req, res) {
    try {
      await designerDbModel.delete(req.params.id);
      res.status(200).json({ message: "designerDb deleted successfully", _id: req.params.id });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async searchDoc(req, res) {
    try {
      const records = await designerDbModel.searchDoc(req.body);
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

};

module.exports = designerDbController;
