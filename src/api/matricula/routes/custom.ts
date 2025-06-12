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
      method: 'POST',
      path: '/matriculas/listaEstudiantes',
      handler: 'matricula.listaEstudiantes', // Asegúrate de que este método exista en el controlador
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },   
    {
      method: 'POST',
      path: '/matriculas/contarEstudiantes',
      handler: 'matricula.contarEstudiantes',
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

