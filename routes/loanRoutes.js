const express = require('express');
const c = require('../controllers/loanController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/').get(c.getLoans).post(c.createLoan);
// declared before '/:id' so "member" is not treated as an id
router.get('/member/:memberId', validateObjectId('memberId'), c.getLoansByMember);
router.put('/:id/return', validateObjectId('id'), c.returnLoan);
router.get('/:id', validateObjectId('id'), c.getLoanById);

module.exports = router;
