
export default {
  server: {
    proxy: {
      '/ws': {
        target: 'ws://www.vps.sarvagyapatel.in', // your local WebSocket server
        ws: true,
      },
    },
  },
};

