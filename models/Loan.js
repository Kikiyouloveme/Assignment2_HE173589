const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'member_id is required'],
    },
    items: [
      {
        _id: false,
        book_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: [true, 'book_id is required'],
        },
        quantity: {
          type: Number,
          min: [1, 'quantity must be at least 1'],
          required: [true, 'quantity is required'],
        },
      },
    ],
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: [true, 'dueDate is required'] },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Borrowing', 'Returned', 'Overdue'],
      default: 'Borrowing',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', loanSchema, 'loans');
