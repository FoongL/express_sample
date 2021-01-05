const gpc = require('generate-pincode');
const error = require('../lib/error');
const bcrypt = require('../lib/bcrypt');

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
        f_name,
        l_name,
        pin: hash,
      })
      .into('account')
      .returning(['id', 'f_name', 'l_name', 'balance']);

    // formatting output data
    const output = { ...accountDetails[0], pin };
    return res.status(200).json({ accountDetails: output });
  }

  async test (req,res){
      const{pw, hash} = req.body
      const checker = await bcrypt.checkPassword(pw, hash)
      return res.status(200).json({ checker });
  }
}

module.exports = AccountController;
