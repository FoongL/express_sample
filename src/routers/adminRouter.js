const express = require('express');
const wrap = require('amk-wrap');

const router = express.Router();

module.exports = (controller, adminAuth) => {
  router.use(adminAuth);
  router.get('/history', wrap(controller.history.bind(controller)));
  router.post('/create', wrap(controller.create.bind(controller)));
  router.put('/fix', wrap(controller.fix.bind(controller)));
  router.put('/resetPin', wrap(controller.resetPin.bind(controller)));
  return router;
};
