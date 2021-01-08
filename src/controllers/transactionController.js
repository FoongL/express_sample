const error = require('../lib/error');
const {
  deposit,
  withDepOutput,
  amountCheck,
  fundCheck,
  withdraw,
  accountCheck,
  transfer,
  transferOutput
} = require('../services/transactionService');
const { cleanObj } = require('../services/helper');

class TransactionController {
  constructor(knex) {
    this.knex = knex;
  }

  async deposit(req, res) {
    const { account, amount, description = 'none' } = req.body;
    // Check params
    amountCheck(amount, error);
    // Start Transaction
    const output = {};
    try {
      await this.knex.transaction(async (trx) => {
        // create new transaction Record
        const transObject = deposit(account, amount, 'SUCCESSFUL', description);
        output.transaction = await this.knex('transactions')
          .insert(transObject)
          .returning(withDepOutput())
          .transacting(trx);
        // Update Account Balance
        output.newBalance = await this.knex('account')
          .increment({ balance: amount })
          .update({ updated_at: new Date() })
          .where({ account_number: account })
          .returning('balance')
          .transacting(trx);
      });
    } catch (err) {
      const transObject = deposit(account, amount, 'FAIL', description);
      await this.knex('transactions').insert(transObject);
      throw error.TransactionError('Deposit');
    }
    cleanObj(output);
    return res.status(200).json({ ...output });
  }

  async withdraw(req, res) {
    const { account, amount, description = 'none' } = req.body;
    // Check params
    amountCheck(amount, error);
    await fundCheck(this.knex, amount, account, error);

    // Start Transaction
    const output = {};
    try {
      await this.knex.transaction(async (trx) => {
        // create new transaction Record
        const transObject = withdraw(
          account,
          amount,
          'SUCCESSFUL',
          description
        );
        output.transaction = await this.knex('transactions')
          .insert(transObject)
          .returning(withDepOutput())
          .transacting(trx);
        // Update Account Balance
        output.newBalance = await this.knex('account')
          .decrement({ balance: amount })
          .update({ updated_at: new Date() })
          .where({ account_number: account })
          .returning('balance')
          .transacting(trx);
      });
    } catch (err) {
      const transObject = withdraw(account, amount, 'FAIL', description);
      await this.knex('transactions').insert(transObject);
      throw error.TransactionError('Withdraw');
    }
    cleanObj(output);
    return res.status(200).json({ ...output });
  }

  async transfer(req, res) {
    const { account, amount, description = 'none', transferTo } = req.body;
    // Check params
    amountCheck(amount, error);
    await fundCheck(this.knex, amount, account, error);
    await accountCheck(this.knex, account, transferTo, error);

    // Start Transaction
    const output = {};
    try {
      await this.knex.transaction(async (trx) => {
        // create new transaction Record
        const transObject = transfer(
          account,
          amount,
          'SUCCESSFUL',
          transferTo,
          description
        );
        output.transaction = await this.knex('transactions')
          .insert(transObject)
          .returning(transferOutput())
          .transacting(trx);
        // Update Account Balance of sender
        await this.knex('account')
          .decrement({ balance: amount })
          .update({ updated_at: new Date() })
          .where({ account_number: account })
          .transacting(trx);
        // Update Account of receiver
        await this.knex('account')
          .increment({ balance: amount })
          .update({ updated_at: new Date() })
          .where({ account_number: transferTo })
          .transacting(trx);
      });
    } catch (err) {
      const transObject = withdraw(account, amount, 'FAIL', description);
      await this.knex('transactions').insert(transObject);
      throw error.TransactionError('Transfer');
    }
    cleanObj(output);
    return res.status(200).json({ ...output });
  }
}

module.exports = TransactionController;
