
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    // .primary() sets the id column as the "primary key," which means it's unique and non-nullable,
    // as well as indicating that this is "the main way to find things in this table."
    table.increments('id').primary();
    // username is also unique and non-nullable, so we could use it as the primary key.
    // however, it's useful to have an id column so that tables with foreign keys into this one
    // don't need space-intensive text columns all over the place.
    table.string('username').index().unique().notNullable();
    table.string('password').notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
