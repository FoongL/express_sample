
const error = require('../lib/error');
const bcrypt = require('../lib/bcrypt');

class AdminController {
  constructor(knex) {
    this.knex = knex;
  }

//   async create(req, res) {
//     const { fName: f_name, lName: l_name, pin } = req.body;
//     // Data Param Checker
//     if (!f_name || !l_name) {
//       throw error.MissingParamError('First name or Last name');
//     }
//     // random Pin generation and hashing for DB storage
//     const hash = await bcrypt.hashPassword(pin);

//     // Creating account onto DB
//     const accountDetails = await this.knex
//       .insert({
//         f_name:f_name.trim().toLowerCase(),
//         l_name:l_name.trim().toLowerCase(),
//         pin: hash,
//       })
//       .into('account')
//       .returning(['account_number', 'f_name', 'l_name', 'balance']);

//     // formatting output data
//     const output = { ...accountDetails[0], pin };
//     return res.status(200).json({ accountDetails: output });
//   }

  async test (req,res){
      return res.status(200).json({ admitted: true });
  }
}

module.exports = AdminController;
