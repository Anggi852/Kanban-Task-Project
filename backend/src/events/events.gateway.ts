import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

// Kita pasang menara ini di Port 8001 (sesuai dengan yang Kakak setting di Frontend)
// SESUDAH DIPERBAIKI
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  // 1. Menerima sinyal 'tugasBaru' dari Frontend, lalu memantulkannya ke semua Tab
  @SubscribeMessage('tugasBaru')
  handleTugasBaru(@MessageBody() data: any): void {
    console.log(
      'Menerima sinyal Tugas Baru! Mem-broadcast ke semua tab...',
      data,
    );
    this.server.emit('tugasBaru', data);
  }

  // 2. Menerima sinyal 'geserTask' dari Frontend, lalu memantulkannya ke semua Tab
  @SubscribeMessage('geserTask')
  handleGeserTask(@MessageBody() data: any): void {
    console.log(
      'Menerima sinyal Tugas Digeser! Mem-broadcast ke semua tab...',
      data,
    );
    this.server.emit('geserTask', data);
  }
}
