# Siva Department Store (ZYPHOR ZONE)

A comprehensive, full-stack Department Store & Point of Sale (POS) management application tailored for Siva Department Store (Somanahalli, Palacode, Dharmapuri, Tamil Nadu).

---

## 🌟 Features

- **Storefront & Catalog**: Interactive product browsing, filtering by categories, real-time inventory availability, and rich shopping cart.
- **Point of Sale (POS)**: Fast checkout, barcode scanning support, tax & discount calculation, and receipt generation.
- **Inventory Management**: Real-time stock tracking, low-stock alerts, restock alerts, and supplier management.
- **Order Tracking & Billing**: Order histories, status updates, invoice generation, and customer management.
- **Reports & Analytics**: Daily sales, profit & loss, inventory valuation, and top-selling products.
- **Authentication & Roles**: Admin and staff access control with JWT authentication.
- **Zero-Config Database**: Seamlessly switches between local MongoDB and an in-memory MongoDB fallback for instant evaluation.

---

## 🛠️ Tech Stack

### Client
- **React** (Vite)
- **Tailwind CSS**
- **Lucide Icons**
- **Axios**

### Server
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (with `mongodb-memory-server` fallback)
- **JWT** (JSON Web Tokens) & **Bcrypt.js**
- **Morgan** & **CORS**

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation

Clone the repository and install root and sub-project dependencies:

```bash
git clone https://github.com/Subasivam27/Siva_stores.git
cd Siva_stores

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Run Development Server

To run both client and server concurrently:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # UI and business logic components
│   │   ├── context/        # State management contexts
│   │   └── App.jsx
│   └── vite.config.js
├── server/                 # Express REST API backend
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Request controllers
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express API route endpoints
│   │   ├── seeders/        # Sample data seeders
│   │   └── server.js       # App entry point
└── package.json            # Root workspace scripts
```

---

## 📄 License
ISC
