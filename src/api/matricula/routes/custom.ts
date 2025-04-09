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
    },
    {
      method: 'GET',
      path: '/matriculas/listaEstudiantes/:cursoId',
      handler: 'api::matricula.matricula.listaEstudiantes',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/matriculas/contarEstudiantes/:cursoId',
      handler: 'api::matricula.matricula.contarEstudiantes',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/matriculas/cursosPorEstudiante/:estudianteId',
      handler: 'api::matricula.matricula.cursosPorEstudiante',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};

