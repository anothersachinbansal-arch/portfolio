import mongoose from 'mongoose';
import Book from '../models/Book.js';
import dotenv from 'dotenv';

dotenv.config();

const makeAllBooksAvailable = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Update all books to be available
    const result = await Book.updateMany(
      { isAvailable: false },
      { isAvailable: true }
    );

    console.log(`✅ Updated ${result.modifiedCount} books to available`);

    // Verify the update
    const unavailableBooks = await Book.countDocuments({ isAvailable: false });
    const totalBooks = await Book.countDocuments();
    const availableBooks = totalBooks - unavailableBooks;

    console.log(`📊 Book Status:`);
    console.log(`   Total Books: ${totalBooks}`);
    console.log(`   Available Books: ${availableBooks}`);
    console.log(`   Unavailable Books: ${unavailableBooks}`);

    // Show all books with their status
    const allBooks = await Book.find({}, { bookId: 1, title: 1, isAvailable: 1, quantity: 1 });
    console.log('\n📚 All Books Status:');
    allBooks.forEach(book => {
      console.log(`   ${book.isAvailable ? '✅' : '❌'} ${book.title} (${book.bookId}) - Qty: ${book.quantity}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

makeAllBooksAvailable();
