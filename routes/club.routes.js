const express = require('express');
const clubController = require('../controllers/club.controller');

const router = express.Router();

// routes
router.post('/create', clubController.createClub);

router.get('/:id', clubController.getClub);
router.patch('/:id', clubController.updateClub);
router.delete('/:id', clubController.deleteClub);

router.post('/:id/members/create', clubController.addMember);
router.patch('/:id/members/:memberId', clubController.updateMember);
router.delete('/:id/members/:memberId', clubController.removeMember);

module.exports = router;
