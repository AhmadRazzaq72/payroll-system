const { getDB } = require('../../config/db');
const { ObjectId } = require('mongodb');

const applyLeave = async (req, res) => {
  try {
    const db = getDB();
    const { user_id, username, type, startDate, endDate, reason } = req.body;

    if (!user_id || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newLeave = {
      user_id,
      username,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending', // Pending, Approved, Rejected
      appliedAt: new Date(),
    };

    const result = await db.collection('leaves').insertOne(newLeave);
    res.status(201).json({ message: 'Leave application submitted successfully', leaveId: result.insertedId });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getEmployeeLeaves = async (req, res) => {
  try {
    const db = getDB();
    const { user_id } = req.params;
    const leaves = await db.collection('leaves').find({ user_id }).sort({ appliedAt: -1 }).toArray();
    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching employee leaves:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const db = getDB();
    const leaves = await db.collection('leaves').find().sort({ appliedAt: -1 }).toArray();
    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const db = getDB();
    const { leaveId } = req.params;
    const { status } = req.body; // Approved or Rejected

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await db.collection('leaves').updateOne(
      { _id: new ObjectId(leaveId) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: `Leave ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  applyLeave,
  getEmployeeLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
