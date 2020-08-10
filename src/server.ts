import express, { json } from 'express';
import cors from "cors";
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json()); // Express por padrão não entende JSON, assim se utiliza esse método para que ele faça a conversão para json a cada requisição

// Méthods
// Get    -> Buscar ou listar uam informação;
// Post   -> Criar alguma nova informação;
// Put    -> Atualizar uma informação existente;
// Delete -> Deletar uma informação existente;

// Corpo (Request Body(request.body)): Dados para criação ou atualização de um registro
// Route Params(request.route): Identificar qual recurso queremos atualizar ou deletar
// Query Params(request.query): Paginação, filtros, ordenação
app.use(routes);

// exemplo -> localhost:3333
app.listen(3333); // função que 'ouvi'(requisições) um endereço http. 3333(1º parâmetro(porta))