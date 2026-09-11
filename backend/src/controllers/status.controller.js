import storyModel from "../models/status.model.js";
import contactModel from "../models/contact.model.js";
import { uploadToImageKit } from "../services/imagekit.service.js";

// Add a new status/story
export const addStatus = async(req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Media file is required" });
    }

    // Upload to ImageKit
    const mediaUrl = await uploadToImageKit(req.file.buffer);
    if (!mediaUrl) {
      return res.status(500).json({ success: false, message: "Failed to upload media" });
    }

    // Determine media type from MIME
    const mime = req.file.mimetype || "";
    let mediaType = "image";
    if (mime.startsWith("video/")) {
      mediaType = "video";
    }

    const status = await storyModel.create({
      user: userId,
      mediaUrl,
      mediaType
    });

    const populatedStatus = await storyModel.findById(status._id)
      .populate("user", "_id username profilePicture");

    return res.status(201).json({ success: true, message: "status added successfully", status: populatedStatus });
  } catch (error) {
    console.log("Error in addStatus:", error);
    return res.status(500).json({ success: false, message: "error adding status" });
  }
};

// Watch a status (mark as viewed)
export const watchStatus = async (req, res) => {
  try {
    const statusId = req.params.statusId;
    const userId = req.user._id;

    if (!statusId) {
      return res.status(400).json({ success: false, message: "statusId is required" });
    }

    // Find status
    const status = await storyModel.findById(statusId).populate("user", "_id username profilePicture");

    if (!status) {
      return res.status(404).json({ success: false, message: "Status not found" });
    }

    // Owner viewing their own status
    if (status.user._id.toString() === userId.toString()) {
      return res.status(200).json({ success: true, message: "Status watched successfully", status });
    }

    // Check if the viewer is in the owner's contacts
    const isUserInContact = await contactModel.findOne({
      owner: status.user._id, 
      contactUser: userId
    });

    if (!isUserInContact) {
      return res.status(403).json({ success: false, message: "You are not authorized to watch this status" });
    }

    // Add viewer if not already viewed
    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);
      await status.save();
    }

    return res.status(200).json({ success: true, message: "Status watched successfully", status });

  } catch (error) {
    console.log("Error in watchStatus:", error);
    return res.status(500).json({ success: false, message: "Error watching status" });
  }
};

// Get current user's statuses
export const getMyStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const status = await storyModel.find({ user: userId })
      .populate("user", "_id username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: "Status fetched successfully", status });
  } catch (error) {
    console.log("Error in getMyStatus:", error);
    return res.status(500).json({ success: false, message: "Error fetching status" });
  }
};

// Get statuses of contacts
export const getContactsStatuses = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all contacts of the user
    const contacts = await contactModel.find({ owner: userId });
    const contactIds = contacts.map(c => c.contactUser);

    // Find statuses where the owner is in the user's contacts
    const statuses = await storyModel.find({ user: { $in: contactIds } })
      .populate("user", "_id username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: "Contact statuses fetched successfully", statuses });
  } catch (error) {
    console.log("Error in getContactsStatuses:", error);
    return res.status(500).json({ success: false, message: "Error fetching contact statuses" });
  }
};