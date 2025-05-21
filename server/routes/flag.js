const express = require('express');
const router = express.Router();

// 관리자 인증 미들웨어
function adminOnly(req, res, next) {
  if (req.headers['x-admin-token'] === process.env.ADMIN_TOKEN) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
}

router.get('/get_flag', adminOnly, (req, res) => {
  res.json({ flag: process.env.FLAG || 'flag{XSS_1s_Fun}' });
});

module.exports = router; 