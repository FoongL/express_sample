const express = require('express');
const pg = require('pg');
const cors = require('cors');
require('dotenv').config();

// Importing Utils
const errorHandler = require('./util/errorHandler');

// Importing Routers
const AccountRouter = require('./routers/accountRouter');
const TransactionRouter = require('./routers/transactionRouter');

// Importing Controllers
const AccountController = require('./controllers/accountController');
const TransactionController = require('./controllers/transactionController');

module.exports = () => {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json());

  //-------------- setting up database connection
  const knexConfig = require('../knexfile').development;
  const knex = require('knex')(knexConfig);
  //---- just so there is something too see when server is hosted
  app.get('/', (req, res) => {
    res.send("Welcome to Foong's Crypto Test");
  });

  // Initialize Controllers
  const accountController = new AccountController(knex);
  // const transactionController = new TransactionController(knex)

  // initialize Routers
  app.use('/account', AccountRouter(accountController));
  // app.use('/transaction', new TransactionRouter(transactionController).router());
  app.use(errorHandler());
  return app;
};
