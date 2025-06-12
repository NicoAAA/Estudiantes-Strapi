console.log('Cargando rutas personalizadas para estudiante');
export default [
  {
    method: 'POST',
    path: '/api/estudiantes/cursosInscrito',
    handler: 'api::estudiante.estudiante.cursosInscrito',
    config: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  }
];
