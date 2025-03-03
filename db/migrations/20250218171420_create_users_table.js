/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary()
        table.string('name').nullable()
        table.string('mobile_number').unique()
        table.string('password')
        table.date('date_of_birth').nullable()
        table.enum('gender', ['male', 'female', 'other']).nullable()
        table.string('thana').nullable()
        table.timestamps(true, true)
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('users')
}
