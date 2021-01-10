// Importing required files and modules
const error = require('../lib/error');
const bcrypt = require('../lib/bcrypt');
const gpc = require('generate-pincode');
const {
  accountCheck,
  transactionCheck,
  amountCheck,
  fundCheck,
  fix,
} = require('../services/transactionService');
const {
  dateCheck,
  queryBuilder,
} = require('../services/accountHistoryService');
const { cleanObj } = require('../services/helper');

class AdminController {
  constructor(knex) {
    this.knex = knex;
  }

  async createAdmin(req, res) {
    const { fName: f_name, lName: l_name, pin } = req.body;

    // Data Param Checker
    if (!f_name || !l_name || !pin) {
      throw error.MissingParamError('First name, Last name or pin');
    }

    // Hashing pin for db storage
    const hash = await bcrypt.hashPassword(pin);

    // Creating account onto DB
    const accountDetails = await this.knex
      .insert({
        f_name: f_name.trim().toLowerCase(),
        l_name: l_name.trim().toLowerCase(),
        pin: hash,
        is_admin: true,
      })
      .into('account')
      .returning(['account_number', 'f_name as fName', 'l_name as lName', 'is_admin']);

    // formatting output data
    const output = { ...accountDetails[0], pin };
    return res.status(200).json({ accountDetails: output });
  }

  async history(req, res) {
    const {
      start = new Date('1/1/1900'), // Earlier than any date in system
      end = new Date(), // no transactions can be recorded after today (yet)
      type,
      status,
      account,
    } = req.query;

    // Data Param Checker
    dateCheck(start, end, error);
    await accountCheck(this.knex, '', account, error);

    // Query building
    const query = queryBuilder(account, type, status, error);

    //Fetching required data
    const history = await this.knex
      .from('transactions')
      .select('*')
      .where(query)
      .orWhere({ receiver_account_id: account })
      .whereBetween('created_at', [new Date(start), new Date(end)])
      .orderBy('created_at', 'desc');
    return res.status(200).json({
      transactionHistory: history,
      totalTransaction: history.length,
      account,
    });
  }

  async fix(req, res) {
    const { transactionId, account, amount } = req.body;

    // Data Param Checker
    const transaction = await transactionCheck(
      this.knex,
      transactionId,
      account,
      error
    );
    amountCheck(amount, error);

    const output = {};
    let difference;

    //CHecking Transaction TYpe
    if (transaction.type === 'WITHDRAW') {
      // Fixing WITHDRAW transaction
      // Checking if Transaction fix will pull account balance to the red
      difference = amount - transaction.amount;
      if (difference > 0) {
        await fundCheck(this.knex, difference, account, error);
      }
    } else {
      // Fixing DEPOSIT transaction
      // Checking if Transaction fix will pull account balance to the red
      difference = transaction.amount - amount;
      if (difference > 0) {
        await fundCheck(this.knex, difference, account, error);
      }
    }
    try {
      await this.knex.transaction(async (trx) => {
        // create new transaction Record
        const fixObject = fix(
          account,
          amount,
          'SUCCESSFUL',
          `Fixing Transaction ${transactionId}`,
          transactionId
        );
        output.transaction = await this.knex('transactions')
          .insert(fixObject)
          .returning('*')
          .transacting(trx);

        // Update Account Balance
        output.newBalance = await this.knex('account')
          .decrement({ balance: difference })
          .update({ updated_at: new Date() })
          .where({ account_number: account })
          .returning('balance')
          .transacting(trx);

        // updating old transaction status
        const test = await this.knex
          .from('transactions')
          .select('*')
          .where({ id: transactionId });
        await this.knex('transactions')
          .update({ status: 'FIXED', updated_at: new Date() })
          .where({ id: transactionId })
          .transacting(trx);
      });
    } catch (err) {
      const fixObject = fix(
        account,
        amount,
        'FAILED',
        `Failed to fix Transaction ${transactionId}`,
        transactionId
      );
      await this.knex('transactions').insert(fixObject);
      throw error.TransactionError('fix');
    }

    cleanObj(output);
    return res.status(200).json({ ...output, adjustedAmount: -difference });
  }

  async resetPin(req, res) {
    const { account, pin = gpc(4) } = req.body;
    // Data Param Checker
    await accountCheck(this.knex, '', account, error);

    // Hashing pin for db storage
    const hash = await bcrypt.hashPassword(pin);

    // Updating user record in DB
    const updatedUser = await this.knex('account')
      .update({ pin: hash })
      .where({ account_number: account })
      .returning(['account_number as account', 'f_name as fName', 'l_name as lName']);
    return res.status(200).json({ accountDetails: { ...updatedUser[0], pin } });
  }
}

module.exports = AdminController;
