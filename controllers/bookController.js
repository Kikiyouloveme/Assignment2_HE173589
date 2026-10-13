const Book = require('../models/Book');

// GET /api/books
exports.getBooks = async (req, res) => {
  const books = await Book.find();
  res.status(200).json(books);
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.status(200).json(book);
};

// POST /api/books
exports.createBook = async (req, res) => {
  const { title, author, category, isbn, publishedYear, totalCopies, availableCopies } = req.body;
  // availableCopies defaults to totalCopies for a brand new book
  const available = availableCopies !== undefined ? availableCopies : totalCopies;
  if (totalCopies !== undefined && available > totalCopies) {
    return res.status(400).json({ message: 'availableCopies cannot exceed totalCopies' });
  }
  const book = await Book.create({
    title, author, category, isbn, publishedYear, totalCopies, availableCopies: available,
  });
  res.status(201).json(book);
};

// PUT /api/books/:id
exports.updateBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const fields = ['title', 'author', 'category', 'isbn', 'publishedYear', 'totalCopies', 'availableCopies'];
  for (const f of fields) {
    if (req.body[f] !== undefined) book[f] = req.body[f];
  }
  if (book.availableCopies > book.totalCopies) {
    return res.status(400).json({ message: 'availableCopies cannot exceed totalCopies' });
  }
  await book.save(); // runs validators (required, min 0, unique isbn)
  res.status(200).json(book);
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.status(200).json({ message: 'Book deleted successfully', book });
};
