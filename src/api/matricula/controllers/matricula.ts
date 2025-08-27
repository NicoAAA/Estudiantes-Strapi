/**
 * matricula controller
 */

import { factories } from '@strapi/strapi'
import axios from 'axios';




export default factories.createCoreController('api::matricula.matricula',({ strapi }) =>({
    async crearMatricula(ctx) {
    // 1. Extraer los nuevos datos desde el body de la petición
    const { n_Documento, Nombre_curso, periodo } = ctx.request.body.data;

    // Verificar que existan los datos requeridos
    if (!n_Documento || !Nombre_curso || !periodo) {
      return ctx.badRequest('Faltan datos requeridos: n_Documento, Nombre_curso o periodo.');
    }

    try {
      // INICIA LA TRANSACCIÓN
      const nuevaMatricula = await strapi.db.transaction(async () => {
        
        // 2. Buscar al estudiante por su n_Documento y al curso por su Nombre_curso
        const [estudiante, curso] = await Promise.all([
          strapi.db.query('api::estudiante.estudiante').findOne({ where: { n_Documento: n_Documento } }),
          strapi.db.query('api::curso.curso').findOne({ where: { Nombre_curso: Nombre_curso } })
        ]);

        if (!estudiante) throw new Error('El estudiante con el documento proporcionado no existe.');
        if (!curso) throw new Error('El curso con el nombre proporcionado no existe.');
      
        // 3. Verificar que no exista una matrícula duplicada (usando los IDs encontrados)
        const existeMatricula = await strapi.db.query('api::matricula.matricula').findOne({
          where: { 
            fk_idEstudiante: estudiante.id, 
            fk_id_curso: curso.id, 
            periodo: periodo 
          }
        });
      
        if (existeMatricula) {
          throw new Error('El estudiante ya está matriculado en este curso para el mismo periodo.');
        }
        
        // 4. Verificar la capacidad máxima del curso (usando el ID del curso)
        const inscritos = await strapi.db.query('api::matricula.matricula').count({
          where: { 
            fk_id_curso: curso.id, 
            periodo: periodo 
          }
        });
        
        if (curso.capacidadMaxima && inscritos >= curso.capacidadMaxima) {
          throw new Error('La capacidad máxima del curso ya fue alcanzada.');
        }
      
        // 5. Si todo está bien, crear la matrícula (usando los IDs)
        const matriculaCreada = await strapi.entityService.create('api::matricula.matricula', {
          data: {
            periodo: periodo,
            Fecha_matricula: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
            fk_idEstudiante: estudiante.id,
            fk_id_curso: curso.id,
            publishedAt: new Date() // Publicar inmediatamente
          }
        });

        return matriculaCreada;
      });
      // FINALIZA LA TRANSACCIÓN

      // Si la transacción fue exitosa, responde al cliente
      ctx.body = {
        message: 'Matrícula creada exitosamente.',
        data: nuevaMatricula
      };

    } catch (error) {
      // La transacción hará un rollback automático si se lanza un error
      console.error('Error al crear la matrícula:', error.message);
      return ctx.badRequest(error.message);
    }
  }
}));