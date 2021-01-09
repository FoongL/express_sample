// build out deposit query for knex
const deposit = (account, amount, status, description) => {
  return (output = {
    account_id: account,
    type: 'DEPOSIT',
    amount,
    status,
    description,
  });
};

// return outputs from knex wanted for deposit and withdraw transactions
const withDepOutput = [
  'id as transaction_id',
  'type',
  'account_id as account',
  'status',
  'description',
];

// Used to ensure amount passed in is in a valid format for processing
const amountCheck = (amount, error) => {
  if (!amount || isNaN(amount)) {
    throw error.MissingParamError('Valid  amount');
  }
  if (amount <= 0) {
    throw error.GeneralError('Cannot transact with negative amount.');
  }
  return true;
};

// Used to ensure sufficient funds are in given account to conduct needed transactions
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

// Create Withdraw query for knex
const withdraw = (account, amount, status, description) => {
  return (output = {
    account_id: account,
    type: 'WITHDRAW',
    amount,
    status,
    description,
  });
};

//CHecking if account exists (and does not belong to sender) for transactions processes
const accountCheck = async (knex, account, transferTo, error) => {
  if (Number(account) === Number(transferTo) || !transferTo) {
    throw error.GeneralError('Unable to transfer to given account');
  }
  const receiverAccount = await knex('account')
    .select('account_number')
    .where({ account_number: transferTo });
  if (receiverAccount.length === 0) {
    throw error.NotFoundError('Receiver account');
  }
  return true;
};

// Builds out transfer queries for knex queries
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

// transfer transaction output
const transferOutput = [
  'id as transaction_id',
  'type',
  'account_id as sender',
  'amount',
  'receiver_account_id as receiver',
  'status',
  'description',
];

// Transaction checking to ensure things work before Fixing a transaction (admin process only)
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
  transaction = transaction[0];
  if (!['DEPOSIT', 'WITHDRAW'].includes(transaction.type)) {
    throw error.GeneralError(
      'Only able to fix deposits or withdraw transactions'
    );
  }
  if (['FAILED', 'FIXED'].includes(transaction.status)) {
    throw error.GeneralError('Only able to fix successful transactions');
  }
  return transaction;
};

// building out fix transaction query for knex
const fix = (account, amount, status, description, transactionId) => {
  return (output = {
    account_id: account,
    type: 'FIX',
    amount,
    status,
    description,
    target_transaction: transactionId,
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
