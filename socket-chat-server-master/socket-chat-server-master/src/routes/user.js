var express = require('express');
var router = express.Router();

const { signin, login, getLogin, logout, getUserInfo } = require('../controllers/user')

router.post('/signin', signin);
router.post('/login', login)
router.get('/getlogin', getLogin)
router.get('/logout', logout)
router.get('/get_user_info', getUserInfo)

module.exports = router;