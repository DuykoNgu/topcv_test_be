# TopCV Test Backend

Dự án Backend cho hệ thống quản lý và tạo biểu mẫu (Form Builder), được xây dựng bằng Node.js, TypeScript, Express và Prisma ORM.

## 🛠 Hướng dẫn cài đặt (Installation)

Để cài đặt và chạy dự án ở môi trường local, thực hiện các bước sau:

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường & Database (Neon)
Dự án sử dụng **PostgreSQL** được lưu trữ trên **Neon** (một nền tảng Serverless Postgres giúp tự động scale và tối ưu cho môi trường cloud).

Tạo file `.env` và cấu hình các đường dẫn kết nối từ Neon:
```env
# URL dùng cho ứng dụng (thông qua Connection Pooler)
DATABASE_URL="postgresql://neondb_owner:npg_wGAn2L3tOVdF@ep-jolly-fire-aos72pak-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# URL dùng trực tiếp cho Prisma Migrate (Direct connection)
DIRECT_URL="postgresql://neondb_owner:npg_wGAn2L3tOVdF@ep-jolly-fire-aos72pak.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret Keys
JWT_SECRET=topcv_jwt_s3cr3t_k3y_2026_pr0duct10n
JWT_REFRESH_SECRET=topcv_jwt_r3fr3sh_s3cr3t_k3y_2026_pr0duct10n
```

> [!IMPORTANT]
> **Lưu ý quan trọng**: Vì dự án sử dụng **Neon Database (Cloud)**, bạn **KHÔNG CẦN** phải cài đặt hay cấu hình PostgreSQL ở máy local. Chỉ cần copy đúng các thông tin trong file `.env` là ứng dụng có thể kết nối trực tiếp đến cơ sở dữ liệu trên Cloud và hoạt động ngay lập tức.

### 3. Thiết lập Prisma ORM
Dự án sử dụng **Prisma** làm ORM (Object-Relational Mapping) giúp tương tác với Database bằng mã TypeScript an toàn, thay vì viết các câu lệnh SQL thuần túy.

Thực hiện các bước sau để thiết lập:
```bash
# 1. Generate Prisma Client (tạo các kiểu dữ liệu TypeScript dựa trên schema)
npx prisma generate

# 2. Đẩy cấu hình Schema lên Database trên Neon
npx prisma db push

# (Tùy chọn) Chạy migration nếu bạn muốn quản lý lịch sử thay đổi schema
# npx prisma migrate dev --name init
```

---

## 🌩️ Về Neon Database
**Neon** là cơ sở dữ liệu PostgreSQL mã nguồn mở hoàn toàn được xây dựng cho đám mây. Chúng ta sử dụng Neon vì:
- **Serverless**: Tự động tắt khi không dùng và khởi động nhanh khi có request, giúp tiết kiệm chi phí.
- **Branching**: Cho phép tạo các bản sao (branch) của database cực nhanh để test feature mà không ảnh hưởng data chính.
- **Connection Pooling**: Tích hợp sẵn `pooler` để xử lý hàng ngàn kết nối đồng thời từ serverless functions.

### 4. Chạy dự án
```bash
# Chế độ Development
npm run dev

# Build và chạy Production
npm run build
npm start
```

---

## 📖 Tài liệu API (API Documentation)
Dự án tích hợp **Swagger UI** giúp việc tra cứu và kiểm tra API trở nên trực quan và dễ dàng.

- **Link truy cập**: `http://localhost:3000/api-docs`
- **Tính năng**:
  - Liệt kê đầy đủ các endpoint (Users, Forms, Fields, Submissions).
  - Thử nghiệm API trực tiếp trên trình duyệt (Interactive Testing).
  - Hỗ trợ xác thực JWT: Nhấn nút **Authorize** và nhập `Bearer <your_token>` để test các API yêu cầu quyền truy cập.

---


## 🗄 Cấu trúc Database (Database Schema)

Hệ thống sử dụng các bảng chính sau:
- **users**: Quản lý thông tin người dùng và vai trò (ADMIN/STAFF).
- **forms**: Lưu trữ các mẫu biểu mẫu (tiêu đề, mô tả, trạng thái).
- **fields**: Lưu trữ các trường thông tin trong một form (loại input, validation rules).
- **submissions**: Ghi lại thông tin mỗi lần người dùng nộp form.
- **submission_values**: Lưu giá trị thực tế của từng field trong mỗi lần nộp.
- **refresh_tokens**: Quản lý phiên đăng nhập và gia hạn token.

### 🛡 Cơ chế Kiểm soát & Audit (Audit Base)
Tất cả các bảng chính đều áp dụng các trường cơ sở để kiểm soát dữ liệu:
- **`version`**: Sử dụng cho cơ chế **Optimistic Locking**, giúp tránh xung đột khi nhiều người cùng chỉnh sửa một bản ghi.
- **`deleteFlag`**: Cơ chế **Soft Delete**. Dữ liệu không bị xóa thật khỏi DB mà chỉ đánh dấu ẩn để có thể khôi phục hoặc audit.
- **`createdBy` & `updatedBy`**: Lưu trữ ID người thực hiện tạo hoặc cập nhật bản ghi cuối cùng.
- **`createdAt` & `updatedAt`**: Tự động ghi lại thời gian tạo và thay đổi dữ liệu.

---

## 🏗 Kiến trúc dự án (Architecture)

### 1. Service Layer & Data Control
Dự án áp dụng lớp **Service** để xử lý logic nghiệp vụ. Đặc biệt:
- **Field Projection**: Mỗi Service định nghĩa các `PROJECTION` constants (như `FORM_PROJECTION`, `FIELD_PROJECTION`) để kiểm soát chính xác những trường nào được lấy từ Database. Điều này giúp tối ưu hiệu năng và bảo mật (tránh lộ các trường nhạy cảm như password).

### 2. Dependency Injection (DI)
Cơ chế DI được triển khai tập trung tại thư mục `src/factories/`:
- **Repository Factory**: Khởi tạo các lớp Repository với Prisma instance.
- **Service Factory**: Khởi tạo các Service và "tiêm" (inject) các Repository tương ứng vào constructor.
- Điều này giúp code lỏng lẻo (loose coupling) và cực kỳ dễ dàng khi viết Unit Test.

### 3. Middleware Structure
Các Middleware được xây dựng để xử lý các logic xuyên suốt (cross-cutting concerns):
- **Auth Middleware**: Xác thực tính hợp lệ của Access Token.
- **Role Middleware**: Kiểm tra quyền truy cập của người dùng (RBAC) dựa trên vai trò trước khi vào Controller.
- **Validation Middleware (Zod)**: Sử dụng thư viện **Zod** để định nghĩa schema và kiểm tra tính hợp lệ của dữ liệu đầu vào (Request Body). Nếu dữ liệu không khớp với schema, middleware sẽ tự động trả về lỗi 400 kèm chi tiết các trường bị lỗi.

### 4. Authentication & Authorization

Hệ thống sử dụng cơ chế **JWT (JSON Web Token)**:
- **Access Token**: Dùng để xác thực ngắn hạn cho các request.
- **Refresh Token**: Lưu trong Database và HttpOnly Cookie để cấp lại Access Token mới khi hết hạn, đảm bảo trải nghiệm người dùng liền mạch và an toàn.
