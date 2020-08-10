import { Request, Response } from "express";

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

export default class ClassController {
    // Listagem das aulas + filtragem
    async index(request: Request, response: Response) {
        const filters = request.query;

        // Tipando os parâmetros vindos da requisição
        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if (!filters.week_day || !filters.subject || !filters.time) {
            return response.status(400).json({
                error: 'Missing filters to search classes'
            })
        }

        const timeInMinutes = convertHourToMinutes(time); // tipando time dizendo que é uma string

        const classes = await db('classes')
            .whereExists(function() {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);

        return response.json(classes);
    }

    // Criando o usuário + matéria e relacionamento com usuário + horários com relacionamento com a matéria
    async  create(request: Request, response: Response) {
        // Fazendo destruturação, recebendo cada dado em uma variável
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;

        // trx -> abreviação de transaction, utilizado para que execute todas as queries de uma vez e caso de algum erro em alguma das queries(etapas), tudo será revertido!
        const trx = await db.transaction();

        // tente executar esse bloco de código
        try {
            // await -> Aguardando o retorno do banco de dados para assim continuar a leitura dos códigos
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio,
            });

            // Pegando o id do usuário inserido à cima, para o relacionamento na tabela a baixo
            const user_id = insertedUsersIds[0];

            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id
            });

            const class_id = insertedClassesIds[0];

            // map -> percorrendo o schedule que veio no body da requisição
            const class_schedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to)
                }
            });

            await trx('class_schedule').insert(class_schedule);

            // E aqui nesse momento ele insere tudo no banco de dados, caso não tenha ocorrido nenhum erro
            await trx.commit();

            return response.status(201).send();

        } catch (error) {
            // Então o que deu certo do bloco acima até chegar a um erro, será desfeito
            await trx.rollback();

            return response.status(400).json({
                error: 'unexpected error while creating new class'
            });
        }
    }
}