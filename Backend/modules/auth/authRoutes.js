const express = require('express');
const { login, changePassword } = require('./authController');
const authenticateToken = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);

router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
