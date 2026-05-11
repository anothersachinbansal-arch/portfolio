import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/Book.js";

dotenv.config();

async function createInitialBooks() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to database");

    // Check if books already exist
    const existingBooks = await Book.find();
    if (existingBooks.length > 0) {
      console.log(`📚 Found ${existingBooks.length} existing books. Skipping initial book creation.`);
      process.exit(0);
    }

    // Initial books data
    const initialBooks = [
      {
        bookId: "MATH_10_CLASS",
        title: "Mathematics for Class 10",
        description: "Comprehensive mathematics guide for Class 10 students covering all topics including algebra, geometry, trigonometry, and statistics with solved examples and practice exercises.",
        price: 299,
        imageUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=600&fit=crop",
        quantity: 50,
        category: "Mathematics",
        classLevel: "Class 10",
        author: "Sachin Bansal",
        pages: 320,
        language: "English"
      },
      {
        bookId: "SCIENCE_10_CLASS",
        title: "Science for Class 10",
        description: "Complete science textbook covering Physics, Chemistry, and Biology for Class 10 with detailed explanations, diagrams, and experiment guides.",
        price: 349,
        imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=600&fit=crop",
        quantity: 30,
        category: "Science",
        classLevel: "Class 10",
        author: "Sachin Bansal",
        pages: 450,
        language: "English"
      },
      {
        bookId: "ENGLISH_10_CLASS",
        title: "English Grammar and Composition",
        description: "English grammar and composition guide for Class 10 students with grammar rules, writing techniques, and literature analysis.",
        price: 249,
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
        quantity: 75,
        category: "English",
        classLevel: "Class 10",
        author: "Sachin Bansal",
        pages: 280,
        language: "English"
      },
      {
        bookId: "PHYSICS_12_CLASS",
        title: "Physics for Class 12",
        description: "Advanced physics textbook for Class 12 covering mechanics, electromagnetism, optics, and modern physics with numerical problems and solutions.",
        price: 399,
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop",
        quantity: 0, // Out of stock
        category: "Physics",
        classLevel: "Class 12",
        author: "Sachin Bansal",
        pages: 520,
        language: "English"
      }
    ];

    // Insert books
    for (const bookData of initialBooks) {
      const book = new Book(bookData);
      await book.save();
      console.log(`📚 Created book: ${book.title} (ID: ${book.bookId})`);
    }

    console.log("🎉 Initial books created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
}

// Run the script
createInitialBooks();
