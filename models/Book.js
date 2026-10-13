const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'title is required'], trim: true },
    author: { type: String, required: [true, 'author is required'], trim: true },
    category: { type: String, required: [true, 'category is required'], trim: true },
    isbn: { type: String, required: [true, 'isbn is required'], unique: true, trim: true },
    publishedYear: { type: Number },
    totalCopies: { type: Number, min: [0, 'totalCopies must not be negative'] },
    availableCopies: { type: Number, min: [0, 'availableCopies must not be negative'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema, 'books');
