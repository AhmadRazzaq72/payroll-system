const express = require("express");
const router = express.Router();
const { setPassword,sendWelcomeMail } = require("./mailController");

router.post("/set-password", setPassword);
router.post("/send-welcome-mail", sendWelcomeMail);

module.exports = router;

