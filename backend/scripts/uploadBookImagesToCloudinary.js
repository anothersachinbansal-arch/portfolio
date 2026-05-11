import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
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

// Book images configuration
const bookImages = [
  { bookId: 'POLITICAL_SCIENCE_11', front: 'book1.png', back: 'book1back.png' },
  { bookId: 'POLITICAL_SCIENCE_12', front: 'book2.png', back: 'book2back.png' },
  { bookId: 'SOCIOLOGY_11', front: 'book3.png', back: 'book3back.png' },
  { bookId: 'SOCIOLOGY_12', front: 'book4.png', back: 'book4back.png' }
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

// Main upload function
const uploadAllBookImages = async () => {
  console.log('🚀 Starting book images upload to Cloudinary...');
  
  const uploadResults = [];
  
  for (const book of bookImages) {
    console.log(`\n📚 Processing ${book.bookId}...`);
    
    const frontPath = path.join(__dirname, '../../frontend/public', book.front);
    const backPath = path.join(__dirname, '../../frontend/public', book.back);
    
    // Check if files exist
    if (!fs.existsSync(frontPath)) {
      console.error(`❌ Front image not found: ${frontPath}`);
      continue;
    }
    
    if (!fs.existsSync(backPath)) {
      console.error(`❌ Back image not found: ${backPath}`);
      continue;
    }
    
    // Upload front image
    const frontUrl = await uploadImage(
      frontPath, 
      `${book.bookId}_front`
    );
    
    // Upload back image  
    const backUrl = await uploadImage(
      backPath, 
      `${book.bookId}_back`
    );
    
    if (frontUrl && backUrl) {
      uploadResults.push({
        bookId: book.bookId,
        images: [frontUrl, backUrl]
      });
      
      console.log(`✅ ${book.bookId}: Both images uploaded successfully`);
    } else {
      console.log(`❌ ${book.bookId}: Failed to upload images`);
    }
  }
  
  console.log('\n📊 Upload Summary:');
  console.log('==================');
  uploadResults.forEach(result => {
    console.log(`${result.bookId}:`);
    console.log(`  Front: ${result.images[0]}`);
    console.log(`  Back:  ${result.images[1]}`);
  });
  
  console.log('\n🎉 Upload process completed!');
  console.log('\n📝 To update database with these URLs, run:');
  console.log('node scripts/updateBookImagesInDB.js');
  
  // Save results to file for database update
  const resultsPath = path.join(__dirname, 'cloudinaryImageUrls.json');
  fs.writeFileSync(resultsPath, JSON.stringify(uploadResults, null, 2));
  console.log(`💾 Results saved to: ${resultsPath}`);
};

// Run the upload
uploadAllBookImages().catch(console.error);
