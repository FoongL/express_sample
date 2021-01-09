const express = require('express');
const cors = require('cors');

// Importing db config files
const knex = require('../db/db');

// Importing Utils
const errorHandler = require('./util/errorHandler');

// Importing middlewares
const auth = require('./middlewares/pinAuthentication')(knex);
const adminAuth = require('./middlewares/adminAuthentication')(knex);

// Importing Routers
const AccountRouter = require('./routers/accountRouter');
const TransactionRouter = require('./routers/transactionRouter');
const AdminRouter = require('./routers/adminRouter');

// Importing Controllers
const AccountController = require('./controllers/accountController');
const TransactionController = require('./controllers/transactionController');
const AdminController = require('./controllers/adminController');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());


// Initialize Controllers
const accountController = new AccountController(knex);
const transactionController = new TransactionController(knex);
const adminController = new AdminController(knex);

// initialize Routers
app.use('/account', AccountRouter(accountController, auth));
app.use('/transaction', TransactionRouter(transactionController, auth));
app.use('/admin', AdminRouter(adminController, adminAuth));
app.use(errorHandler());

module.exports = app;
