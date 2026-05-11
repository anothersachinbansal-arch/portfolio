import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Books configuration - in proper sequence
const booksToUpload = [
  {
    bookId: 'POLITICAL_SCIENCE_12',
    title: 'Class 12 Political Science Guide (CBSE) – Notes, Important Questions & Exam Preparation',
    description: 'A focused guide for Class XII students studying Political Science under the CBSE curriculum. Presents key concepts in a clear and structured way, making it easier to understand, revise, and apply in exams. Built on classroom experience, the book offers concise notes, important questions, and exam-oriented content to help students prepare with clarity and confidence. It also supports better answer writing and systematic revision. This book is designed to supplement your preparation and is not a substitute for NCERT textbooks.',
    price: 499,
    quantity: 100,
    category: 'Political Science',
    classLevel: 'Class 12',
    author: 'Sachin Bansal',
    pages: 280,
    language: 'English',
    frontImage: 'book2.png',
    backImage: 'book2back.png'
  },
  {
    bookId: 'SOCIOLOGY_12',
    title: 'CBSE Class 12 Sociology – Complete Guide with Notes and Important Questions',
    description: 'A practical and student-friendly guide for Class XII Sociology based on the CBSE curriculum. Designed to help students understand key sociological concepts with clarity while preparing effectively for board examinations. Offers well-structured notes, clear explanations, and carefully selected important questions to support systematic learning and revision. Focuses on building conceptual understanding along with improving answer-writing skills, which are essential for scoring well in exams.',
    price: 499,
    quantity: 100,
    category: 'Sociology',
    classLevel: 'Class 12',
    author: 'Sachin Bansal',
    pages: 300,
    language: 'English',
    frontImage: 'book4.png',
    backImage: 'book4back.png'
  },
  {
    bookId: 'POLITICAL_SCIENCE_11',
    title: 'Class 11 Political Science Guide (CBSE) – Notes, Important Questions & Exam Preparation',
    description: 'A focused guide for Class XI students studying Political Science under the CBSE curriculum. Presents key concepts in a clear and structured way, making it easier to understand, revise, and apply in exams. Built on classroom experience with concise notes, important questions, and exam-oriented content to help students prepare with clarity and confidence. It also supports better answer writing and systematic revision. This book is designed to supplement your preparation and is not a substitute for NCERT textbooks.',
    price: 499,
    quantity: 100,
    category: 'Political Science',
    classLevel: 'Class 11',
    author: 'Sachin Bansal',
    pages: 260,
    language: 'English',
    frontImage: 'book1.png',
    backImage: 'book1back.png'
  },
  {
    bookId: 'SOCIOLOGY_11',
    title: 'CBSE Class 11 Sociology – Complete Guide with Notes and Important Questions',
    description: 'A practical and student-friendly guide for Class XI Sociology based on the CBSE curriculum. Designed to help students understand key sociological concepts with clarity while preparing effectively for board examinations. Offers well-structured notes, clear explanations, and carefully selected important questions to support systematic learning and revision. Focuses on building conceptual understanding along with improving answer-writing skills, which are essential for scoring well in exams.',
    price: 499,
    quantity: 99,
    category: 'Sociology',
    classLevel: 'Class 11',
    author: 'Sachin Bansal',
    pages: 290,
    language: 'English',
    frontImage: 'book3.png',
    backImage: 'book3back.png'
  }
];

// Upload single image to Cloudinary
const uploadImage = async (filePath, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: 'books',
      public_id: publicId,
      overwrite: true
    });
    
    console.log(`✅ Uploaded: ${publicId} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Failed to upload ${publicId}:`, error);
    return null;
  }
};

// Upload book images and create book record
const uploadBook = async (bookData) => {
  try {
    console.log(`\n📚 Processing ${bookData.bookId}...`);
    
    const frontPath = path.join(__dirname, '../../frontend/public', bookData.frontImage);
    const backPath = path.join(__dirname, '../../frontend/public', bookData.backImage);
    
    // Check if files exist
    if (!fs.existsSync(frontPath)) {
      console.error(`❌ Front image not found: ${frontPath}`);
      return false;
    }
    
    if (!fs.existsSync(backPath)) {
      console.error(`❌ Back image not found: ${backPath}`);
      return false;
    }
    
    // Upload front image first
    console.log(`  📸 Uploading front image...`);
    const frontUrl = await uploadImage(frontPath, `${bookData.bookId}_front`);
    
    if (!frontUrl) {
      console.log(`❌ Failed to upload front image for ${bookData.bookId}`);
      return false;
    }
    
    // Wait a moment to avoid conflicts
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Upload back image
    console.log(`  📸 Uploading back image...`);
    const backUrl = await uploadImage(backPath, `${bookData.bookId}_back`);
    
    if (!backUrl) {
      console.log(`❌ Failed to upload back image for ${bookData.bookId}`);
      return false;
    }
    
    // Create book record
    console.log(`  💾 Creating book record...`);
    const book = new Book({
      bookId: bookData.bookId,
      title: bookData.title,
      description: bookData.description,
      price: bookData.price,
      images: [frontUrl, backUrl],
      quantity: bookData.quantity,
      category: bookData.category,
      classLevel: bookData.classLevel,
      author: bookData.author,
      pages: bookData.pages,
      language: bookData.language,
      isAvailable: true
    });
    
    await book.save();
    console.log(`✅ ${bookData.bookId}: Book created successfully`);
    console.log(`   Front: ${frontUrl}`);
    console.log(`   Back:  ${backUrl}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to process ${bookData.bookId}:`, error);
    return false;
  }
};

// Main upload function
const uploadAllBooksSequentially = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log(`\n🚀 Starting sequential upload of ${booksToUpload.length} books...`);
    
    let successCount = 0;
    
    for (let i = 0; i < booksToUpload.length; i++) {
      const bookData = booksToUpload[i];
      console.log(`\n📖 Book ${i + 1}/${booksToUpload.length}`);
      
      const success = await uploadBook(bookData);
      
      if (success) {
        successCount++;
        console.log(`✅ Book ${i + 1} completed successfully`);
      } else {
        console.log(`❌ Book ${i + 1} failed`);
      }
      
      // Wait between books to avoid any conflicts
      if (i < booksToUpload.length - 1) {
        console.log(`⏳ Waiting 2 seconds before next book...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n🎉 Upload process completed!`);
    console.log(`✅ Successful: ${successCount}/${booksToUpload.length} books`);
    console.log(`❌ Failed: ${booksToUpload.length - successCount}/${booksToUpload.length} books`);
    
    // Verify the upload
    console.log('\n🔍 Verifying uploaded books...');
    const finalBooks = await Book.find({}, 'bookId title images');
    console.log(`📚 Total books in database: ${finalBooks.length}`);
    
    finalBooks.forEach(book => {
      console.log(`  ${book.bookId}: ${book.images?.length || 0} images`);
    });
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Upload process failed:', error);
    await mongoose.disconnect();
  }
};

// Run the upload
uploadAllBooksSequentially().catch(console.error);
