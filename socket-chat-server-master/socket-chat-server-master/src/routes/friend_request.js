var express = require('express');
var router = express.Router();

const { addRequest, getRequestList } = require('../controllers/friend_request')

router.get('/get_friend_request_list', getRequestList);
router.get('/add_friend_request', addRequest);

module.exports = router;