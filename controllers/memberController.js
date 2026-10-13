const Member = require('../models/Member');

// GET /api/members
exports.getMembers = async (req, res) => {
  const members = await Member.find();
  res.status(200).json(members);
};

// GET /api/members/:id
exports.getMemberById = async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.status(200).json(member);
};

// POST /api/members
exports.createMember = async (req, res) => {
  const { fullName, email, phone, membershipType, isActive } = req.body;
  const member = await Member.create({ fullName, email, phone, membershipType, isActive });
  res.status(201).json(member);
};

// PUT /api/members/:id
exports.updateMember = async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });

  for (const f of ['fullName', 'email', 'phone', 'membershipType', 'isActive']) {
    if (req.body[f] !== undefined) member[f] = req.body[f];
  }
  await member.save();
  res.status(200).json(member);
};

// DELETE /api/members/:id
exports.deleteMember = async (req, res) => {
  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.status(200).json({ message: 'Member deleted successfully', member });
};
