/**
 * estudiante controller
 */
import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::estudiante.estudiante', ({ strapi }) => ({
  async cursosInscrito(ctx: Context) {

    console.log("Endpoint /api/estudiantes/cursosInscrito");

    // Validar existencia del token de autorización
    const token = ctx.request.headers.authorization?.split(" ")[1];
    if (!token) {
      return ctx.unauthorized("Token no incluido en la petición");
    }

    // Extraer documentId desde el body
    const { data: { documentId } = { documentId: null } } = ctx.request.body;
    if (!documentId) {
      return ctx.throw(400, "ERROR: El documentId del curso es requerido en el body");
    }
  
    try {
      // Consulta las matriculas donde el estudiante está inscrito, haciendo populate del curso.
      const matriculas = await strapi.db.query('api::matricula.matricula').findMany({
        where: {
          fk_idEstudiante: { documentId: documentId }
        },
        populate: ['fk_id_curso']
      });
      
      // Extrae la información del curso de cada matrícula.
      const cursos = matriculas.map(matricula => matricula.fk_id_curso);
      
      ctx.body = { estudianteID: matriculas, cursos };
    } catch (error) {
      ctx.throw(500, 'Error al consultar los cursos en los que está matriculado el estudiante');
    }
  }
}));
