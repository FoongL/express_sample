exports.up = function (knex) {
  return knex.schema
    .createTable('account', (table) => {
      table.increments('account_number').unique().primary();
      table.string('f_name').notNull();
      table.string('l_name').notNull();
      table.decimal('balance', 8, 2).defaultTo(0);
      table.string('pin');
      table.boolean('is_admin').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('transactions', (table) => {
      table.increments('id').unique().primary();
      table.integer('account_id').unsigned();
      table.enu('type',['DEPOSIT','WITHDRAW','TRANSFER','FIX']);
      table.decimal('amount', 8, 2);
      table.enu('status', ['SUCCESSFUL', 'FAILED', 'FIXED']);
      table.integer('receiver_account_id').unsigned();
      table.integer('target_transaction').unsigned();
      table.string('description');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('account').dropTable('transactions');
};
