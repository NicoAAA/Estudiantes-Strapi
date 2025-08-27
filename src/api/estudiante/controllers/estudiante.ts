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

    // Extraer documento desde el body
    const { data: { n_Documento } = { n_Documento: null } } = ctx.request.body;
    if (!n_Documento) {
      return ctx.throw(400, "ERROR: El documento del estudiante es requerido en el body");
    }
  
    try {
      // Consulta las matriculas donde el estudiante está inscrito, haciendo populate del curso.
      const matriculas = await strapi.db.query('api::matricula.matricula').findMany({
        where: {
          fk_idEstudiante: { // El nombre del campo de relación en la matrícula
            n_Documento: n_Documento // El campo que se quiere buscar dentro del estudiante relacionado
          },
          publishedAt: { $notNull: true } // Asegura que la matrícula esté publicada
        },
        populate: ['fk_id_curso']
      });
      
      // Extrae la información del curso de cada matrícula.
      // Después de obtener las 'matriculas' de la base de datos...
      const cursosLimpios = matriculas.map(matricula => {
        // Verificamos que el curso exista para evitar errores
        if (!matricula.fk_id_curso) {
          return null;
        }
        
        return {
          nombre: matricula.fk_id_curso.Nombre_curso,
          descripcion: matricula.fk_id_curso.Descripcion,
          creditos: matricula.fk_id_curso.Creditos,
          duracion_de_curso: `(${matricula.fk_id_curso.Fecha_inicio} - ${matricula.fk_id_curso.Fecha_fin})`,
          periodoMatriculado: matricula.periodo,
          fechaMatricula: matricula.Fecha_matricula
        };
      }).filter(curso => curso !== null); // Filtramos por si algún curso fue null

      // Finalmente, envías solo el array limpio
      ctx.body = { cursos: cursosLimpios };
    } catch (error) {
      ctx.throw(500, 'Error al consultar los cursos en los que está matriculado el estudiante');
    }
  }
}));
