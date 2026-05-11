import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/Book.js";

dotenv.config();

async function checkBooks() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to database:", process.env.MONGO_URI);

    // Check all books in database
    const books = await Book.find({});
    console.log(`📚 Found ${books.length} books in database:`);
    
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} (ID: ${book.bookId}) - Quantity: ${book.quantity}`);
    });

    if (books.length === 0) {
      console.log("❌ No books found in database!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
}

// Run the script
checkBooks();
