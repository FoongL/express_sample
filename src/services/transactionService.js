const deposit = (account, amount, status, description) => {
  return (output = {
    account_id: account,
    type: 'DEPOSIT',
    amount,
    status,
    description,
  });
};

const withDepOutput = () => {
  return (output = [
    'id as transaction_id',
    'type',
    'account_id as account',
    'status',
    'description',
  ]);
};

const amountCheck = (amount, error) => {
  if (!amount || isNaN(amount)) {
    throw error.MissingParamError('Valid  amount');
  }
  if (amount <= 0) {
    throw error.GeneralError('Cannot transact with negative amount.');
  }
  return true;
};

const fundCheck = async (knex, amount, account, error) => {
  let balance = await knex('account')
    .select('balance')
    .where({ account_number: account });
  balance = balance[0].balance;
  if (amount > balance) {
    throw error.InsufficientFundsError();
  }
  return true;
};

const withdraw = (account, amount, status, description) => {
  return (output = {
    account_id: account,
    type: 'WITHDRAW',
    amount,
    status,
    description,
  });
};

const accountCheck = async (knex, account, transferTo, error) => {
  if (account == transferTo || !transferTo) {
    throw error.GeneralError('Unable to locate account number in system');
  }
  const receiverAccount = await knex('account')
    .select('account_number')
    .where({ account_number: transferTo });
  if (receiverAccount.length === 0) {
    throw error.NotFoundError('Receiver account');
  }
  return true;
};

const transfer = (account, amount, status, transferTo, description) => {
  return (output = {
    account_id: account,
    type: 'TRANSFER',
    amount,
    status,
    description,
    receiver_account_id: transferTo,
  });
};

const transferOutput = () => {
  return (output = [
    'id as transaction_id',
    'type',
    'account_id as sender',
    'amount',
    'receiver_account_id as receiver',
    'status',
    'description',
  ]);
};

const transactionCheck = async (knex, transactionId, account, error) => {
  if (!transactionId || !account) {
    throw error.MissingParamError('Transaction ID or account Number');
  }
  let transaction = await knex
    .from('transactions')
    .select('*')
    .where({ id: transactionId, account_id: account });
  if (transaction.length === 0) {
    throw error.GeneralError('Unable to locate transaction in system');
  }
  transaction = transaction[0]
  if(!['DEPOSIT','WITHDRAW'].includes(transaction.type)){
    throw error.GeneralError('Only able to fix deposits or withdraw transactions');
  }
  if(['FAILED','FIXED'].includes(transaction.status)){
    throw error.GeneralError('Only able to fix successful transactions');
  }
  return transaction;
};

const fix = (account, amount, status, description, transactionId) => {
  return (output = {
    account_id: account,
    type: 'FIX',
    amount,
    status,
    description,
    target_transaction:transactionId
  });
};

module.exports = {
  deposit,
  withDepOutput,
  amountCheck,
  fundCheck,
  withdraw,
  accountCheck,
  transfer,
  transferOutput,
  transactionCheck,
  fix,
};
