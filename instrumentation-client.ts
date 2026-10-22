import { initBotId } from 'botid/client/core';

// Definisikan rute/endpoint yang ingin diproteksi dari bot & DDoS
initBotId({
  protect: [
    {
      path: '/login',
      method: 'POST',
    },
    {
      path: '/tenant/login',
      method: 'POST',
    },
  ],
});
