import knex from 'knex';

//módulo integrado dentro do node, para melhor caminhar dentro dos diretórios
import path from 'path';

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite'), // Criando um arquivo chamado database.sqlite, que guardará nossos dados
    },
    useNullAsDefault: true, // utilizar o null quando o banco de dados não souber o valor(atributo do sqlite)
});

export default db;