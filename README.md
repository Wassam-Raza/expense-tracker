# The Ledger — Expense Tracker (Nexsoft Task 09)

Full-stack MERN expense tracker with income/expense transactions, dynamic balance calculation, MongoDB storage, and a responsive dashboard UI.

## Design
A warm, paper-toned "accounting ledger" aesthetic — Fraunces serif for the running balance, Space Mono for amounts and dates (evoking a typewriter ledger book), ruled-paper background. Income shown in ink-green, expenses in brick-red.

## Features
- Add income & expense transactions
- Dynamic running balance calculation (income − expense)
- MongoDB storage per user (JWT-authenticated)
- Transaction history with filtering (All / Income / Expense)
- Edit & delete entries
- Cash flow chart by month (Recharts area chart)
- Spending breakdown by category
- Responsive dashboard UI

## Stack
MongoDB · Express · React (Vite) · Node.js

## Setup

### 1. Start MongoDB
Ensure MongoDB is running on `localhost:27017`

### 2. Backend
```bash
cd backend
npm install
node server.js
```
Runs on http://localhost:5000

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Opens on http://localhost:3000

## Usage
1. Register an account
2. Click "+ New Entry" to add income or expense
3. Watch the running balance update live
4. Filter transactions, edit or delete any entry
5. View the cash flow chart and category breakdown
