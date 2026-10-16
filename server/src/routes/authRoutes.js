const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getStaffList, addStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/staff', protect, authorize('Owner', 'Super Admin', 'Store Manager'), getStaffList);
router.post('/staff', protect, authorize('Owner', 'Super Admin'), addStaff);

module.exports = router;
