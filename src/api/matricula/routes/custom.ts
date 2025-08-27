console.log('Cargando rutas personalizadas para matriculas');

export default {
  routes: [
    {
      method: 'POST',
      path: '/matriculas/crear',
      handler: 'matricula.crearMatricula',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};

