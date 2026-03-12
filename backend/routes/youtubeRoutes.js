import express from "express";
import YouTubeVideo from "../models/YouTubeVideo.js";

const router = express.Router();

// GET all YouTube videos
router.get("/", async (req, res) => {
  try {
    const videos = await YouTubeVideo.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch YouTube videos"
    });
  }
});

// POST new YouTube video
router.post("/", async (req, res) => {
  try {
    const { url, title, videoId, thumbnail } = req.body;

    if (!url || !videoId || !thumbnail) {
      return res.status(400).json({
        success: false,
        error: "URL, videoId, and thumbnail are required"
      });
    }

    const newVideo = new YouTubeVideo({
      url: url.trim(),
      title: title?.trim() || 'YouTube Video',
      videoId: videoId.trim(),
      thumbnail: thumbnail.trim()
    });

    const savedVideo = await newVideo.save();
    res.status(201).json({
      success: true,
      data: savedVideo
    });
  } catch (error) {
    console.error("Error adding YouTube video:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add YouTube video"
    });
  }
});

// DELETE YouTube video
router.delete("/:id", async (req, res) => {
  try {
    const deletedVideo = await YouTubeVideo.findByIdAndDelete(req.params.id);
    
    if (!deletedVideo) {
      return res.status(404).json({
        success: false,
        error: "YouTube video not found"
      });
    }

    res.json({
      success: true,
      message: "YouTube video deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting YouTube video:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete YouTube video"
    });
  }
});

export default router;
