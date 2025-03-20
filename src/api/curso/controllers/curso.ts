/**
 * curso controller
 */

import { factories } from '@strapi/strapi'
import {Context} from 'koa';

export default factories.createCoreController('api::curso.curso', ({ strapi }) => ({
    async countMatriculados(ctx: Context){
        const { id } = ctx.params;

        try {
            const enrolledCount = await strapi.db.query('api::matricula.matricula').count({
                where: {
                    fk_id_curso: { id: parseInt(id, 10) }
                }
            });
            // Mensaje 
            const message =
                enrolledCount === 0
                ?'Aun no hay estudiantes matriculados'
                : `El curso tiene ${enrolledCount} estudiantes matriculados`;
            ctx.body = { courseID: id, enrolledCount, message}; // Respuesta en formato Json
        } catch (error){
            ctx.throw(500,  'Error al consultar las matriculas del curso')
        } 
    },
    async listaEstudiantes(ctx: Context) {
        const { id } = ctx.params;
        try {
          // Consulta las matriculas asociadas al curso y se hace populate del estudiante
          const matriculas = await strapi.db.query('api::matricula.matricula').findMany({
            where: {
              fk_id_curso: { id: parseInt(id, 10) }
            },
            populate: ['fk_idEstudiante']
          });
    
          // Extraemos la información de cada estudiante
          const estudiantes = matriculas.map(matricula => matricula.fk_idEstudiante);
    
          // Respuesta con el id del curso y la lista de estudiantes
          ctx.body = { courseID: id, estudiantes };
        } catch (error) {
          ctx.throw(500, 'Error al consultar la lista de estudiantes matriculados');
        }
    }
}));


