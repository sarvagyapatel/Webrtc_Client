
export default {
  server: {
    proxy: {
      '/ws': {
        target: 'ws://68.183.81.222:4001', // your local WebSocket server
        ws: true,
      },
    },
  },
};

