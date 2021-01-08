const bcrypt = require('../lib/bcrypt');
const{AuthError}= require('../lib/error')

const auth = (knex) => async (req, res, next) => {
  try {
    const { pin, account } = req.headers;
    const hashedPin = await knex
      .from('account')
      .select('pin')
      .where({ account_number: account });
    const pinCheck = await bcrypt.checkPassword(pin, hashedPin[0].pin);
    if (!pinCheck) {
      return next(new AuthError());
    }
    req.body.account = account
    next();
  } catch (err) {
    res.status(401).send();
  }
};

module.exports = auth;
