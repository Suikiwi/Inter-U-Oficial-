import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:8000', {
  auth: {
    token: localStorage.getItem('api_key')
  }
});

export default socket;
{/*   asi se usa
    import socket from '../sockets';

useEffect(() => {
  socket.on('connect', () => console.log('Conectado'));
  socket.on('nueva_notificacion', data => {
    console.log('Notificación:', data);
  });

  return () => {
    socket.off('nueva_notificacion');
  };
}, []);

*/}