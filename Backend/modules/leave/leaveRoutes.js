const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getEmployeeLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('./leaveController');

router.post('/apply', applyLeave);
router.get('/employee/:user_id', getEmployeeLeaves);
router.get('/all', getAllLeaves);
router.patch('/status/:leaveId', updateLeaveStatus);

module.exports = router;
