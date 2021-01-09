const express = require('express');
const wrap = require('amk-wrap');

const router = express.Router();

module.exports = (controller, auth) => {
  router.post('/create', wrap(controller.create.bind(controller)));
  router.use(auth); // Need Auth for bottom two routes
  router.get('/history', wrap(controller.history.bind(controller)));
  router.get('/balance', wrap(controller.balance.bind(controller)));
  return router;
};
