import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    ("MongoDB Connected...");

    const email = "polsciencewithsachinsir@gmail.com";
    const plainPassword = "sachinbansal817835";

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      // update the password to ensure you know it
      existingAdmin.password = plainPassword; // will be hashed by pre-save hook
      await existingAdmin.save();
      ("✅ Admin password updated successfully!");
      process.exit(0);
    }
    const admin = new Admin({
      name: "Sachin Bansal", // required field
      email,
      password: plainPassword, // will be hashed by pre-save hook
    });

    await admin.save();
    ("✅ Admin user created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
