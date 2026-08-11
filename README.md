# 🚀 Nexus Ops — Mini ERP + CRM Operations Portal

Nexus Ops is a full-stack **Mini ERP + CRM Operations Portal** designed for a wholesale/distribution business.

The application enables internal teams such as **Admin, Sales, Warehouse, and Accounts** to manage customers, products, inventory, stock movements, and sales challans through a secure role-based system.

The project demonstrates real-world full-stack development concepts including:

- REST API development
- JWT authentication
- Role-based authorization
- PostgreSQL database design
- Prisma ORM
- Transactional business logic
- Input validation
- Centralized error handling
- Responsive React UI
- API integration
- Docker-based development
- Cloud deployment

---

## 🌐 Live Demo

### Frontend

**Live Application:**  
fundsroom-erp-crm.netlify.app

### Backend API

**Live Backend:**  
[`YOUR_RENDER_BACKEND_URL`](https://fundsroom-erp-crm-backend-yx2t.onrender.com)

### GitHub Repository

**Source Code:**  
[`YOUR_GITHUB_REPOSITORY_URL`](https://github.com/maskisneha04/fundsroom-erp-crm)


> The backend is deployed using a free Render instance and may take some time to respond after a period of inactivity.

---

# 📸 Screenshots

## 🔐 Login

![Nexus Ops Login](<img src="outputs/Login.png" alt="Nexus Ops Login Page" width="900"/>)

The login page provides JWT-based authentication with demo accounts for different employee roles.

---

## 📊 Dashboard

![Nexus Ops Dashboard](<img src="outputs/Dashboard.png" alt="Nexus Ops Dashboard" width="900"/>)

The dashboard provides an operational overview including:

- Total customers
- Total products
- Low-stock products
- Sales challans
- Draft challans
- Confirmed challans
- Recent challans
- Low-stock items

---

## 👥 Customer Management

![Customer Management](<img src="outputs/Customer Management.png" alt="Customer Management" width="900"/>)

The Customer CRM module provides:

- Customer search
- Customer filtering
- Customer status
- Customer type
- Business information
- Mobile number
- Follow-up information
- Customer management

---

## 📦 Product Management

![Product Management](<img src="outputs/Product Management.png" alt="Product Management" width="900"/>)

The Product module provides:

- Product listing
- SKU management
- Categories
- Unit price
- Current stock
- Minimum stock level
- Warehouse/location
- Low-stock identification
- Product search

---

## 📋 Inventory Management

![Inventory Management](<img src="outputs/Inventory.png" alt="Inventory Management" width="900"/>)

The Inventory module supports:

- Stock IN operations
- Current stock monitoring
- Minimum stock alerts
- Stock movement tracking
- Product-level inventory management

---

## 🧾 Sales Challans

![Sales Challans](<img src="outputs/Sales Challans.png" alt="Sales Challans" width="900"/>)

The Sales Challan module supports:

- Customer selection
- Multiple products
- Quantity management
- Automatic challan numbers
- Draft challans
- Confirmed challans
- Cancelled challans
- Stock validation
- Transactional stock reduction

---

# 📌 Project Overview

Nexus Ops is designed as an internal ERP + CRM system for a wholesale/distribution company.

The application focuses on four major operational areas:

1. **Authentication and role management**
2. **Customer CRM**
3. **Product and inventory management**
4. **Sales challan management**

The project implements business rules such as preventing negative stock, validating available inventory before challan confirmation, storing product snapshots, and performing stock updates transactionally.

---

# ✨ Features

## 🔐 Authentication & Role-Based Authorization

- JWT-based authentication
- Secure login
- Protected routes
- Role-based authorization
- Four employee roles:
  - Admin
  - Sales
  - Warehouse
  - Accounts
- Backend authorization middleware
- Frontend route protection

---

## 👥 Customer CRM

The Customer CRM module provides:

- Add customer
- Edit customer
- Search customer
- Filter customer
- View customer information
- Customer status management
- Customer type management
- Follow-up dates
- Follow-up notes
- Business information
- Mobile number
- Email address
- GST number
- Address

### Customer Types

- Retail
- Wholesale
- Distributor

### Customer Status

- Lead
- Active
- Inactive

---

## 📦 Product Management

The Product module provides:

- Add product
- Edit product
- Search product
- SKU/code management
- Category
- Unit price
- Current stock
- Minimum stock quantity
- Warehouse/location
- Low-stock detection

---

## 📊 Inventory Management

The Inventory module provides:

- Stock IN operations
- Stock movement history
- IN/OUT movement tracking
- Quantity tracking
- Movement reason
- Created-by tracking
- Timestamp tracking
- Low-stock alerts

---

## 🧾 Sales Challan Management

The Sales Challan module provides:

- Create challan
- Select customer
- Add multiple products
- Add quantities
- Automatically generate challan number
- Save challan as Draft
- Confirm challan
- Cancel challan
- Product snapshot storage
- Stock validation
- Negative-stock prevention
- Transactional stock updates

---

## 📈 Dashboard

The dashboard provides a summary of operational information:

- Customer count
- Product count
- Low-stock count
- Challan count
- Draft challan count
- Confirmed challan count
- Low-stock items
- Recent challans

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Node.js |
| API Framework | Express.js |
| Backend Language | TypeScript |
| Authentication | JWT |
| Validation | Zod |
| Security | Helmet |
| ORM | Prisma |
| Database | PostgreSQL |
| API Style | REST |
| Frontend Deployment | Netlify |
| Backend Deployment | Render |
| Containerization | Docker |
| API Testing | Postman |

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │  TypeScript + Vite  │
                    └──────────┬──────────┘
                               │
                               │ Axios / REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express Server    │
                    │    TypeScript       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Authentication &    │
                    │ Role Middleware     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Controllers      │
                    │   Thin Controllers  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Services       │
                    │  Business Logic     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Repositories/Prisma │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     PostgreSQL      │
                    └─────────────────────┘
