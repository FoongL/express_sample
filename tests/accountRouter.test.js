const request = require('supertest');
const app = require('../src/app');
const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);
let account_number;
let pin;

describe('Testing Account Router', () => {
  afterAll(async (done) => {
    await knex('account').where({ account_number }).del();
    await knex.destroy();
    done();
  });
  describe('Creating Account', () => {
    test('Creating User with only First Name (should error)', async () => {
      const response = await request(app)
        .post('/account/create')
        .send({ fName: 'test' });
      expect(response.statusCode).toBe(400);
    });

    test('Creating User with only Last Name (should error)', async () => {
      const response = await request(app)
        .post('/account/create')
        .send({ lName: 'test' });
      expect(response.statusCode).toBe(400);
    });

    test('Creating User with correct params', async () => {
      const response = await request(app)
        .post('/account/create')
        .send({ fName: 'test', lName: 'test' });
      account_number = response.body.accountDetails.account;
      pin = response.body.accountDetails.pin;
      expect(response.statusCode).toBe(200);
      expect(response.body.accountDetails).toHaveProperty('f_name', 'test');
      expect(response.body.accountDetails).toHaveProperty('l_name', 'test');
      expect(response.body.accountDetails).toHaveProperty('balance', '0.00');
      expect(response.body.accountDetails).toHaveProperty('pin');
    });
  });

  describe('Checking transaction History of Test User', () => {
    test('Failing Pin Authentication', async () => {
      const response = await request(app)
        .get('/account/history')
        .set('pin', 'wrong password')
        .set('account', account_number)
        .send({ fName: 'test', lName: 'test' });
      expect(response.statusCode).toBe(401);
    });

    test('Getting user transaction back (expecting 0 records)', async () => {
      const response = await request(app)
        .get('/account/history')
        .set('pin', pin)
        .set('account', account_number)
        .send({ fName: 'test', lName: 'test' });
      expect(response.statusCode).toBe(200);
      expect(response.body.transactionHistory.length).toEqual(0);
      expect(response.body.totalTransaction).toEqual(0);
    });

    test('Getting user transaction back with unregistered transaction type', async () => {
      const response = await request(app)
        .get('/account/history?type=unknown')
        .set('pin', pin)
        .set('account', account_number)
        .send({ fName: 'test', lName: 'test' });
      expect(response.statusCode).toBe(400);
    });

    test('Getting user transaction back with invalid Date', async () => {
      const response = await request(app)
        .get('/account/history?start=13/13/2020')
        .set('pin', pin)
        .set('account', account_number)
        .send({ fName: 'test', lName: 'test' });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Checking Balance of Test User', () => {
    test('Failing Pin Authentication', async () => {
      const response = await request(app)
        .get('/account/balance')
        .set('pin', 'wrong password')
        .set('account', account_number)
        .send({ fName: 'test', lName: 'test' });
      expect(response.statusCode).toBe(401);
    });

    test('Getting user Balance back (expecting to be 0)', async () => {
      const response = await request(app)
        .get('/account/balance')
        .set('pin', pin)
        .set('account', account_number)
        .send({ fName: 'test', lName: 'test' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('account', String(account_number));
      expect(response.body).toHaveProperty('balance', '0.00');
    });
  });
});
