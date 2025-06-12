/**
 * matricula controller
 */

import { factories } from '@strapi/strapi'
import axios from 'axios';


const procesarRespuestaListaEstudiantes = async (ctx, dataArray) => {
    try {
      // Verificar que la estructura de la respuesta es la esperada
      if (!dataArray?.data?.data) {
        return ctx.throw(500, 'La respuesta de la API no tiene el formato esperado.');
      }
      const data = dataArray.data.data;
      console.log("Respuesta de matriculas:", data);
      ctx.body = {
        message: 'Lista de estudiantes matriculados en el curso',
        estudiantes: data.map(item => item.fk_idEstudiante)
      };
    } catch (error) {
      ctx.throw(500, 'ERROR: No se pudo obtener la lista de estudiantes.');
    }
  };

const functionContarEstudiantes = async (ctx, dataArray) => {
    try {
        // Verificar la estructura del body
        if (!dataArray?.data?.data) {
          return ctx.throw(500, 'La respuesta de la API no tiene el formato esperado.');
        }
        const totalEstudiantes = dataArray.data.data.length;
        ctx.body = {
            message: `Cantidad de estudiantes matriculados: ${totalEstudiantes}`
        };
    } catch (error) {
        ctx.throw(500, 'ERROR: No se pudo contar los estudiantes.');
    }
};

const functionCursosPorEstudiante = async (ctx, dataArray) => {
    try {
        const data = dataArray.data.data;
        ctx.body = {
            message: `Cursos en los que está matriculado el estudiante`,
            cursos: data.map(item => item.fk_id_curso) // Retorna solo los IDs de los cursos
        };
    } catch (error) {
        ctx.throw(500, 'ERROR: No se pudo obtener la lista de cursos.');
    }
};


export default factories.createCoreController('api::matricula.matricula',({ strapi }) =>({
    async crearMatricula(ctx) {
        try {
          // Extraer los datos desde la propiedad "data" del cuerpo de la petición
          const { estudianteId, cursoId, periodo } = ctx.request.body.data;
        
          console.log("Datos recibidos:", { estudianteId, cursoId, periodo });
        
          // Verificar que existan los datos requeridos
          if (!estudianteId?.id || !cursoId?.id || !periodo) {
            console.log("Faltan datos requeridos");
            return ctx.badRequest('Faltan datos requeridos: estudianteId, cursoId o periodo.');
          }
          
          // Obtener los IDs reales de las relaciones
          const estudianteRealId = estudianteId.id;
          const cursoRealId = cursoId.id;
        
          // Validar la existencia del estudiante
          const estudiante = await strapi.db.query('api::estudiante.estudiante').findOne({
            where: { id: estudianteRealId }
          });
          if (!estudiante) {
            console.log("El estudiante no existe");
            return ctx.badRequest('El estudiante especificado no existe.');
          }
          
          // Validar la existencia del curso
          const curso = await strapi.db.query('api::curso.curso').findOne({
            where: { id: cursoRealId }
          });
          if (!curso) {
            console.log("El curso no existe");
            return ctx.badRequest('El curso especificado no existe.');
          }
        
          // Verificar que no exista una matrícula para el mismo estudiante, curso y periodo
          const existeMatricula = await strapi.db.query('api::matricula.matricula').findOne({
            where: {
              fk_idEstudiante: estudianteRealId,
              fk_id_curso: cursoRealId,
              periodo: periodo
            }
          });
        
          if (existeMatricula) {
            console.log("El estudiante ya está matriculado en este curso para el mismo periodo");
            return ctx.badRequest('El estudiante ya está matriculado en este curso para el mismo periodo.');
          }
          
          // Verificar la capacidad máxima del curso
          const inscritos = await strapi.db.query('api::matricula.matricula').count({
            where: {
              fk_id_curso: cursoRealId,
              periodo: periodo
            }
          });
          
          if (curso.capacidadMaxima && inscritos >= curso.capacidadMaxima) {
            console.log("La capacidad máxima del curso ha sido alcanzada");
            return ctx.badRequest('La capacidad máxima del curso ya fue alcanzada.');
          }
        
          // Crear la matrícula usando los IDs correctos
          const nuevaMatricula = await strapi.entityService.create('api::matricula.matricula', {
            data: {
              periodo: periodo,
              Fecha_matricula: new Date().toISOString(),
              fk_idEstudiante: estudianteRealId,
              fk_id_curso: cursoRealId
            }
          });
        
          console.log("Matrícula creada exitosamente:", nuevaMatricula);
        
          ctx.body = {
            message: 'Matrícula creada exitosamente.',
            data: nuevaMatricula
          };
        } catch (error) {
          console.error('Error al crear la matrícula:', error);
          ctx.throw(500, 'Error interno del servidor.');
        }
      },

      async listaEstudiantes(ctx) {
        console.log("Endpoint /api/matriculas/listaEstudiantes");
    
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
    
        let dataArray;
        try {
          dataArray = await strapi.db.query('api::matricula.matricula').findMany({
            where: {
              fk_id_curso: {
                documentId: documentId  // o la condición que corresponda
              }
            },
            populate: ['fk_id_curso', 'fk_idEstudiante']
          });
        } catch (error) {
          return ctx.unauthorized("ERROR: Token inválido o sin permisos");
        }
    
        try {
          await procesarRespuestaListaEstudiantes(ctx, { data: { data: dataArray } });
        } catch (error) {
          ctx.throw(500, "Error: No se pudo procesar la solicitud.");
        }
      },
    // Contar cuántos estudiantes están matriculados en un curso específico
    async contarEstudiantes(ctx) {
        console.log("Endpoint /api/matriculas/contarEstudiantes");

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

        let dataArray
        try {
            dataArray = await strapi.db.query('api::matricula.matricula').findMany({
              where: {
                fk_id_curso:{ documentId: documentId}
              },
              populate: ['fk_id_curso', 'fk_idEstudiante']
            })
        } catch (error) {
            return ctx.unauthorized("ERROR: Token inválido o sin permisos");
        }

        try {
            await functionContarEstudiantes(ctx, { data: { data: dataArray } });
        } catch (error) {
            ctx.throw(500, "Error: No se pudo procesar la solicitud.");
        }
    },

    // Obtener los cursos en los que está matriculado un estudiante
    async cursosPorEstudiante(ctx) {
        console.log("Endpoint /api/matriculas/cursosPorEstudiante");

        const token = ctx.request.headers.authorization?.split(" ")[1];
        if (!token) {
            return ctx.unauthorized("Token no incluido en la petición");
        }

        const { documentId } = ctx.params;
        let dataArray;
        try {
            dataArray = await axios.post(
                `http://localhost:1337/api/matriculas/listaEstudiantes/`,
                { data: { documentId } },
                {
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                }
              );
        } catch (error) {
            return ctx.unauthorized("ERROR: Token inválido o sin permisos");
        }
        try {
            await functionCursosPorEstudiante(ctx, dataArray);
        } catch (error) {
            ctx.throw(500, "Error: No se pudo procesar la solicitud.");
        }
    }
}));