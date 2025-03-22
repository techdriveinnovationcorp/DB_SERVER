const User = require('../models/userModel');

const userController = {

  async allDocs(req, res) {

    if (req?.params?.id) {
      try {
        const user = await User.allDocById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    } else {
      try {
        const users = await User.allDocs();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
  },

  async save(req, res) {

    if (req?.body && req?.params?.id) {

      try {
        const updatedUser = await User.update(req.params.id, req.body);
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    } else {
      try {
        const newUser = await User.save(req.body);
        res.status(201).json(newUser);
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
  },

  async delete(req, res) {
    try {
      await User.delete(req.params.id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async searchDoc(req, res) {
    try {
      const records = await User.searchDoc(req.body);
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

};

module.exports = userController;
