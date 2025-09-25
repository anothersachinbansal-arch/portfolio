import express from "express";
import multer from "multer";
// import { protect } from "../middleware/authMiddleware.js"; // enable later if needed
import {
  createAchiever,
  listAchievers,
  deleteAchiever,
  updateAchiever,
} from "../controllers/achieverController.js";

const router = express.Router();

// Memory storage for buffer upload to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Public: list achievers (supports ?featured=true)
router.get("/", listAchievers);

// Public: get single achiever (debug/helper)
router.get("/:id", async (req, res, next) => {
  try {
    const { default: Achiever } = await import("../models/Achiever.js");
    const doc = await Achiever.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch (e) {
    return res.status(400).json({ message: "Invalid id", error: e.message });
  }
});

// Admin: create achiever (multipart/form-data)
// Add 'protect' when you want to require JWT: [protect, upload.single("image")]
router.post("/", upload.single("image"), createAchiever);

// Admin: delete achiever
router.delete("/:id", deleteAchiever);

// Admin: update achiever (replace image or fields)
router.patch(
  "/:id",
  upload.single("image"),
  updateAchiever
);

// Also allow PUT for clients that use it
router.put(
  "/:id",
  upload.single("image"),
  updateAchiever
);

export default router;