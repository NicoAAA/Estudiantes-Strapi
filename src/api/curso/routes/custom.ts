console.log('Cargando rutas personalizadas');
export default [
  {
    method: 'POST',
    path: '/api/cursos/countMatriculados',
    handler: 'api::curso.curso.countMatriculados',
    config: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/api/cursos/listaEstudiantes',
    handler: 'api::curso.curso.listaEstudiantes',
    config: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'GET',
    path: '/api/estudiantes/:id/cursosInscrito',
    handler: 'api::estudiante.estudiante.cursosInscrito',
    config: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
];
