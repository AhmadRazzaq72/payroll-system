const { ObjectId } = require("mongodb");
const { getDB } = require("../../config/db");

// 📌 Create new HR request
exports.createRequest = async (req, res) => {
  try {
    const db = getDB();
    const { employeeId, employeeName, subject, category, priority, message, attachment } = req.body;

    const newRequest = {
      employeeId,
      employeeName,
      subject,
      category: category || "General Inquiry",
      priority: priority || "Normal",
      message,
      attachment,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("HRRequests").insertOne(newRequest);
    res.status(201).json({
      success: true,
      message: "HR request submitted successfully",
      request: { _id: result.insertedId, ...newRequest },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating request", error: error.message });
  }
};

// 📌 Get all HR requests
exports.getRequests = async (req, res) => {
  try {
    const db = getDB();
    const requests = await db.collection("HRRequests").find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching requests", error: error.message });
  }
};

// 📌 Get single HR request by ID
exports.getRequestById = async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid request ID" });
    }

    const request = await db.collection("HRRequests").findOne({ _id: new ObjectId(req.params.id) });
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching request", error: error.message });
  }
};

// 📌 HR updates request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Pending", "In Progress", "Resolved"];

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid request ID" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: Pending, In Progress, Resolved",
      });
    }

    const role = (req.user?.role || "").toLowerCase();
    if (role !== "hr") {
      return res.status(403).json({ success: false, message: "Only HR can update request status" });
    }

    const result = await db.collection("HRRequests").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating request status", error: error.message });
  }
};
