const express = require('express');
const router = express.Router();
const { addHoliday, getHolidays } = require('./holidayController');

router.post('/holidays/add', addHoliday);
router.get('/holidays', getHolidays);

module.exports = router;
