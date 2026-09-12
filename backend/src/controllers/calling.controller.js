import { callingModel } from "../models/calling.model.js";

// Initiate a call
export const initiateCall = async (req, res) => {
  try {
    const { recipientId, callType } = req.body;
    
    if (!recipientId || !callType) {
      return res.status(400).json({ error: "Recipient ID and Call Type are required" });
    }

    const call = await callingModel.create({ 
      callerId: req.user._id, 
      recipientId, 
      callType,
      status: "calling"
    });
    
    res.status(201).json(call);
  } catch (err) {
    console.error("Error in initiateCall:", err);
    res.status(500).json({ error: "Failed to initiate call" });
  }
};

// Handle call response (accepted, rejected, ended)
export const handleCallResponse = async (req, res) => {
  try {
    const { callId, status, callDuration } = req.body;

    if (!callId || !status) {
      return res.status(400).json({ error: "Call ID and status are required" });
    }

    const updateData = { status };
    if (callDuration !== undefined) {
      updateData.callDuration = callDuration;
    }

    const updatedCall = await callingModel.findByIdAndUpdate(
      callId, 
      updateData, 
      { new: true }
    );

    if (!updatedCall) {
      return res.status(404).json({ error: "Call not found" });
    }

    res.status(200).json(updatedCall);
  } catch (err) {
    console.error("Error in handleCallResponse:", err);
    res.status(500).json({ error: "Failed to update call response" });
  }
};

// Get call history for the logged in user
export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const calls = await callingModel.find({
      $or: [{ callerId: userId }, { recipientId: userId }]
    })
      .populate("callerId", "username profilePicture email")
      .populate("recipientId", "username profilePicture email")
      .sort({ createdAt: -1 });

    res.status(200).json(calls);
  } catch (err) {
    console.error("Error in getCallHistory:", err);
    res.status(500).json({ error: "Failed to get call history" });
  }
};
