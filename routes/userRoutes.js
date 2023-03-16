const express = require('express');
const { userRegister, userLogin, verifyToken, getUser, refreshToken, userLogout, getAllRegisterdUser } = require('../controllers/userController');
const router = express.Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/auth/user', verifyToken, getUser);
router.get('/auth/refresh', refreshToken, verifyToken, getUser);
router.post('/logout', verifyToken, userLogout);
router.get('/allusers', getAllRegisterdUser)

module.exports = router;