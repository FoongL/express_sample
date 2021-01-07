const express = require('express');
const wrap = require('amk-wrap');

const router = express.Router();

module.exports = (controller, auth) => {
  router.use(auth);

  router.post('/deposit', wrap(controller.deposit.bind(controller)));
  router.post('/withdraw', wrap(controller.withdraw.bind(controller)));
  router.post('/transfer', wrap(controller.transfer.bind(controller)));

  return router;
};
