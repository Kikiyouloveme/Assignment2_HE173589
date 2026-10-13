const express = require('express');
const c = require('../controllers/bookController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/').get(c.getBooks).post(c.createBook);
router
  .route('/:id')
  .get(validateObjectId('id'), c.getBookById)
  .put(validateObjectId('id'), c.updateBook)
  .delete(validateObjectId('id'), c.deleteBook);

module.exports = router;
