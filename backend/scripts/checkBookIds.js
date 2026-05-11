import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Book from '../models/Book.js';

// Load environment variables
dotenv.config();

// Check book IDs in database
const checkBookIds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const books = await Book.find({}, 'bookId title images');
    console.log('\n📚 Books in database:');
    console.log('======================');
    
    books.forEach(book => {
      console.log(`${book.bookId}: ${book.title}`);
      if (book.images && book.images.length > 0) {
        console.log(`  Images: ${book.images.length}`);
        book.images.forEach((img, index) => {
          console.log(`    ${index + 1}: ${img}`);
        });
      } else {
        console.log('  Images: None');
      }
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkBookIds();
