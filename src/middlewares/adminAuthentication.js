const bcrypt = require('../lib/bcrypt');

const adminAuth = (knex) => async (req, res, next) => {
  try {
    const { pin, account } = req.headers;
    const hashedPin = await knex
      .from('account')
      .select('pin')
      .where({ account_number: account, is_admin: true });
    const pinCheck = await bcrypt.checkPassword(pin, hashedPin[0].pin);
    if (!pinCheck) {
        res.status(401).send();
    }
    req.body.account = account
    next();
  } catch (err) {
    res.status(401).send();
  }
};

module.exports = adminAuth;
