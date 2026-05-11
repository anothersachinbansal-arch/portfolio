import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Book from "../models/Book.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ===============================
// Get All Books (Admin)
// ===============================
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      books: books.map(book => ({
        id: book._id,
        bookId: book.bookId,
        title: book.title,
        description: book.description,
        price: book.price,
        imageUrl: book.imageUrl,
        quantity: book.quantity,
        isAvailable: book.isAvailable,
        category: book.category,
        classLevel: book.classLevel,
        author: book.author,
        pages: book.pages,
        language: book.language,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message
    });
  }
});

// ===============================
// Get Available Books (For Frontend)
// ===============================
router.get("/available", async (req, res) => {
  try {
    console.log("🔍 Fetching available books...");
    const books = await Book.find({ 
      isAvailable: true,
      quantity: { $gt: 0 }
    }).sort({ createdAt: -1 });
    console.log(`📚 Found ${books.length} available books`);
    
    // Return raw books data for now
    res.json({
      success: true,
      books: books
    });
  } catch (error) {
    console.error("Error fetching available books:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available books",
      error: error.message
    });
  }
});

// ===============================
// Add New Book (Admin)
// ===============================
router.post("/admin/add", adminAuth, upload.array('images', 2), async (req, res) => {
  try {
    const {
      bookId,
      title,
      description,
      price,
      imageUrl,
      quantity,
      category,
      classLevel,
      author,
      pages,
      language,
      isAvailable
    } = req.body;

    // Validate required fields - imageUrl is optional when uploading image
    if (!bookId || !title || !description || !price || !category || !classLevel || !author || !pages) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if book already exists
    const existingBook = await Book.findOne({ bookId });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "Book with this ID already exists"
      });
    }

    let finalImageUrl = imageUrl?.trim() || '';

    // Handle image uploads if provided
    let finalImages = [];
    
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file, index) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'auto',
                folder: 'books',
                public_id: `book_${bookId}_${index + 1}_${Date.now()}`
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            ).end(file.buffer);
          });
        });
        
        finalImages = await Promise.all(uploadPromises);
        console.log(`📸 ${finalImages.length} images uploaded to Cloudinary`);
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          error: uploadError.message
        });
      }
    }

    const book = new Book({
      bookId: bookId.trim(),
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      images: finalImages,
      quantity: Number(quantity) || 0,
      category: category.trim(),
      classLevel: classLevel.trim(),
      author: author.trim(),
      pages: Number(pages),
      language: language?.trim() || "English",
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await book.save();

    res.json({
      success: true,
      message: "Book added successfully",
      book: {
        id: book._id,
        bookId: book.bookId,
        title: book.title,
        description: book.description,
        price: book.price,
        images: book.images,
        quantity: book.quantity,
        isAvailable: book.isAvailable,
        category: book.category,
        classLevel: book.classLevel,
        author: book.author,
        pages: book.pages,
        language: book.language
      }
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add book",
      error: error.message
    });
  }
});

// ===============================
// Update Book Quantity (Admin)
// ===============================
router.put("/admin/update-quantity/:bookId", adminAuth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity, action } = req.body; // action can be 'set', 'add', 'subtract'

    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    let newQuantity;
    const currentQuantity = book.quantity;

    switch (action) {
      case 'set':
        newQuantity = Number(quantity);
        break;
      case 'add':
        newQuantity = currentQuantity + Number(quantity);
        break;
      case 'subtract':
        newQuantity = currentQuantity - Number(quantity);
        break;
      default:
        newQuantity = Number(quantity);
    }

    if (newQuantity < 0) {
      newQuantity = 0;
    }

    book.quantity = newQuantity;
    await book.save();

    res.json({
      success: true,
      message: "Book quantity updated successfully",
      previousQuantity: currentQuantity,
      newQuantity: book.quantity,
      isAvailable: book.isAvailable
    });
  } catch (error) {
    console.error("Error updating book quantity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book quantity",
      error: error.message
    });
  }
});

// ===============================
// Update Book Details (Admin)
// ===============================
router.put("/admin/update/:id", adminAuth, upload.array('images', 2), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // Handle image uploads if new images are provided
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file, index) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'auto',
                folder: 'books',
                public_id: `book_${updateData.bookId || book.bookId}_${index + 1}_${Date.now()}`
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            ).end(file.buffer);
          });
        });
        
        updateData.images = await Promise.all(uploadPromises);
        console.log(`📸 ${updateData.images.length} new images uploaded to Cloudinary`);
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          error: uploadError.message
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`✅ Book updated: ${updatedBook.title}`);
    
    res.json({
      success: true,
      message: "Book updated successfully",
      book: updatedBook
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message
    });
  }
});

// ===============================
// Update Book Availability (Admin)
// ===============================
router.put("/admin/toggle-availability/:bookId", adminAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    book.isAvailable = !book.isAvailable;
    await book.save();

    res.json({
      success: true,
      message: `Book ${book.isAvailable ? 'marked as available' : 'marked as unavailable'} successfully`,
      isAvailable: book.isAvailable,
      quantity: book.quantity
    });
  } catch (error) {
    console.error("Error updating book availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book availability",
      error: error.message
    });
  }
});

// ===============================
// Delete Book (Admin)
// ===============================
router.delete("/admin/delete/:bookId", adminAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    await Book.deleteOne({ bookId });

    res.json({
      success: true,
      message: "Book deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message
    });
  }
});

// ===============================
// Decrease Book Quantity (Internal Use)
// ===============================
router.post("/internal/decrease-quantity/:bookId", adminAuth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity = 1 } = req.body;

    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    if (book.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock"
      });
    }

    book.quantity -= quantity;
    
    // Automatically mark as unavailable if quantity reaches 0
    let availabilityChanged = false;
    if (book.quantity === 0 && book.isAvailable) {
      book.isAvailable = false;
      availabilityChanged = true;
      console.log(`📚 Book "${book.title}" is now out of stock - marked as unavailable`);
    }
    
    await book.save();

    res.json({
      success: true,
      message: "Book quantity decreased successfully" + (availabilityChanged ? " and marked as unavailable" : ""),
      remainingQuantity: book.quantity,
      isAvailable: book.isAvailable,
      availabilityChanged: availabilityChanged
    });
  } catch (error) {
    console.error("Error decreasing book quantity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decrease book quantity",
      error: error.message
    });
  }
});

// ===============================
// Debug: Get Raw Books (For Testing)
// ===============================
router.get("/debug", async (req, res) => {
  try {
    console.log("🔍 Debug: Fetching all books...");
    const allBooks = await Book.find({});
    console.log(`📚 Debug: Found ${allBooks.length} total books`);
    
    const availableBooks = await Book.find({ 
      isAvailable: true,
      quantity: { $gt: 0 }
    });
    console.log(`📚 Debug: Found ${availableBooks.length} available books`);
    
    res.json({
      success: true,
      totalBooks: allBooks.length,
      availableBooks: availableBooks.length,
      allBooks: allBooks,
      availableBooksData: availableBooks
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===============================
// Production Diagnostic
// ===============================
router.get("/prod-diag", async (req, res) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      env: {
        MONGO_URI: process.env.MONGO_URI ? "SET" : "NOT_SET",
        NODE_ENV: process.env.NODE_ENV || "undefined"
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState
      },
      bookModel: {
        exists: Book ? true : false,
        modelName: Book.modelName
      }
    };

    // Test database query
    try {
      const totalBooks = await Book.countDocuments();
      const availableBooks = await Book.countDocuments({ 
        isAvailable: true,
        quantity: { $gt: 0 }
      });
      
      diagnostics.database.totalBooks = totalBooks;
      diagnostics.database.availableBooks = availableBooks;
      
      // Get sample book
      const sampleBook = await Book.findOne();
      diagnostics.database.sampleBook = sampleBook ? {
        id: sampleBook._id,
        bookId: sampleBook.bookId,
        title: sampleBook.title,
        isAvailable: sampleBook.isAvailable,
        quantity: sampleBook.quantity
      } : null;
      
    } catch (dbError) {
      diagnostics.database.error = dbError.message;
    }

    res.json({
      success: true,
      diagnostics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete Book (Admin)
// ===============================
router.delete("/admin/delete/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    
    console.log(`🗑️ Deleting book with Book ID: ${bookId}`);
    
    const deletedBook = await Book.findOneAndDelete({ bookId: bookId });
    
    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }
    
    console.log(`✅ Book deleted: ${deletedBook.title}`);
    
    res.json({
      success: true,
      message: "Book deleted successfully",
      book: deletedBook
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message
    });
  }
});

export default router;
