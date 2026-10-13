// Import books.json, members.json, loans.json into Lab2_LibraryExam.
// Usage: npm run seed
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');

const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const [Model, file] of [[Book, 'books.json'], [Member, 'members.json'], [Loan, 'loans.json']]) {
      const docs = read(file);
      await Model.deleteMany({});
      await Model.collection.insertMany(
        docs.map((d) => ({
          ...d,
          _id: new mongoose.Types.ObjectId(d._id),
          ...(d.member_id && { member_id: new mongoose.Types.ObjectId(d.member_id) }),
          ...(d.items && {
            items: d.items.map((i) => ({ ...i, book_id: new mongoose.Types.ObjectId(i.book_id) })),
          }),
          ...(d.borrowDate && { borrowDate: new Date(d.borrowDate) }),
          ...(d.dueDate && { dueDate: new Date(d.dueDate) }),
          ...(d.returnDate && { returnDate: new Date(d.returnDate) }),
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        }))
      );
      console.log(`Imported ${docs.length} documents into ${Model.collection.name}`);
    }
    await Book.syncIndexes();
    await Member.syncIndexes();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
