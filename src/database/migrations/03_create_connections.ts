import Knex from "knex";

export async function up(Knex: Knex) {
    return Knex.schema.createTable('connections', table => {
        table.increments('id').primary();

        // relacionamento
        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE')

        table.timestamp('created_at')
            .defaultTo(Knex.raw('CURRENT_TIMESTAMP')) // BancoRelacional -> pega o horário que o contato foi salvo e armazena na 'created_at'
            .notNullable()
    });
}

export async function down(Knex: Knex) {
    return Knex.schema.dropTable('connections');
}