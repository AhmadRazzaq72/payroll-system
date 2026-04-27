const multer = require("multer");
const storage = multer.memoryStorage(); // No disk storage
const upload = multer({ storage });
module.exports = upload;
