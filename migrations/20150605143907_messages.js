
exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function(table) {
    table.increments('id').primary();
    table.string('body').notNullable();
    table.integer('user_id').references('id').inTable('users').notNullable();
    table.timestamp('posted_at').defaultTo(knex.raw("now()")).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};
