# AR Hotel Menu Platform — Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

---

## 1. Clone / Open Project

```
cd mr-project
```

---

## 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
# Edit .env with your MongoDB URI
```

### .env Configuration
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ar-hotel-menu
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Seed Sample Data
```bash
npm run seed
```
This creates:
- ✅ Admin user: `admin@arhotel.com` / `admin123`
- ✅ 7 categories
- ✅ 16 sample dishes with full details

### Start Backend
```bash
npm run dev    # Development with nodemon
npm start      # Production
```
Server runs on → `http://localhost:5000`

---

## 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies (already done if you ran setup)
npm install

# Start dev server
npm run dev
```
Frontend runs on → `http://localhost:5173`

---

## 4. Test the Application

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Customer home page |
| `http://localhost:5173/menu` | Browse all dishes |
| `http://localhost:5173/login` | Admin login |
| `http://localhost:5173/admin` | Admin dashboard |
| `http://localhost:5000/api/health` | Backend health check |

---

## 5. QR Code Setup

Generate a QR code pointing to:
```
http://YOUR_LOCAL_IP:5173/menu
```

Place in `frontend/public/qr/` folder and print for tables.

---

## 6. AR Model Files

Place `.glb` 3D models in:
```
backend/uploads/models/
  pizza.glb
  burger.glb
  coffee.glb
  icecream.glb
```

Free GLB models: https://sketchfab.com (CC licensed)

---

## 7. Upload Food Images

- Admins can upload food images from the admin panel
- Or pre-load JPG/PNG files in:
```
backend/uploads/images/
```

---

## 8. Admin Credentials

```
Email: admin@arhotel.com
Password: admin123
```

> ⚠️ **Change these in production!**

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/menu` | Get menu items |
| GET | `/api/menu/:slug` | Get dish by slug |
| POST | `/api/menu` | Create dish (admin) |
| PUT | `/api/menu/:id` | Update dish (admin) |
| DELETE | `/api/menu/:id` | Delete dish (admin) |
| GET | `/api/categories` | Get categories |
| POST | `/api/categories` | Create category (admin) |
| POST | `/api/orders` | Place order |
| GET | `/api/orders/:id` | Track order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |
| GET | `/api/orders/analytics` | Dashboard analytics (admin) |

---

## Project Structure

```
mr-project/
├── backend/              ← Node.js + Express API
│   ├── config/db.js
│   ├── models/           ← Mongoose models
│   ├── controllers/      ← Route logic
│   ├── routes/           ← Express routes
│   ├── middleware/       ← JWT + Multer
│   ├── uploads/
│   │   ├── images/       ← Food photos
│   │   └── models/       ← 3D .glb files
│   ├── seedData.js
│   └── server.js
│
└── frontend/             ← React + Vite + Tailwind
    └── src/
        ├── components/   ← Reusable UI components
        ├── pages/        ← Route pages
        ├── context/      ← Cart & Auth context
        ├── services/     ← Axios API layer
        ├── hooks/        ← Custom hooks
        └── utils/        ← Helpers
```
