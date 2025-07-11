const User = require('../models/UserModel');

exports.registerUser = async (req,res) => {
    const { username } = req.body;

    try {
        let user = await User.create({username});
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.loginUser = async (req,res) => {
    const { username } = req.body;

    try {
        let user = await User.findOne({username});
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

