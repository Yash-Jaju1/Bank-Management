# Bank Management Backend

This is the backend server for the Bank Management System, built using **Node.js**, **Express**, and **MongoDB**. It provides secure RESTful API endpoints for managing admins, customers, transactions, and OTP-based verification.

---

## 🔧 Tech Stack

- **Node.js** – JavaScript runtime for server-side logic.
- **Express.js** – Web framework for handling HTTP requests and routing.
- **MongoDB** – NoSQL database for data storage.
- **Mongoose** – MongoDB ODM for schema modeling and validation.
- **bcrypt** – For hashing passwords securely.
- **Other Dependencies** – Refer to `package.json` for the complete list.

---

## 📁 Project Structure
```bash
Bank-Management/
├── models/ # Mongoose models (Admin, Customer, OtpCode, Transaction)
├── routes/ # Route handlers for API endpoints
├── server.js # Main Express app setup and DB connection
├── createAdmin.js # Script to initialize admin user(s)
└── package.json # Project metadata and dependencies
```

---

## 🔐 Key Features

- **Admin Authentication** – Secure login with hashed passwords.
- **Customer Management** – CRUD APIs for handling customer accounts.
- **Transaction Operations** – Deposit, withdraw, transfer, and transaction history.
- **OTP Verification** – Separate model for OTPs used in sensitive operations.
- **Admin Analytics** – Endpoints for tracking user activity and system metrics.

---

## ▶️ Usage

### 1. Clone the Repository
```bash
git clone https://github.com/Yash-Jaju1/Bank-Management.git
cd Bank-Management
```
### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a .env file and define your environment variables:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
### 4. Run the Server
```bash
node server.js
```
### 5. Create an Initial Admin (optional)
```bash
node createAdmin.js
```

---

## 📡 API Endpoints
The backend exposes RESTful APIs for integration with the frontend. Example routes:

- POST /admin/login
- GET /customer/get
- POST /transaction/deposit
- POST /otp/send
- GET /analytics/admin

Use tools like Postman or Insomnia to test API endpoints.

---

## 🗃️ Database
All data is stored in MongoDB and includes the following collections:

- admins
- customers
- transactions
- otpCodes
