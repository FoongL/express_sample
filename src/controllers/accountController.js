// Importing required modules / files
const gpc = require('generate-pincode');
const error = require('../lib/error');
const bcrypt = require('../lib/bcrypt');
const {
  dateCheck,
  queryBuilder,
} = require('../services/accountHistoryService');

class AccountController {
  constructor(knex) {
    this.knex = knex;
  }

  async create(req, res) {
    const { fName: f_name, lName: l_name } = req.body;
    // Data Param Checker
    if (!f_name || !l_name) {
      throw error.MissingParamError('First name or Last name');
    }
    // random Pin generation and hashing for DB storage
    const pin = gpc(4);
    const hash = await bcrypt.hashPassword(pin);

    // Creating account onto DB
    const accountDetails = await this.knex
      .insert({
        f_name: f_name.trim().toLowerCase(),
        l_name: l_name.trim().toLowerCase(),
        pin: hash,
      })
      .into('account')
      .returning(['account_number as account', 'f_name as fName', 'l_name as lName', 'balance']);

    return res
      .status(200)
      .json({ accountDetails: { ...accountDetails[0], pin } });
  }

  async history(req, res) {
    const { account } = req.body;
    const {
      start = new Date('1/1/1900'), // Earlier than any date in system
      end = new Date(), // no transactions can be recorded after today (yet)
      type,
      status,
    } = req.query;
    // Data Param Checker
    dateCheck(start, end, error);

    // Building Query
    const query = queryBuilder(account, type, status, error);

    // Fetch Required Data
    const history = await this.knex
      .from('transactions')
      .select('*')
      .where(query)
      .orWhere({ receiver_account_id: account })
      .whereBetween('created_at', [new Date(start), new Date(end)])
      .orderBy('created_at', 'desc');
    return res
      .status(200)
      .json({ transactionHistory: history, totalTransaction: history.length });
  }

  async balance(req, res) {
    const { account } = req.body;
    // Fetching Required Data
    let balance = await this.knex
      .from('account')
      .select('balance')
      .where({ account_number: account });
    // Formatting output
    balance = balance[0].balance;
    return res.status(200).json({ account, balance });
  }
}

module.exports = AccountController;
