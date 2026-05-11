import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/Book.js";

dotenv.config();

async function testBookModel() {
  try {
    console.log("🔗 Testing database connection...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");

    console.log("📊 Testing Book model...");
    
    // Test 1: Check if Book model is properly defined
    console.log("Book model schema:", Book.schema.obj);
    
    // Test 2: Try to create a simple book
    console.log("📝 Creating test book...");
    const testBook = new Book({
      bookId: "TEST_BOOK_001",
      title: "Test Book",
      description: "This is a test book",
      price: 100,
      imageUrl: "/test.png",
      quantity: 10,
      category: "Test",
      classLevel: "Test",
      author: "Test Author",
      pages: 100,
      language: "English"
    });
    
    await testBook.save();
    console.log("✅ Test book created successfully");
    
    // Test 3: Try to find the book
    const foundBook = await Book.findOne({ bookId: "TEST_BOOK_001" });
    console.log("📖 Found book:", foundBook ? foundBook.title : "Not found");
    
    // Test 4: Test the available books query
    console.log("🔍 Testing available books query...");
    const availableBooks = await Book.find({ 
      isAvailable: true,
      quantity: { $gt: 0 }
    });
    console.log(`📚 Found ${availableBooks.length} available books`);
    
    // Clean up test book
    await Book.deleteOne({ bookId: "TEST_BOOK_001" });
    console.log("🗑️ Test book cleaned up");

    console.log("🎉 All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run the test
testBookModel();
