const express = require('express');
const LoginController = require('../controllers/LoginController');

const router = express.Router();

router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);
router.get('/logout', LoginController.logout);
router.get('/credito', LoginController.credito);
router.post('/loan-estimate', LoginController.loanEstimate);
router.post('/solicitar', LoginController.solicitar);
router.get('/solicitar', LoginController.solicitar);

module.exports = router;