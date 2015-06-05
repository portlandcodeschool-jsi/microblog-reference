module.exports = {
  client: 'postgresql',
  connection: {
    database: 'microblog',
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
