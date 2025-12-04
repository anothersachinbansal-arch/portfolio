import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import Achiever from "./models/Achiever.js";

dotenv.config();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ MongoDB Connect
await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

("✅ MongoDB connected");

// ✅ Extract ZIP and Upload
async function uploadZip(zipPath, extractTo = "./temp") {
  // 1. Extract ZIP
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractTo }))
    .promise();

  ("✅ Extraction Done");

  // 2. Read all images
  const files = fs.readdirSync(extractTo);

  for (const file of files) {
    const filePath = path.join(extractTo, file);

    if (!fs.lstatSync(filePath).isFile()) continue;

    try {
      // 3. Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "achievers",
      });

      // File name ko "name" field bana lenge (without extension)
      const fileNameWithoutExt = path.parse(file).name;

      // 4. Save in DB
      const newAchiever = new Achiever({
        name: fileNameWithoutExt, // agar alag name chahiye to excel/json se bhi read kar sakte ho
        image: result.secure_url,
      });

      await newAchiever.save();

      (`✅ Uploaded & Saved: ${file}`);
    } catch (err) {
      console.error(`❌ Error in ${file}:`, err.message);
    }
  }

  // 5. Clean up extracted files (optional)
  fs.rmSync(extractTo, { recursive: true, force: true });
  ("🧹 Temp folder deleted");

  ("🎉 All done!");
  mongoose.disconnect();
}

// Run
uploadZip("./achieversimg.zip");
