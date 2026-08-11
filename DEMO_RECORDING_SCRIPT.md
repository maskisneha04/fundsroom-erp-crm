# Nexus Ops — Screen Recording Demo Script

Use this file while recording. Speak slowly, pause when clicking.

**Tips**
- Record at 1080p, browser zoom ~100–110%
- Ideal length: 8–12 minutes
- Keep login details visible once
- Have backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) running

**Test logins**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Admin@123 |
| Sales | sales@test.com | Sales@123 |
| Warehouse | warehouse@test.com | Warehouse@123 |
| Accounts | accounts@test.com | Accounts@123 |

---

## Recording checklist (order)

1. Intro  
2. Login Admin  
3. Dashboard  
4. Roles (Sales → Warehouse → Accounts → back)  
5. Customers + follow-up  
6. Products + low stock  
7. Inventory Stock In 20  
8. Challan Draft → Confirm → fail qty 1000 → snapshot  
9. Postman / README  
10. Close  

---

## 0. Intro (30–45 sec)

**Say:**

Hello, this is my Full Stack Developer Case Study submission.  
I built a Mini ERP and CRM Operations Portal for a wholesale distribution company.

The system is used by internal teams — Admin, Sales, Warehouse, and Accounts — to manage customers, products, stock, and sales challans.

My tech stack is React and TypeScript on the frontend, Node.js, Express and TypeScript on the backend, PostgreSQL with Prisma ORM, JWT authentication, and Zod validation.

In this recording, I will demonstrate the complete business flow, role-based access, and the critical stock and challan logic.

**Show:** Browser on `http://localhost:5173` (optional: briefly show project folders or README).

---

## 1. Architecture and approach (45–60 sec)

**Say:**

Before the demo, a quick note on my approach.

I designed the backend in layers: routes, authentication and role middleware, Zod validators, thin controllers, services for business logic, and Prisma repositories talking to PostgreSQL.

Important business rules are enforced on the backend, not only in the UI.  
For example, draft challans do not reduce stock, confirmation runs inside a database transaction, stock can never go negative, and challan items store product snapshots.

**Optional show:** README architecture section, or `backend/src` folders.

---

## 2. Login page (45 sec)

**Do:** Open login page.

**Say:**

This is the login page.  
Authentication is JWT-based. I have seeded four roles for testing.

I will first log in as Admin.

**Do:**
- Click Admin chip or type `admin@test.com` / `Admin@123`
- Show password with the eye icon, then hide again
- Click Sign in

**Say:**

After successful login, I am redirected to the dashboard. My role is shown in the sidebar.

---

## 3. Dashboard (40–50 sec)

**Do:** Stay on Dashboard. Slowly scroll stats.

**Say:**

The dashboard gives an operations overview — total customers, products, low-stock items, total challans, draft challans, and confirmed challans.

It is powered by a dashboard summary API.  
I can also see low-stock items and recent challans here, with quick links to create customers, products, or challans.

---

## 4. Role-based access (1–1.5 min)

### Admin

**Say:**

As Admin, I have full access to all modules — Customers, Products, Inventory, and Sales Challans.

**Do:** Click each sidebar item quickly.

### Sales

**Do:** Logout → login as `sales@test.com` / `Sales@123`

**Say:**

Now I am logged in as Sales.  
Sales can manage customers and sales challans, and can view products and stock.  
Sales should not create products — that belongs to Warehouse.

**Do:** Show Customers + Challans. Optionally show product create is blocked.

### Warehouse

**Do:** Logout → login `warehouse@test.com` / `Warehouse@123`

**Say:**

Warehouse focuses on products, inventory, and stock movements.  
Warehouse can perform Stock In and maintain product data.

### Accounts

**Do:** Logout → login `accounts@test.com` / `Accounts@123`

**Say:**

Accounts is mostly read-only — viewing customers, products, and challans for operational visibility.

Important point: UI hiding is not the real security. Authorization is enforced in the backend APIs as well.

**Do:** Login back as Admin or Warehouse for the next parts.

---

## 5. Customer CRM module (1–1.5 min)

**Do:** Login Sales or Admin → Customers.

**Say:**

This is the Customer CRM module.  
I can search customers, filter by status and customer type, and paginate results.

**Do:** Search `ABC`. Open ABC Distributors.

**Say:**

Here is the customer detail page — contact info, business name, GST, address, status, follow-up date, and notes.

I will add a follow-up note.

**Do:** Add note: `Demo call — interested in monitors` + date → submit.

**Say:**

Follow-ups are stored in a separate follow-up table with the user who created them.

I can also create and edit customers with validation for required fields like name, mobile, type, and status. GST is optional.

**Optional:** Open Add customer form briefly, then cancel.

---

## 6. Products module (1 min)

**Do:** Open Products list.

**Say:**

This is the Products module.  
Each product has name, SKU, category, unit price, current stock, minimum stock alert, and warehouse location.

SKU is unique.  
If current stock is less than or equal to the minimum alert, the product is marked as low stock.

**Do:** Search `MON-001` / open Samsung Monitor.

**Say:**

Samsung Monitor was seeded with SKU MON-001 and unit price 12,000.  
Prices are configured on the product itself — either from seed data or when creating or editing a product. There is no separate pricing screen.

**Do:** Toggle Low stock only filter once.

---

## 7. Inventory / Stock In (1.5–2 min) — CRITICAL

**Do:** Login Warehouse (if needed) → Inventory.

**Say:**

This is Inventory.  
I can see current stock, low-stock badges, and recent stock movements.

Now I will perform Stock In for Samsung Monitor.

**Do:**
1. Select Samsung Monitor
2. Qty `20`
3. Reason `Purchase received`
4. Click Stock In

**Say:**

Stock In increases available quantity and creates an IN movement record with reason, quantity, user, and timestamp.

If stock was 50, it should now be 70.  
Every stock change must create a movement history entry — that is an important requirement of this case study.

**Do:** Products → Samsung Monitor → show movement history (Opening stock + Purchase received).

**Say:**

Invalid quantities like zero are rejected by validation.

---

## 8. Sales Challan — full business demo (3–4 min) — MOST IMPORTANT

**Do:** Login Sales or Admin → Sales Challans → Create.

### 8A. Create Draft

**Say:**

Now the most important business flow — Sales Challan.

I will select customer ABC Distributors, add Samsung Monitor with quantity 10, and save as Draft.

**Do:** Save Draft. Note challan number `SC-......`

**Say:**

Draft challan is created with an auto-generated challan number starting with SC.

Important: Draft must not reduce stock.

**Do:** Go to Inventory/Products and show Samsung stock still unchanged (e.g. 70).

### 8B. Confirm

**Do:** Open that draft → click Confirm.

**Say:**

When I confirm, the backend checks stock inside a database transaction.  
If stock is sufficient, it reduces stock, creates OUT movements, and marks the challan as Confirmed.

If anything fails, the entire transaction rolls back — no partial updates.

**Do:** Show status CONFIRMED, stock reduced (e.g. 60), and OUT movement reason `Sales Challan SC-...`

### 8C. Insufficient stock

**Do:** Create another challan, qty `1000`, Save Draft → Confirm.

**Say:**

Now I am trying to confirm a quantity larger than available stock.

The system must reject this with a clear error, keep the challan as Draft, and leave stock unchanged.

**Do:** Show error + stock unchanged + status Draft.

### 8D. Snapshot

**Do:** Open an older challan (or create a small draft first). Edit product name/price. Come back to challan.

**Say:**

Challan items store product snapshots — product name, SKU, and unit price at the time of creation.

Even if I later change the product price or name, the old challan still shows the original values.  
This is required so historical documents remain accurate.

### 8E. Cancel rule

**Say:**

Only Draft challans can be cancelled.  
Confirmed challans cannot be cancelled in this design — that is documented as a known limitation.

**Do:** Show Confirmed challan has no Cancel button; Draft has Cancel.

---

## 9. Backend quality points (45 sec)

**Say while showing Postman or README:**

APIs follow a consistent response format with success, message, and data.  
I used Zod validation, proper HTTP status codes, pagination, search and filters, Helmet, CORS, and environment variables.

I also prepared a Postman collection and a detailed README with setup, credentials, business logic, and deployment notes for Render, Vercel, and Neon.

**Do:** Open `postman/NexusOps.postman_collection.json` or `README.md` for a few seconds.

---

## 10. Closing (30–40 sec)

**Say:**

To summarize:  
I delivered a working full-stack Mini ERP and CRM with authentication, role-based access, customer CRM, products, inventory stock movements, and sales challans with transactional stock control.

The application runs locally with PostgreSQL, and is deployment-ready using environment variables.

Thank you.

**Do:** End on Dashboard or README.

---

## One-line cheat sheet

| Section | Key line |
|---------|----------|
| Intro | Mini ERP/CRM for wholesale, 4 roles |
| Auth | JWT + roles |
| CRM | Search, detail, follow-ups |
| Products | Price on product, low-stock flag |
| Stock In | 50→70 + IN movement |
| Draft | Stock does NOT change |
| Confirm | Stock reduces + OUT + transaction |
| Fail | No partial update |
| Snapshot | Old challan keeps old price/name |

---

## Ideal 10-minute examiner path

1. Login Admin  
2. Dashboard glance  
3. Stock In Samsung Monitor +20 → 70  
4. Create challan ABC + Monitor qty 10 → Save Draft → stock still 70  
5. Confirm → stock 60 + OUT movement  
6. Draft qty 1000 → Confirm fails → stock still 60  
7. Rename product → old challan still shows old name/price  
8. Logout → login Sales / Warehouse / Accounts quickly to show roles  
