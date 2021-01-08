const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('../src/lib/bcrypt');
const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);
let account_number;
let account_number_two;
const pin = 'tester';
const transactions = [];

describe('Testing Transaction Router', () => {
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
    account_number_two = await knex
      .insert({
        f_name: 'test',
        l_name: 'account',
        pin: hash,
        balance: 100,
      })
      .into('account')
      .returning(['account_number']);
    account_number_two = account_number_two[0].account_number;
    done();
  });

  afterAll(async (done) => {
    await knex('account').where({ account_number }).del();
    await knex('account').where({ account_number: account_number_two }).del();
    await Promise.all(
      transactions.map(async (id) => {
        await knex('transactions').where({ id }).del();
      })
    );
    await knex.destroy();
    done();
  });

  describe('Deposit Transactions', () => {
    test('Failing Authentication', async () => {
      const response = await request(app)
        .post('/transaction/deposit')
        .set('pin', 'wrong password')
        .set('account', account_number)
        .send({
          amount: 100,
          description: 'Test Deposit',
        });
      expect(response.statusCode).toBe(401);
    });

    test('Trying to deposit a negative amount', async () => {
      const response = await request(app)
        .post('/transaction/deposit')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: -100,
          description: 'Test Deposit',
        });
      expect(response.statusCode).toBe(400);
    });

    test('Successful Deposit', async () => {
      const response = await request(app)
        .post('/transaction/deposit')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: 100,
          description: 'Test Deposit',
        });
      transactions.push(response.body.transaction.transaction_id);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('newBalance', '600.00');
    });
  });

  describe('Withdraw Transactions', () => {
    test('Failing Authentication', async () => {
      const response = await request(app)
        .post('/transaction/withdraw')
        .set('pin', 'wrong password')
        .set('account', account_number)
        .send({
          amount: 100,
          description: 'Test Withdraw',
        });
      expect(response.statusCode).toBe(401);
    });

    test('Trying to withdraw a negative amount', async () => {
      const response = await request(app)
        .post('/transaction/withdraw')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: -100,
          description: 'Test Withdraw',
        });
      expect(response.statusCode).toBe(400);
    });

    test('Trying to over draw the account', async () => {
      const response = await request(app)
        .post('/transaction/withdraw')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: 9999,
          description: 'Test Withdraw',
        });
      expect(response.statusCode).toBe(400);
    });

    test('Successful Withdraw', async () => {
      const response = await request(app)
        .post('/transaction/withdraw')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: 100,
          description: 'Test Withdraw',
        });
      transactions.push(response.body.transaction.transaction_id);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('newBalance', '500.00');
    });
  });

  describe('Transfer Transactions', () => {
    test('Failing Authentication', async () => {
      const response = await request(app)
        .post('/transaction/transfer')
        .set('pin', 'wrong password')
        .set('account', account_number)
        .send({
          amount: 100,
          transferTo: account_number_two,
          description: 'Test Transfer',
        });
      expect(response.statusCode).toBe(401);
    });

    test('Trying to transfer a negative amount', async () => {
      const response = await request(app)
        .post('/transaction/transfer')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: -100,
          transferTo: account_number_two,
          description: 'Test Transfer',
        });
      expect(response.statusCode).toBe(400);
    });

    test('Trying to transfer more money than is in an account', async () => {
      const response = await request(app)
        .post('/transaction/transfer')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: 9999,
          transferTo: account_number_two,
          description: 'Test Transfer',
        });
      expect(response.statusCode).toBe(400);
    });

    test('Trying to transfer more money to yourself', async () => {
      const response = await request(app)
        .post('/transaction/transfer')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: 100,
          transferTo: account_number,
          description: 'Test Transfer',
        });
      expect(response.statusCode).toBe(400);
    });

    test('Trying to transfer more money to no one', async () => {
        const response = await request(app)
          .post('/transaction/transfer')
          .set('pin', pin)
          .set('account', account_number)
          .send({
            amount: 100,
            description: 'Test Transfer',
          });
        expect(response.statusCode).toBe(400);
      });

    test('Successful transfer', async () => {
      const response = await request(app)
        .post('/transaction/transfer')
        .set('pin', pin)
        .set('account', account_number)
        .send({
          amount: 100,
          transferTo: account_number_two,
          description: 'Test Transfer',
        });
      transactions.push(response.body.transaction.transaction_id);
      expect(response.statusCode).toBe(200);
      expect(response.body.transaction).toHaveProperty('sender', account_number);
      expect(response.body.transaction).toHaveProperty('receiver', account_number_two);
      expect(response.body.transaction).toHaveProperty('status', 'SUCCESSFUL');
    });
  });
});
