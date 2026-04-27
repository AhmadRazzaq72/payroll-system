const { getDB } = require('../../config/db');
const { ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const transporter = require("../mail/mailtransporter");
const bcrypt = require("bcrypt");

const getProfile = async (req, res) => {
  const db = getDB();

  if (!req.user || !req.user.userId)
    return res.status(400).json({ message: 'Invalid user' });

  const user = await db.collection('users').findOne(
    { _id: new ObjectId(req.user.user_id) },
    { projection: { password: 0 } }
  );

  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ user });
};

const updateProfile = async (req, res) => {
  const db = getDB();
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'Invalid user' });

  const {
    username,
    email,
    mobile,
    address,
    bankAccount,
    gender,
    IFSC,
    emergencyContact,
    emergencyContactname,
    leaveAllowance,
    joigningDate,
    designation,
    role,
    salary,
    employmentType,
    attendanceType,
  } = req.body;
  // Dynamically construct update fields
  const updateFields = {};

  if (username !== undefined) updateFields.username = username;
  if (email !== undefined) updateFields.email = email;
  if (mobile !== undefined) updateFields.mobile = mobile;
  if (address !== undefined) updateFields.address = address;
  if (bankAccount !== undefined) updateFields.bankAccount = bankAccount;
  if (gender !== undefined) updateFields.gender = gender;
  if (IFSC !== undefined) updateFields.IFSC = IFSC;
  if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;
  if (emergencyContactname !== undefined) updateFields.emergencyContactname = emergencyContactname;
  if (leaveAllowance !== undefined) updateFields.leaveAllowance = Number(leaveAllowance);
  if (joigningDate !== undefined) updateFields.joigningDate = joigningDate;
  if (designation !== undefined) updateFields.designation = designation;
  if (role !== undefined) updateFields.role = role;
  if (salary !== undefined) updateFields.salary = salary;
  if (employmentType !== undefined) updateFields.employmentType = employmentType;
  if (attendanceType !== undefined) updateFields.attendanceType = attendanceType;

  try {
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const result = await db.collection('users').updateOne(
      { user_id: userId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addUser = async (req, res) => {
  try {
    const db = getDB();
    const {
      name,
      gender,
      id,
      joigningDate,
      designation,
      address,
      bankAccount,
      mobile,
      email,
      role,
      salary,
      employmentType,
      attendanceType,
      emergencyContact,
      emergencyContactname,
      IFSC,
      leaveAllowance,
    } = req.body;

    // ✅ Required Fields Check
    if (!name || !id || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check for duplicate email or ID
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { user_id: id }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash default password "123456"
    const defaultPassword = await bcrypt.hash("123456", 10);

    // ✅ Insert user with default password
    const result = await db.collection("users").insertOne({
      username: name,
      user_id: id,
      gender,
      joigningDate,
      designation,
      address,
      bankAccount,
      mobile,
      email,
      role,
      salary,
      employmentType,
      attendanceType,
      emergencyContact,
      emergencyContactname,
      IFSC,
      leaveAllowance: Number(leaveAllowance) || 30,
      password: defaultPassword,
    });

    // ✅ Final Response
    res.status(201).json({
      message: "User created successfully with default password.",
      userId: result.insertedId,
    });
  } catch (error) {
  console.error("❌ Error adding user:", error); // <- This will log the exact problem
  res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const alluser = async (req,res)=>{
  const db = getDB();
  try{
    const users = await db.collection('users').find().project({ password: 0 }).toArray();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json({message:"User fetched sucessfully", users});
    

  }catch(error){
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const userByitsId = async (req,res)=>{
  const db=getDB();

  const {userid}=req.params;
  console.log("id recieved is",req.params);
  try{
    const user=await db.collection('users').findOne(
      {user_id:userid},
      {projection: { password: 0 } }
    )
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User fetched successfully', user });
  }
  catch(error){
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


const deleteUser = async (req, res) => {
  const db = getDB();
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const result = await db.collection("users").deleteOne({ user_id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Also delete associated salary info if exists
    await db.collection("SalaryInfo").deleteOne({ employee_id: userId });
    // Also delete associated payrolls if exists
    await db.collection("Payrolls").deleteMany({ employee_id: userId });

    res.status(200).json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { getProfile, addUser, alluser, userByitsId, updateProfile, deleteUser };