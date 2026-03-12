import mongoose from "mongoose";

const youtubeVideoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoId: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const YouTubeVideo = mongoose.model("YouTubeVideo", youtubeVideoSchema);

export default YouTubeVideo;
