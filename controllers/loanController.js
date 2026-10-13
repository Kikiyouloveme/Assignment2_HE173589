const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Member = require('../models/Member');
const Book = require('../models/Book');

const DEFAULT_LOAN_DAYS = 14;

// populate(): member info + book info for each item, only the necessary fields
const populateLoan = (query) =>
  query
    .populate({ path: 'member_id', select: 'fullName email phone membershipType isActive' })
    .populate({ path: 'items.book_id', select: 'title author isbn category' });

// GET /api/loans
exports.getLoans = async (req, res) => {
  const loans = await populateLoan(Loan.find());
  res.status(200).json(loans);
};

// GET /api/loans/:id
exports.getLoanById = async (req, res) => {
  const loan = await populateLoan(Loan.findById(req.params.id));
  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  res.status(200).json(loan);
};

// GET /api/loans/member/:memberId
exports.getLoansByMember = async (req, res) => {
  const member = await Member.findById(req.params.memberId);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  const loans = await populateLoan(Loan.find({ member_id: req.params.memberId }));
  res.status(200).json(loans);
};

// POST /api/loans
// Body: { member_id, items: [{ book_id, quantity }], dueDate? }
exports.createLoan = async (req, res) => {
  const { member_id, items, dueDate } = req.body;

  // ---- validate incoming data ----
  if (!member_id || !mongoose.isValidObjectId(member_id)) {
    return res.status(400).json({ message: 'A valid member_id is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items must be a non-empty array' });
  }

  // merge duplicated books so the stock check is correct
  const wanted = new Map();
  for (const item of items) {
    if (!item || !mongoose.isValidObjectId(item.book_id)) {
      return res.status(400).json({ message: 'Every item needs a valid book_id' });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ message: 'quantity must be an integer >= 1' });
    }
    const key = String(item.book_id);
    wanted.set(key, (wanted.get(key) || 0) + item.quantity);
  }

  const borrowDate = new Date();
  let due;
  if (dueDate !== undefined) {
    due = new Date(dueDate);
    if (Number.isNaN(due.getTime()) || due <= borrowDate) {
      return res.status(400).json({ message: 'dueDate must be a valid future date' });
    }
  } else {
    due = new Date(borrowDate.getTime() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);
  }

  // ---- only active members may borrow ----
  const member = await Member.findById(member_id);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  if (!member.isActive) {
    return res.status(403).json({ message: 'Member is not active and cannot borrow books' });
  }

  // ---- every book must exist and have enough copies ----
  for (const [bookId, qty] of wanted) {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: `Book not found: ${bookId}` });
    if (book.availableCopies < qty) {
      return res.status(400).json({
        message: `Not enough copies of "${book.title}": requested ${qty}, available ${book.availableCopies}`,
      });
    }
  }

  // ---- decrease availableCopies (rolls back if one book fails) ----
  const decreased = [];
  try {
    for (const [bookId, qty] of wanted) {
      const updated = await Book.findOneAndUpdate(
        { _id: bookId, availableCopies: { $gte: qty } },
        { $inc: { availableCopies: -qty } }
      );
      if (!updated) {
        throw Object.assign(new Error(`Not enough copies available for book ${bookId}`), { status: 400 });
      }
      decreased.push([bookId, qty]);
    }

    const loan = await Loan.create({
      member_id,
      items: [...wanted].map(([book_id, quantity]) => ({ book_id, quantity })),
      borrowDate,
      dueDate: due,
    });
    const populated = await populateLoan(Loan.findById(loan._id));
    return res.status(201).json(populated);
  } catch (err) {
    for (const [bookId, qty] of decreased) {
      await Book.updateOne({ _id: bookId }, { $inc: { availableCopies: qty } });
    }
    if (err.status === 400) return res.status(400).json({ message: err.message });
    throw err;
  }
};

// PUT /api/loans/:id/return
exports.returnLoan = async (req, res) => {
  const existing = await Loan.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Loan not found' });
  if (existing.status === 'Returned') {
    return res.status(400).json({ message: 'This loan has already been returned' });
  }

  // Conditional update: only one concurrent request can flip the status to Returned
  const loan = await Loan.findOneAndUpdate(
    { _id: req.params.id, status: { $ne: 'Returned' } },
    { status: 'Returned', returnDate: new Date() },
    { returnDocument: 'after' }
  );
  if (!loan) return res.status(400).json({ message: 'This loan has already been returned' });

  // restore book quantities (never above totalCopies)
  for (const item of loan.items) {
    const book = await Book.findById(item.book_id);
    if (!book) continue; // book was deleted meanwhile
    const restored = Math.min(book.availableCopies + item.quantity, book.totalCopies ?? Infinity);
    await Book.updateOne({ _id: book._id }, { availableCopies: restored });
  }

  const populated = await populateLoan(Loan.findById(loan._id));
  res.status(200).json({ message: 'Book(s) returned successfully', loan: populated });
};
