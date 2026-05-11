import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/Book.js";

dotenv.config();

async function makeBooksAvailable() {
  try {
    // Connect to production database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to production database");

    // Get all books
    const books = await Book.find({});
    console.log(`📚 Found ${books.length} books in database`);

    // Update all books to be available
    for (const book of books) {
      console.log(`📖 Processing book: ${book.title}`);
      console.log(`   Current status: isAvailable=${book.isAvailable}, quantity=${book.quantity}`);
      
      // Update book to be available
      book.isAvailable = true;
      book.quantity = 100; // Ensure quantity is sufficient
      
      await book.save();
      console.log(`   ✅ Updated: isAvailable=${book.isAvailable}, quantity=${book.quantity}`);
    }

    // Verify the update
    const availableBooks = await Book.find({ 
      isAvailable: true,
      quantity: { $gt: 0 }
    });
    
    console.log(`🎉 Total available books: ${availableBooks.length}`);
    
    availableBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - Available: ${book.isAvailable}, Quantity: ${book.quantity}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
}

// Run the script
makeBooksAvailable();
