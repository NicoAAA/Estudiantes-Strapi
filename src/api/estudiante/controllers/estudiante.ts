/**
 * estudiante controller
 */
import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::estudiante.estudiante', ({ strapi }) => ({
  async cursosInscrito(ctx: Context) {
    const { id } = ctx.params;
    try {
      // Consulta las matriculas donde el estudiante está inscrito, haciendo populate del curso.
      const matriculas = await strapi.db.query('api::matricula.matricula').findMany({
        where: {
          fk_idEstudiante: { id: parseInt(id, 10) }
        },
        populate: ['fk_id_curso']
      });
      
      // Extrae la información del curso de cada matrícula.
      const cursos = matriculas.map(matricula => matricula.fk_id_curso);
      
      ctx.body = { estudianteID: id, cursos };
    } catch (error) {
      ctx.throw(500, 'Error al consultar los cursos en los que está matriculado el estudiante');
    }
  }
}));
