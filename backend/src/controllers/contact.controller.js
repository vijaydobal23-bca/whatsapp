import contactModel from "../models/contact.model.js";
import userModel from "../models/user.model.js";
import redis from "../redis/redis.js";

export const addToContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contactId } = req.params;

    if (!userId || !contactId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // prevent adding yourself
    if (userId.toString() === contactId) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    // verify contact user exists
    const contactUser = await userModel.findById(contactId);
    if (!contactUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyInContact = await contactModel.findOne({ owner: userId, contactUser: contactId });
    if (isAlreadyInContact) {
      return res.status(400).json({ message: "Contact already exists" });
    }

    const contact = await contactModel.create({
      owner: userId,
      contactUser: contactId,
    });

    // Invalidate the cached contacts
    await redis.del(`contacts:${userId}`);

    return res.status(201).json({
      message: "Contact added successfully",
      contact,
    });
  } catch (err) {
    console.log("error in addToContact", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check cache
    const cachedContacts = await redis.get(`contacts:${userId}`);
    if (cachedContacts) {
      return res.status(200).json({
        message: "Contacts fetched successfully",
        contacts: JSON.parse(cachedContacts),
      });
    }

    const contacts = await contactModel
      .find({ owner: userId })
      .populate("contactUser", "username email profilePicture status bio lastSeen");

    // Set cache (expire after 1 hour)
    await redis.set(`contacts:${userId}`, JSON.stringify(contacts), { EX: 3600 });

    return res.status(200).json({
      message: "Contacts fetched successfully",
      contacts,
    });
  } catch (err) {
    console.log("error in getMyContacts", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contactId } = req.params;

    if (!userId || !contactId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = await contactModel.findOne({ owner: userId, contactUser: contactId });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await contactModel.deleteOne({ owner: userId, contactUser: contactId });
    
    // Invalidate the cached contacts
    await redis.del(`contacts:${userId}`);

    return res.status(200).json({ message: "Contact removed successfully" });
  } catch (err) {
    console.log("error in removeContact", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contactId } = req.params;

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    const contact = await contactModel.findOne({ owner: userId, contactUser: contactId });

    return res.status(200).json({
      isContact: !!contact,
    });
  } catch (err) {
    console.log("error in checkContact", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // search by username or email (case-insensitive partial match)
    const users = await userModel
      .find({
        _id: { $ne: userId }, // exclude the current user
        $or: [
          { username: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
      .select("username email profilePicture status bio")
      .limit(20);

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    console.log("error in searchUsers", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};