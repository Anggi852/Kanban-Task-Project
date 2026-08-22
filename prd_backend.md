Menurut saya, sebelum meminta AI Agent mengembangkan backend, Anda perlu menyediakan **2 dokumen utama**:

1. **Product Requirements Document (PRD)** → menjelaskan apa yang akan dibangun.
2. **Technical Architecture & Development Guide** → menjelaskan bagaimana cara membangunnya sesuai best practice.

Banyak AI Agent gagal menghasilkan kode yang baik bukan karena modelnya buruk, tetapi karena PRD terlalu umum seperti:

> "Buat aplikasi task tracking dengan NestJS"

Instruksi seperti itu biasanya menghasilkan backend CRUD biasa tanpa arah arsitektur yang jelas.

---

# 1. Definisi Produk

## Nama Proyek

TaskFlow

## Ringkasan

TaskFlow adalah aplikasi manajemen tugas pribadi berbasis Kanban Board yang membantu pengguna mengorganisasi, memantau, dan mengevaluasi progres tugas melalui visualisasi board yang intuitif.

Aplikasi ini ditujukan untuk penggunaan individu (single-user ownership), bukan kolaborasi tim.

---

# 2. Tujuan Produk

Masalah:

Banyak mahasiswa atau individu masih mengelola tugas menggunakan catatan manual atau aplikasi yang terlalu kompleks.

Solusi:

Menyediakan aplikasi task tracking sederhana dengan visualisasi Kanban Board untuk:

- Mengelola tugas
- Memantau progres
- Melihat statistik produktivitas

---

# 3. Ruang Lingkup MVP

## In Scope

### Authentication

- Register
- Login
- Refresh Token
- Logout

### Board Management

- Create Board
- Read Board
- Update Board
- Delete Board

### Column Management

- Create Column
- Update Column
- Delete Column
- Reorder Column

### Task Management

- Create Task
- Update Task
- Delete Task
- Move Task
- Reorder Task

### Activity Tracking

- Record activity history

### Productivity Analytics

- Total tasks
- Completed tasks
- Completion rate
- Task completion trend

---

## Out of Scope

- Team Collaboration
- Workspace
- Role Permission
- Chat
- File Upload
- Notifications
- WebSocket
- Calendar Sync
- AI Recommendation

---

# 4. User Flow

## Register

```text
User
 ↓
Register
 ↓
Account Created
 ↓
Login
```

---

## Login

```text
User
 ↓
Login
 ↓
JWT Issued
 ↓
Access Application
```

---

## Create Board

```text
Dashboard
 ↓
Create Board
 ↓
Default Columns Created

Todo
Doing
Done
```

---

## Create Task

```text
Board
 ↓
Column
 ↓
Create Task
 ↓
Task Saved
 ↓
Activity Recorded
```

---

## Move Task

```text
Todo
 ↓
Doing
 ↓
Done
```

Saat task dipindahkan:

```text
Update Column
Update Order
Create Activity
```

---

# 5. Domain Model

```text
User
 └── Board
       ├── Column
       │      └── Task
       └── Activity
```

---

# 6. Backend Architecture

Untuk NestJS saya sangat menyarankan menggunakan **Modular Monolith**.

Struktur:

```text
src/

├── modules/
│   ├── auth/
│   ├── users/
│   ├── boards/
│   ├── columns/
│   ├── tasks/
│   ├── activities/
│   └── analytics/
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── pipes/
│
├── config/
├── prisma/
└── main.ts
```

---

# 7. NestJS Best Practice

## Jangan Letakkan Logic di Controller

Buruk:

```ts
@Post()
async create() {
  // business logic
}
```

Controller hanya:

```ts
@Post()
create(@Body() dto: CreateTaskDto) {
  return this.taskService.create(dto);
}
```

---

## Business Logic di Service

```ts
@Injectable()
export class TaskService {
  async create(dto: CreateTaskDto) {
    // business logic
  }
}
```

---

## Prisma Hanya Melalui PrismaService

Jangan:

```ts
new PrismaClient();
```

Gunakan:

```ts
@Injectable()
export class PrismaService extends PrismaClient {}
```

---

## DTO untuk Semua Input

```ts
export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  description?: string;
}
```

---

## Global Validation Pipe

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);
```

---

## Gunakan Repository Layer (Opsional tapi Direkomendasikan)

Daripada:

```text
Controller
   ↓
Service
   ↓
Prisma
```

Lebih baik:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma
```

Contoh:

```text
tasks/

├── task.controller.ts
├── task.service.ts
├── task.repository.ts
```

Keuntungan:

- Mudah testing
- Mudah migrasi ORM
- AI Agent lebih konsisten menghasilkan kode

---

# 8. Database Design

Entitas utama:

```text
users
boards
columns
tasks
activities
refresh_tokens
```

---

Task:

```text
id
title
description
priority
status
position
due_date
created_at
updated_at
```

---

Column:

```text
id
name
position
board_id
```

---

Board:

```text
id
name
user_id
```

---

# 9. API Design

Contoh endpoint:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
```

---

```text
GET    /boards
POST   /boards
GET    /boards/:id
PATCH  /boards/:id
DELETE /boards/:id
```

---

```text
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
```

---

```text
POST /tasks/:id/move
```

Payload:

```json
{
  "targetColumnId": "uuid",
  "position": 2
}
```

---

# 10. Prompt untuk AI Agent

Ini bagian yang paling penting. Saya biasanya memberi AI Agent instruksi seperti berikut:

You are a senior backend architect specializing in NestJS, Prisma, PostgreSQL, and Domain-Driven Design.

Build a production-quality backend for a personal Kanban-based task tracking application.

Requirements:

- NestJS latest stable version
- Prisma ORM
- PostgreSQL
- JWT Access Token + Refresh Token Authentication
- Modular Monolith Architecture
- Repository Pattern
- DTO Validation using class-validator
- Global Exception Handling
- Environment-based Configuration
- TypeScript Strict Mode

Domain Modules:

- Auth
- Users
- Boards
- Columns
- Tasks
- Activities
- Analytics

Business Rules:

- A user can own multiple boards.
- A board contains multiple columns.
- A column contains multiple tasks.
- Tasks can be reordered within a column.
- Tasks can be moved between columns.
- Every task movement must create an activity log.
- Every task creation must create an activity log.
- Every task deletion must create an activity log.

Architecture Rules:

- Controllers must remain thin.
- Business logic belongs only in services.
- Database access must go through repositories.
- Prisma Client must only be accessed through PrismaService.
- Use dependency injection everywhere.
- Avoid code duplication.
- Follow SOLID principles.
- Follow NestJS best practices.
- Generate clean folder structure before implementation.

Always explain architectural decisions before generating code.

Dengan PRD dan arahan teknis seperti ini, AI Agent akan jauh lebih mampu menjaga konsistensi arsitektur backend selama proses pengembangan dibanding hanya diberi instruksi fitur per fitur.
