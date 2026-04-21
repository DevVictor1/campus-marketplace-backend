const mongoose = require("mongoose");
const Message = require("../models/Message");
const { sendSuccess, sendError } = require("../utils/response");

const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;

    if (!receiver || !message) {
      return sendError(res, 400, "Receiver and message are required");
    }

    if (!mongoose.Types.ObjectId.isValid(receiver)) {
      return sendError(res, 400, "Invalid receiver id");
    }

    if (receiver === req.user._id.toString()) {
      return sendError(res, 400, "You cannot send a message to yourself");
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email role")
      .populate("receiver", "name email role");

    return sendSuccess(res, 201, "Message sent successfully", {
      chat: populatedMessage,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, "Server error while sending message");
  }
};

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, "Conversation fetched successfully", {
      messages,
    });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching conversation");
  }
};

module.exports = {
  sendMessage,
  getConversation,
};
