const { getDB } = require("../../config/db");
const usersalarybyitsid = async(req,res) =>{
  const db=getDB();

  const {id}=req.params;
  console.log("id recieved is",id);
  try{
    const user=await db.collection('SalaryInfo').findOne(
      {employee_id:id}
    )
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  }
  catch(error){
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const GenerateSlip = async (req, res) => {
  const db = getDB();
  const { user_id, month, action } = req.body;

  const normalizedUserId = typeof user_id === "object" && user_id !== null
    ? user_id.userid
    : user_id;

  if (!normalizedUserId || !month) {
    return res.status(400).json({ error: "Missing user_id or month" });
  }

  const salaryInfo = await db.collection('SalaryInfo').findOne({
    employee_id: normalizedUserId
  });

  const userProfile = salaryInfo
    ? null
    : await db.collection('users').findOne({ user_id: normalizedUserId });

try {
  const employeeName = salaryInfo?.employee_name || userProfile?.username;
  if (!employeeName) {
    return res.status(400).json({ error: "Invalid user data" });
  }

  const salaryslip = await db.collection('Payrolls').findOne({
    employee_id: normalizedUserId,
    month
  });

  // If already paid, always return the saved slip
  if (salaryslip && salaryslip.status === "Paid") {
    console.log('Paid salary slip fetched:', salaryslip);
    return res.json(salaryslip);
  }

  // If just fetching/previewing and we have a slip, return it (unless it's a 'pay' action)
  if (salaryslip && action !== 'pay' && 
      salaryslip.salary_breakdown?.net_salary !== null && 
      !isNaN(salaryslip.salary_breakdown?.net_salary)) {
    console.log('Saved salary slip fetched:', salaryslip);
    return res.json(salaryslip);
  }

  const attendance = await db.collection('Attendance').find({
    user_id: normalizedUserId,
    date: { $regex: `^${month}` }
  }).toArray();

  const holidays = await db.collection('Holidays').find({
    date: { $regex: `^${month}` }
  }).toArray();

  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const holidayCount = holidays.length;
  
  // Ensure all values are treated as numbers and default to 0 if missing
  const baseSalaryRaw = salaryInfo?.base_salary ?? userProfile?.salary ?? 0;
  const basicSalary = Number(String(baseSalaryRaw || 0).replace(/,/g, ''));
  const workingDays = 26;
  const paidLeavesAllowed = Number(
    salaryInfo?.paid_leaves_allowed ?? userProfile?.leaveAllowance ?? 0
  ) || 0;
  
  // Total paid days = present days + company holidays
  const totalPaidDays = presentDays + holidayCount;
  const absentDays = Math.max(0, workingDays - totalPaidDays);

  const taxPercent = Number(salaryInfo?.tax_percent || 0) || 0;
  const pfPercent = Number(salaryInfo?.pf_percent || 0) || 0;

  const tax = basicSalary * (taxPercent / 100);
  const pf = basicSalary * (pfPercent / 100);
  
  const unpaidLeaves = Math.max(0, absentDays - paidLeavesAllowed);
  const leaveDeduction = unpaidLeaves * (basicSalary / workingDays);
  
  const totalDeduction = tax + pf + leaveDeduction;
  const netSalary = basicSalary - totalDeduction;

  const payrollDoc = {
    employee_id: normalizedUserId,
    employee_name: employeeName,
    month,
    basic_salary: basicSalary,

    attendance_summary: {
      total_working_days: workingDays,
      present_days: presentDays,
      absent_days: absentDays,
      paid_leave_allowance: paidLeavesAllowed,
      unpaid_leave_days: unpaidLeaves
    },

    deductions: {
      tax_amount: tax,
      pf_amount: pf,
      leave_deduction: leaveDeduction,
      total_deduction: totalDeduction
    },

    salary_breakdown: {
      gross_salary: basicSalary,
      net_salary: netSalary
    },

    status: action === 'pay' ? "Paid" : "Processed",
    generated_on: new Date().toISOString().slice(0, 10)
  };

  if (action === 'pay') {
    await db.collection('Payrolls').updateOne(
      { employee_id: normalizedUserId, month },
      { $set: payrollDoc },
      { upsert: true }
    );
    console.log('Salary slip Paid and saved:', payrollDoc);
  }
  console.log('Salary slip generated:', payrollDoc);
  return res.json(payrollDoc);

} catch (error) {
  console.error("Salary generation error:", error);
  return res.status(500).json({ error: error.message });
}

};

const Addsalaryinfo = async (req, res) => {
  const db = getDB();
  const {
    employee_id,
    employee_name,
    base_salary,
    hra,
    bonus,
    tax_percent,
    pf_percent,
    joining_date,
    paid_leaves_allowed,
    updated_by
  } = req.body;

  // 1. Basic validation
  if (!employee_id || !employee_name || !base_salary || !joining_date || !updated_by) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // 2. Check if salary info already exists
    const existing = await db.collection('SalaryInfo').findOne({ employee_id });
    if (existing) {
      return res.status(409).json({ message: "Salary info already exists for this employee." });
    }

    // 3. Current IST timestamp
    const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);

    // 4. Insert new record
    const result = await db.collection('SalaryInfo').insertOne({
      employee_id,
      employee_name,
      base_salary,
      hra,
      bonus,
      tax_percent,
      pf_percent,
      joining_date,
      paid_leaves_allowed: Number(paid_leaves_allowed) || 0,
      last_update: nowIST,
      updated_by
    });

    return res.status(201).json({
      message: "Salary info added successfully.",
      insertedId: result.insertedId
    });

  } catch (error) {
    console.error("Error adding salary info:", error);
    return res.status(500).json({ message: "Server error while adding salary info." });
  }
};


const Updatesalaryinfo = async (req, res) => {
  const db = getDB();

  const {
    employee_id,
    employee_name,
    base_salary,
    hra,
    bonus,
    tax_percent,
    pf_percent,
    joining_date,
    paid_leaves_allowed,
    updated_by
  } = req.body;

  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required." });
  }

  try {
    // Convert current time to IST
    const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);

    const updateFields = {
      employee_name,
      base_salary,
      hra,
      bonus,
      tax_percent,
      pf_percent,
      joining_date,
      paid_leaves_allowed: Number(paid_leaves_allowed) || 0,
      last_update: nowIST,
      updated_by
    };
    
    const olddata= await db.collection('SalaryInfo').findOne({ employee_id });
    const user= await db.collection('users').findOne({ user_id: employee_id });
    console.log("Old data:", olddata);

    const compareFields = Object.keys(updateFields).reduce((acc, key) => {
      if (updateFields[key] !== olddata[key]) {
        acc[key] = { old: olddata[key], new: updateFields[key] };
      }
      return acc;
    }, {});
    if (Object.keys(compareFields).length === 0) {
      return res.status(400).json({ message: "No fields to update or no changes made." });
    }

    console.log("Updated fields:", compareFields);

    const result = await db.collection('SalaryInfo').updateOne(
      { employee_id },
      { $set: updateFields }
    );





    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json({
      message: "Salary info updated successfully",
      updatedFields: updateFields,
      result
    });

  } catch (error) {
    console.error("Error updating salary info:", error);
    res.status(500).json({ message: "Server error while updating salary info." });
  }
};


module.exports= {GenerateSlip,Addsalaryinfo,Updatesalaryinfo,usersalarybyitsid};