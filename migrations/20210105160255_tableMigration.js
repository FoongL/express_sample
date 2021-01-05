exports.up = function (knex) {
  return knex.schema
    .createTable('account', (table) => {
      table.increments('id').unique().primary();
      table.string('f_name').notNull();
      table.string('l_name').notNull();
      table.string('id_number');
      table.date('dob');
      table.decimal('balance', 8, 2).defaultTo(0);
      table.string('pin');
      table.boolean('is_admin').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('transactions', (table) => {
      table.increments('id').unique().primary();
      table.integer('account_id').unsigned();
      table.string('type');
      table.decimal('amount', 8, 2);
      table.string('status');
      table.integer('receiver_account_id').unsigned();
      table.integer('target_transaction').unsigned();
      table.string('description');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {};
