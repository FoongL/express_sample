const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('../src/lib/bcrypt');
const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);
let account_number;
let admin_account;
const pin = 'tester';
const transactions = [];
let Withdraw_transaction;
let deposit_transaction;

describe('Testing Admin Router', () => {
  beforeAll(async (done) => {
    // Set up users for test transactions
    const hash = await bcrypt.hashPassword(pin);
    account_number = await knex
      .insert({
        f_name: 'test',
        l_name: 'account',
        pin: hash,
        balance: 500,
      })
      .into('account')
      .returning(['account_number']);
    account_number = account_number[0].account_number;
    admin_account = await knex
      .insert({
        f_name: 'test',
        l_name: 'account',
        pin: hash,
        is_admin: true,
      })
      .into('account')
      .returning(['account_number']);
    admin_account = admin_account[0].account_number;
    deposit_transaction = await knex
      .insert({
        account_id: account_number,
        type: 'DEPOSIT',
        amount: 1000,
        status: 'SUCCESSFUL',
        description: 'Test set up deposit',
      })
      .into('transactions')
      .returning(['id']);
    deposit_transaction = deposit_transaction[0].id;
    withdraw_transaction = await knex
      .insert({
        account_id: account_number,
        type: 'WITHDRAW',
        amount: 1200,
        status: 'SUCCESSFUL',
        description: 'Test set up withdraw',
      })
      .into('transactions')
      .returning(['id']);
    withdraw_transaction = withdraw_transaction[0].id;
    transactions.push(deposit_transaction, withdraw_transaction);
    done();
  });

  afterAll(async (done) => {
    await knex('account').where({ account_number }).del();
    await knex('account').where({ account_number: admin_account }).del();
    await Promise.all(
      transactions.map(async (id) => {
        await knex('transactions').where({ id }).del();
      })
    );
    await knex.destroy();
    done();
  });

  describe('Viewing a users transaction History', () => {
    test('Failing Admin Authentication with wrong password', async () => {
      const response = await request(app)
        .get('/admin/history')
        .set('pin', 'wrong password')
        .set('account', admin_account);
      expect(response.statusCode).toBe(401);
    });

    test('Failing Admin Authentication with non admin account', async () => {
      const response = await request(app)
        .get('/admin/history')
        .set('pin', pin)
        .set('account', account_number);
      expect(response.statusCode).toBe(401);
    });

    test('Trying to view account that does not exist', async () => {
      const response = await request(app)
        .get('/admin/history?account=0')
        .set('pin', pin)
        .set('account', admin_account);
      expect(response.statusCode).toBe(400);
    });

    test('Trying to view invalid Date', async () => {
      const response = await request(app)
        .get(`/admin/history?start=13/13/2020&account=${account_number}`)
        .set('pin', pin)
        .set('account', admin_account);
      expect(response.statusCode).toBe(400);
    });

    test('Trying to view invalid transaction type', async () => {
      const response = await request(app)
        .get(`/admin/history?type=TEST&account=${account_number}`)
        .set('pin', pin)
        .set('account', admin_account);
      expect(response.statusCode).toBe(400);
    });

    test('Trying to view invalid status type', async () => {
      const response = await request(app)
        .get(`/admin/history?status=TEST&account=${account_number}`)
        .set('pin', pin)
        .set('account', admin_account);
      expect(response.statusCode).toBe(400);
    });
    test('View Users Transaction History (should be none)', async () => {
      const response = await request(app)
        .get(`/admin/history?account=${account_number}`)
        .set('pin', pin)
        .set('account', admin_account);
      expect(response.statusCode).toBe(200);
      expect(response.body.account).toEqual(String(account_number));
      expect(response.body).toHaveProperty('totalTransaction', 2); // the two set up in the before all
      expect(response.body.transactionHistory.length).toEqual(2); // the two set up in the before all
    });
  });

  describe('Fixing Withdraw or Deposit transaction', () => {
    test('Failing Admin Authentication with wrong password', async () => {
      const response = await request(app)
        .put('/admin/fix')
        .set('pin', 'wrong password')
        .set('account', admin_account)
        .send({
          transactionId: deposit_transaction,
          account: account_number,
          amount: 250,
        });
      expect(response.statusCode).toBe(401);
    });

    test('Trying to fix a withdraw that is over current balance', async () => {
      const response = await request(app)
        .put('/admin/fix')
        .set('pin', pin)
        .set('account', admin_account)
        .send({
          transactionId: withdraw_transaction,
          account: account_number,
          amount: 2000,
        });
      expect(response.statusCode).toBe(400);
    });

    test('Trying to fix a deposit that adjusts balance under 0', async () => {
      const response = await request(app)
        .put('/admin/fix')
        .set('pin', pin)
        .set('account', admin_account)
        .send({
          transactionId: deposit_transaction,
          account: account_number,
          amount: 0,
        });
      expect(response.statusCode).toBe(400);
    });

    test('Fix a withdraw Transaction', async () => {
      const response = await request(app)
        .put('/admin/fix')
        .set('pin', pin)
        .set('account', admin_account)
        .send({
          transactionId: withdraw_transaction,
          account: account_number,
          amount: 100,
        })
      transactions.push(response.body.transaction.id);
      expect(response.statusCode).toBe(200);
      expect(response.body.transaction).toHaveProperty('type','FIX')
      expect(response.body.transaction).toHaveProperty('status','SUCCESSFUL')
      expect(response.body.transaction).toHaveProperty('target_transaction', withdraw_transaction)
    });

    test('Trying to fix a fixed withdraw transaction', async () => {
        const response = await request(app)
          .put('/admin/fix')
          .set('pin', pin)
          .set('account', admin_account)
          .send({
            transactionId: withdraw_transaction,
            account: account_number,
            amount: 100,
          })
        expect(response.statusCode).toBe(400);
      });

      test('Fix a deposit Transaction', async () => {
        const response = await request(app)
          .put('/admin/fix')
          .set('pin', pin)
          .set('account', admin_account)
          .send({
            transactionId: deposit_transaction,
            account: account_number,
            amount: 999,
          })
        transactions.push(response.body.transaction.id);
        expect(response.statusCode).toBe(200);
        expect(response.body.transaction).toHaveProperty('type','FIX')
        expect(response.body.transaction).toHaveProperty('status','SUCCESSFUL')
        expect(response.body.transaction).toHaveProperty('target_transaction', deposit_transaction)
      });

      test('Trying to fix a fixed deposit transaction', async () => {
        const response = await request(app)
          .put('/admin/fix')
          .set('pin', pin)
          .set('account', admin_account)
          .send({
            transactionId: deposit_transaction,
            account: account_number,
            amount: 999,
          })
        expect(response.statusCode).toBe(400);
      });
  });
});
