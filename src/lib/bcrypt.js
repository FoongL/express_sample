const bcrypt = require('bcrypt');

hashPassword = async(plainTextPassword) => { 
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(plainTextPassword, salt)
    return hash
};

checkPassword = async(plainTextPassword, hashedPassword) => {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
};

module.exports = {
    hashPassword,
    checkPassword
  };
  