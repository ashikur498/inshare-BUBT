const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
    async register(req, res) {
        try {
            const { email, password, name } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const user = new User({
                email,
                password,
                name
            });

            await user.save();

            // Generate token
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

            res.status(201).json({ user, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid login credentials');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid login credentials');
            }

            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

            res.json({ user, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();