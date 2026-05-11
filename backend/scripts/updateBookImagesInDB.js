import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Update book images in database
const updateBookImages = async () => {
  try {
    console.log('🚀 Starting database update for book images...');
    
    // Read Cloudinary URLs from the upload results
    const resultsPath = path.join(__dirname, 'cloudinaryImageUrls.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.error('❌ Cloudinary URLs file not found. Please run upload script first.');
      return;
    }
    
    const cloudinaryUrls = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    console.log(`📊 Found ${cloudinaryUrls.length} books to update`);
    
    for (const bookData of cloudinaryUrls) {
      console.log(`\n📚 Updating ${bookData.bookId}...`);
      
      try {
        // Find and update the book
        const book = await Book.findOne({ bookId: bookData.bookId });
        
        if (!book) {
          console.log(`❌ Book not found: ${bookData.bookId}`);
          continue;
        }
        
        // Update images array
        book.images = bookData.images;
        await book.save();
        
        console.log(`✅ Updated ${bookData.bookId}:`);
        console.log(`   Front: ${bookData.images[0]}`);
        console.log(`   Back:  ${bookData.images[1]}`);
        
      } catch (error) {
        console.error(`❌ Failed to update ${bookData.bookId}:`, error);
      }
    }
    
    console.log('\n🎉 Database update completed!');
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    for (const bookData of cloudinaryUrls) {
      const book = await Book.findOne({ bookId: bookData.bookId });
      if (book) {
        console.log(`✅ ${book.bookId}: ${book.images.length} images`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await updateBookImages();
  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB');
};

// Run the script
main().catch(console.error);
