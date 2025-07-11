const express = require('express');
const router = express.Router();
const { loginUser, registerUser} = require('../controllers/authCotroller');

router.post('/', loginUser);
router.post('/register', registerUser);

module.exports = router;