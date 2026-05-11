import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Book from '../models/Book.js';

// Load environment variables
dotenv.config();

// Delete all books from database
const deleteAllBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Count books before deletion
    const booksBefore = await Book.countDocuments();
    console.log(`📚 Books before deletion: ${booksBefore}`);
    
    if (booksBefore === 0) {
      console.log('ℹ️ No books found in database');
      await mongoose.disconnect();
      return;
    }
    
    // Show books before deletion
    const books = await Book.find({}, 'bookId title');
    console.log('\n📋 Books to be deleted:');
    books.forEach(book => {
      console.log(`  - ${book.bookId}: ${book.title}`);
    });
    
    // Confirm deletion
    console.log('\n⚠️ WARNING: About to delete all books!');
    console.log('This action cannot be undone.');
    
    // Delete all books
    const deleteResult = await Book.deleteMany({});
    console.log(`\n🗑️ Deleted ${deleteResult.deletedCount} books`);
    
    // Verify deletion
    const booksAfter = await Book.countDocuments();
    console.log(`📚 Books after deletion: ${booksAfter}`);
    
    if (booksAfter === 0) {
      console.log('✅ All books successfully deleted');
    } else {
      console.log('❌ Some books still exist');
    }
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error deleting books:', error);
    await mongoose.disconnect();
  }
};

// Run the deletion
deleteAllBooks();
