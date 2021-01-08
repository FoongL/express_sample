// Update with your config settings.
require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost' || 'postgres',
      database: process.env.DB_NAME || 'crypto',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_NAMEPROD,
      user: process.env.DB_USERPROD,
      password: process.env.DB_PASSWORDPROD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
