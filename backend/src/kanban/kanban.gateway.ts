import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// --- HAPUS ANGKA 8001 DI SINI AGAR TIDAK TABRAKAN DENGAN API UTAMA ---
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Saat ada user yang buka web
  handleConnection(client: Socket) {
    console.log(`Client terkoneksi: ${client.id}`);
  }

  // Saat user menutup web
  handleDisconnect(client: Socket) {
    console.log(`Client terputus: ${client.id}`);
  }

  // Menerima pesan dari Frontend saat task digeser, diedit, atau dihapus
  @SubscribeMessage('geserTask')
  handleGeserTask(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Data task yang digeser/diubah:', data);

    // Broadcast pesan ke tab lain
    client.broadcast.emit('geserTask', data);
  }

  // Menerima pesan saat ada tugas BARU ditambahkan
  @SubscribeMessage('tugasBaru')
  handleTugasBaru(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Ada tugas baru dibuat:', data);

    // Broadcast pesan ke tab lain
    client.broadcast.emit('tugasBaru', data);
  }
}
