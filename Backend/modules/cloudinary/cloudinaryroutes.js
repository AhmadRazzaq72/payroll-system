const express = require("express");
const { uploadProfilePic } = require("./cloudinarycontrollers");
const router = express.Router();
const upload = require("../../middlewares/upload");
router.post("/upload-image", upload.single("image"), uploadProfilePic);
module.exports = router;

