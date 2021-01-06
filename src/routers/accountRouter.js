const express = require('express');
const wrap = require('amk-wrap')

const router = express.Router();

module.exports = (controller, auth) => {
  

  router.post('/create', wrap(controller.create.bind(controller)));
  // router.use(auth)
  // router.post('/test', wrap(controller.test.bind(controller)));

  return router;
};
    