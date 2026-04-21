const express = require("express");
const protect = require("../middleware/authMiddleware");
const { sendMessage, getConversation } = require("../controllers/chatController");

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/:userId", protect, getConversation);

module.exports = router;
