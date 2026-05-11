import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

// ===============================
// Get All Books (Admin)
// ===============================
router.get("/admin/all", async (req, res) => {
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
    console.log("📖 Books data:", JSON.stringify(books, null, 2));
    
    const mappedBooks = books.map(book => ({
      id: book._id,
      bookId: book.bookId,
      title: book.title,
      description: book.description,
      price: book.price,
      imageUrl: book.imageUrl,
      category: book.category,
      classLevel: book.classLevel,
      author: book.author,
      pages: book.pages,
      language: book.language
    }));
    
    console.log("🔄 Mapped books:", JSON.stringify(mappedBooks, null, 2));
    
    res.json({
      success: true,
      books: mappedBooks
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
router.post("/admin/add", async (req, res) => {
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
      language
    } = req.body;

    // Validate required fields
    if (!bookId || !title || !description || !price || !imageUrl || !category || !classLevel || !author || !pages) {
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

    const book = new Book({
      bookId: bookId.trim(),
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      imageUrl: imageUrl.trim(),
      quantity: Number(quantity) || 0,
      category: category.trim(),
      classLevel: classLevel.trim(),
      author: author.trim(),
      pages: Number(pages),
      language: language?.trim() || "English"
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
        imageUrl: book.imageUrl,
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
router.put("/admin/update-quantity/:bookId", async (req, res) => {
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
// Update Book Availability (Admin)
// ===============================
router.put("/admin/toggle-availability/:bookId", async (req, res) => {
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
// Update Book Details (Admin)
// ===============================
router.put("/admin/update/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const updateData = req.body;

    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'price', 'imageUrl', 'quantity', 'category', 'classLevel', 'author', 'pages', 'language'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'price' || field === 'quantity' || field === 'pages') {
          book[field] = Number(updateData[field]);
        } else {
          book[field] = updateData[field].trim();
        }
      }
    }

    await book.save();

    res.json({
      success: true,
      message: "Book updated successfully",
      book: {
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
        language: book.language
      }
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
// Delete Book (Admin)
// ===============================
router.delete("/admin/delete/:bookId", async (req, res) => {
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
router.post("/internal/decrease-quantity/:bookId", async (req, res) => {
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
    await book.save();

    res.json({
      success: true,
      message: "Book quantity decreased successfully",
      remainingQuantity: book.quantity,
      isAvailable: book.isAvailable
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

export default router;
