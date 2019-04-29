const express = require('express');
const clubController = require('../controllers/club.controller');

const router = express.Router();

// routes
router.post('/create', clubController.create);
router.delete('/:id/delete', clubController.deleteClub);
router.post('/:id/addMember', clubController.addMember);
router.patch('/:id/acceptInvitation', clubController.acceptInvitation);
// router.patch('/:id/declineInvitation', clubController.declineInvitation);

module.exports = router;
