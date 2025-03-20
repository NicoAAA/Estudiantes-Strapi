console.log('Cargando rutas personalizadas para estudiante');
export default [
  {
    method: 'GET',
    path: '/api/estudiantes/:id/cursosInscrito',
    handler: 'api::estudiante.estudiante.cursosInscrito',
    config: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  }
];
