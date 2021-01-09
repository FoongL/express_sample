const express = require('express');
const cors = require('cors');

// setting up database connection
const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);

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

//---- just so there is something too see when server is hosted
app.get('/', (req, res) => {
  res.status(200).send("Welcome to Foong's Crypto Test");
});

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
