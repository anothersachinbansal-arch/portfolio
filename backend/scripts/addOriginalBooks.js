import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/Book.js";

dotenv.config();

async function addOriginalBooks() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to database");

    // Original books data with same titles and images
    const originalBooks = [
      {
        bookId: "POLITICAL_SCIENCE_12",
        title: "Class 12 Political Science Guide (CBSE) – Notes, Important Questions & Exam Preparation",
        description: "A focused guide for Class XII students studying Political Science under the CBSE curriculum. Presents key concepts in a clear and structured way, making it easier to understand, revise, and apply in exams. Built on classroom experience, the book offers concise notes, important questions, and exam-oriented content to help students prepare with clarity and confidence. It also supports better answer writing and systematic revision. This book is designed to supplement your preparation and is not a substitute for NCERT textbooks.",
        price: 1,
        imageUrl: "/book1.png",
        quantity: 100,
        category: "Political Science",
        classLevel: "Class 12",
        author: "Sachin Bansal",
        pages: 280,
        language: "English"
      },
      {
        bookId: "POLITICAL_SCIENCE_11",
        title: "Class 11 Political Science Guide (CBSE) – Notes, Important Questions & Exam Preparation",
        description: "A focused guide for Class XI students studying Political Science under the CBSE curriculum. Presents key concepts in a clear and structured way, making it easier to understand, revise, and apply in exams. Built on classroom experience with concise notes, important questions, and exam-oriented content to help students prepare with clarity and confidence. It also supports better answer writing and systematic revision. This book is designed to supplement your preparation and is not a substitute for NCERT textbooks.",
        price: 499,
        imageUrl: "/book2.png",
        quantity: 100,
        category: "Political Science",
        classLevel: "Class 11",
        author: "Sachin Bansal",
        pages: 260,
        language: "English"
      },
      {
        bookId: "SOCIOLOGY_12",
        title: "CBSE Class 12 Sociology – Complete Guide with Notes and Important Questions",
        description: "A practical and student-friendly guide for Class XII Sociology based on the CBSE curriculum. Designed to help students understand key sociological concepts with clarity while preparing effectively for board examinations. Offers well-structured notes, clear explanations, and carefully selected important questions to support systematic learning and revision. Focuses on building conceptual understanding along with improving answer-writing skills, which are essential for scoring well in exams.",
        price: 499,
        imageUrl: "/book3.png",
        quantity: 100,
        category: "Sociology",
        classLevel: "Class 12",
        author: "Sachin Bansal",
        pages: 300,
        language: "English"
      },
      {
        bookId: "SOCIOLOGY_11",
        title: "CBSE Class 11 Sociology – Complete Guide with Notes and Important Questions",
        description: "A practical and student-friendly guide for Class XI Sociology based on the CBSE curriculum. Designed to help students understand key sociological concepts with clarity while preparing effectively for board examinations. Offers well-structured notes, clear explanations, and carefully selected important questions to support systematic learning and revision. Focuses on building conceptual understanding along with improving answer-writing skills, which are essential for scoring well in exams.",
        price: 499,
        imageUrl: "/book4.png",
        quantity: 100,
        category: "Sociology",
        classLevel: "Class 11",
        author: "Sachin Bansal",
        pages: 290,
        language: "English"
      }
    ];

    // Clear existing books to avoid duplicates
    await Book.deleteMany({});
    console.log("🗑️ Cleared existing books");

    // Insert original books
    for (const bookData of originalBooks) {
      const book = new Book(bookData);
      await book.save();
      console.log(`📚 Added book: ${book.title} (ID: ${book.bookId})`);
    }

    console.log("🎉 Original books added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
}

// Run the script
addOriginalBooks();
