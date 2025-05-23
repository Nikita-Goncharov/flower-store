const axios = {
    create: jest.fn(() => axios),
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  };
  
  export default axios;
  