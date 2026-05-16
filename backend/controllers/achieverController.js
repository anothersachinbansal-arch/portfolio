import Achiever from "../models/Achiever.js";
import cloudinary from "../config/cloudinary.js";

// Upload a buffer to Cloudinary using upload_stream
const uploadBufferToCloudinary = (buffer, folder = "achievers") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export const createAchiever = async (req, res) => {
  try {
    const { name, score, course = "", year, isFeatured = false, order = 0 } = req.body;

    // Only image is required now
    if (!req.file) {
      return res.status(400).json({ message: "image file is required" });
    }

    const uploadRes = await uploadBufferToCloudinary(req.file.buffer, "achievers");
    const imageUrl = uploadRes.secure_url;

    const achiever = await Achiever.create({
      name, // optional
      score, // optional
      course,
      year: year || new Date().getFullYear(),
      isFeatured: String(isFeatured) === "true" || isFeatured === true,
      order: Number(order) || 0,
      image: imageUrl,
    });

    return res.status(201).json(achiever);
  } catch (err) {
    console.error("createAchiever error:", err);
    // Include error message in dev to help debugging
    return res.status(500).json({ message: "Failed to create achiever", error: err.message });
  }
};

export const listAchievers = async (req, res) => {
  try {
    const { featured } = req.query;
    const filter = {};
    if (featured === "true") filter.isFeatured = true;

    // Show latest uploads first universally
    const achievers = await Achiever.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(achievers);
  } catch (err) {
    console.error("listAchievers error:", err);
    return res.status(500).json({ message: "Failed to fetch achievers", error: err.message });
  }
};

export const deleteAchiever = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({ message: "Invalid achiever ID" });
    }
    const doc = await Achiever.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    await doc.deleteOne();
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteAchiever error:", err);
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ message: "Failed to delete achiever", error: err.message, stack: err.stack });
    } else {
      return res.status(500).json({ message: "Failed to delete achiever" });
    }
  }
};

// Update achiever (primarily for replacing image; other fields optional)
export const updateAchiever = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({ message: "Invalid achiever ID" });
    }
    const { name, score, course, year, isFeatured, order } = req.body;

    const doc = await Achiever.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    // If new image file uploaded, push to Cloudinary
    if (req.file) {
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer, "achievers");
      doc.image = uploadRes.secure_url;
    }

    if (typeof name !== 'undefined') doc.name = name;
    if (typeof score !== 'undefined') doc.score = score;
    if (typeof course !== 'undefined') doc.course = course;
    if (typeof year !== 'undefined') doc.year = year;
    if (typeof isFeatured !== 'undefined') doc.isFeatured = String(isFeatured) === 'true' || isFeatured === true;
    if (typeof order !== 'undefined') doc.order = Number(order) || 0;

    await doc.save();
    return res.json(doc);
  } catch (err) {
    console.error("updateAchiever error:", err);
    return res.status(500).json({ message: "Failed to update achiever", error: err.message });
  }
};