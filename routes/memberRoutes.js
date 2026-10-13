const express = require('express');
const c = require('../controllers/memberController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/').get(c.getMembers).post(c.createMember);
router
  .route('/:id')
  .get(validateObjectId('id'), c.getMemberById)
  .put(validateObjectId('id'), c.updateMember)
  .delete(validateObjectId('id'), c.deleteMember);

module.exports = router;
