const express = require('express');
const wrap = require('amk-wrap');

const router = express.Router();

module.exports = (controller, adminAuth) => {
  router.use(adminAuth);
  // router.post('/create', wrap(controller.create.bind(controller)));
  router.post('/test', wrap(controller.test.bind(controller)));
  return router;
};
