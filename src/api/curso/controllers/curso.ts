/**
 * curso controller
 */

import { factories } from '@strapi/strapi'
import {Context} from 'koa';

export default factories.createCoreController('api::curso.curso', ({ strapi }) => ({
    async countMatriculados(ctx: Context){
        console.log("Endpoint /api/cursos/countMatriculados");
        // Validar existencia del token de autorización
        const token = ctx.request.headers.authorization?.split(" ")[1];
        if (!token) {
          return ctx.unauthorized("Token no incluido en la petición");
        }

        const { data: { nombre_de_curso } = { nombre_de_curso: null } } = ctx.request.body;
        if (!nombre_de_curso) {
          return ctx.throw(400, "ERROR: El nombre del curso es requerido en el body");
        }
        

        try {
            const enrolledCount = await strapi.db.query('api::matricula.matricula').count({
                where: {
                    fk_id_curso: {  Nombre_curso: nombre_de_curso },
                    publishedAt: { $notNull: true }
                }
            });
            // Mensaje 
            const message =
                enrolledCount === 0
                ?'Aun no hay estudiantes matriculados'
                : `El curso tiene ${enrolledCount} estudiantes matriculados`;
            ctx.body = { courseID: nombre_de_curso, enrolledCount, message}; // Respuesta en formato Json
        } catch (error){
            ctx.throw(500,  'Error al consultar las matriculas del curso')
        } 
    },

    async listaEstudiantes(ctx: Context) {
    console.log("Endpoint /api/cursos/listaEstudiantes");

    const token = ctx.request.headers.authorization?.split(" ")[1];
    if (!token) {
      return ctx.unauthorized("Token no incluido en la petición");
    }

    const { data: { nombre_de_curso } = { nombre_de_curso: null } } = ctx.request.body;
    if (!nombre_de_curso) {
      return ctx.throw(400, "ERROR: El nombre del curso es requerido en el body");
    }

    try {
      const matriculas = await strapi.db.query('api::matricula.matricula').findMany({
        where: {
          fk_id_curso: { 
            Nombre_curso: nombre_de_curso // 👈 CORRECCIÓN 1
          },
          publishedAt: { $notNull: true }
        },
        populate: ['fk_idEstudiante']
      });

      const estudiantesLimpios = matriculas.map(matricula => {
        // Verificamos que los estudiantes existan para evitar errores
        if (!matricula.fk_idEstudiante) { // 👈 CORRECCIÓN 2 (y en las siguientes líneas)
          return null;
        }
        
        return {
          Documento: matricula.fk_idEstudiante.n_Documento,
          Nombre: `${matricula.fk_idEstudiante.Nombre} ${matricula.fk_idEstudiante.Apellido}`,
          Fecha_de_nacimiento: matricula.fk_idEstudiante.Fecha_nacimiento,
          Email: matricula.fk_idEstudiante.Email,
          Telefono: matricula.fk_idEstudiante.Telefono
        };
      }).filter(estudiante => estudiante !== null); // Filtramos por si algún estudiante fue null

      ctx.body = {
        Curso: nombre_de_curso,
        Estudiantes: estudiantesLimpios
      };

    } catch (error) {
      console.error(error); // Es buena práctica imprimir el error real para depurar
      ctx.throw(500, 'Error al consultar la lista de estudiantes matriculados');
    }
  }
}));


