# 🚀 Bank Management System — Backend

Secure, scalable, production-style backend for a full-stack banking platform.  
Built with **Node.js, Express.js, MongoDB, JWT, and CI/CD automation**.

It supports **role-based authentication**, real-time transactions, analytics, and OTP-based verification for sensitive actions.

---

## 🔧 Tech Stack  
- **Node.js** — Backend runtime  
- **Express.js** — Routing & middleware  
- **MongoDB + Mongoose** — Optimized data modeling  
- **JWT** — Secure authentication  
- **bcrypt** — Encrypted password storage  
- **GitHub Actions** — CI/CD automated deployments  
- **Render** — Backend hosting  

---

## 🏦 Core Functionalities

| Feature Category | Description |
|---|---|
| 🔐 Authentication | JWT-secured login for Admin & User |
| 👤 Role-Based Access | Admin can view system analytics, users can view/manage accounts |
| 💸 Transactions | Deposit, Withdraw, Transfer with validation |
| 📜 Transaction History | **Time-based sorting & filtering** for quick search |
| 📈 Admin Analytics | User activity, transaction metrics |
| 🔏 OTP Verification | Added security for sensitive operations |
| ☁️ Deployment | CI/CD pipeline keeps production updated |

---

## 📁 Project Structure

Bank-Management/
├── models/ # Mongoose models (Admin, Customer, OTP, Transaction)
├── routes/ # API route handlers
├── server.js # App entrypoint + DB connection
├── createAdmin.js # Bootstrap script for admin users
└── package.json # Dependencies & scripts


---

## 🗄️ Database Collections

| Collection | Purpose |
|---|---|
| `admins` | Authentication & role management |
| `customers` | Bank accounts + secure balance maintenance |
| `transactions` | Timestamped logs for analytics |
| `otpCodes` | Verification codes with expiry |

---

## 📡 REST API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/admin/login` | POST | Admin/User authentication |
| `/customer/get` | GET | Fetch customer details |
| `/transaction/deposit` | POST | Add funds |
| `/transaction/transfer` | POST | Transfer funds securely |
| `/analytics/admin` | GET | Dashboard data |

> Full API documentation with request & response formats coming soon 📌  
(Considering Swagger for auto-documentation)

---

## ▶️ Running the Project Locally

```bash
git clone https://github.com/Yash-Jaju1/Bank-Management.git
cd Bank-Management
npm install


Create a .env file:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
Run server:
npm start
Optional Admin Setup:
node createAdmin.js
🧪 Testing (Manual)

✔ Auth validation
✔ JWT route protection
✔ Insufficient balance conditions
✔ Failed OTP handling
✔ Deposit / Withdraw / Transfer edge cases
✔ Accurate timestamped transaction history

(Automated Jest tests planned for future updates)

🚀 Deployment
Component	Platform
Backend API	Render
CI/CD	GitHub Actions

🔗 Live backend URL (insert your link here)

🔮 Future Enhancements

Suspicious transaction ML anomaly detection

Swagger / Postman API documentation

Notifications via email/SMS

🧑‍💻 Author

Yash Jaju
SDE + Full-Stack Developer
