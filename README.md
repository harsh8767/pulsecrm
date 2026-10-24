# 📈 PulseCRM

![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-Routing-CA4245?logo=reactrouter&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-22b5bf)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%20Cookies-black?logo=jsonwebtokens)
![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render)

A full-stack **customer analytics CRM** built with **React, Express, and PostgreSQL**. Users create an account, manage their own customers, track deals and customer status, and review live analytics on a dashboard.

I built PulseCRM to learn React by building a real product: component design, state management, routing, a REST API, a relational database, and authentication.

---

# 🚀 Live Demo

🌐 **Try the application here**

[**Open PulseCRM**](https://pulsecrm-zp1v.onrender.com/customers)

> The app runs on a free hosting tier, so the **first load after a period of inactivity can take up to a minute**. After that it responds normally.

Create an account (use any email and a throwaway password), then click **Load sample customers** to explore with data.

---

# 📌 Overview

Small teams often track customers in spreadsheets, which makes it hard to see which customers are active, which deals are open, and how the business is changing month to month.

PulseCRM brings that into one place:

- A **dashboard** with key customer and revenue metrics
- A **customer list** with search, filters, and status management
- A **customer detail page** with editing and notes
- A **deals view** of the open pipeline
- **Reports** that break customers down by status
- **Private accounts**, where each user sees only their own data

```text
Browser (React app)
       │
       ▼
 React Router ──► Pages (Dashboard, Customers, Deals, Reports)
       │
       ▼
   REST API (Express)
       │
 ┌─────┴───────────┐
 ▼                 ▼
Auth (JWT cookie)  Customer routes
                       │
                       ▼
              PostgreSQL (Neon)
```

---

# ⭐ Project Highlights

- 🔐 Sign-up, login, and logout with hashed passwords and cookie-based sessions
- 🧱 Per-user data isolation: every query is scoped to the logged-in user
- 📊 Dashboard with month-over-month comparisons and a customers-per-month chart
- 👥 Customer management: search, filter, add, edit, delete, change status
- 📝 Notes on each customer
- 💼 Deals pipeline and status reports with charts
- 🧭 Client-side routing with real URLs and a not-found page
- ⏳ Loading and error states for every API call
- 🧩 Reusable components and custom hooks
- 🚀 One deployable service: the Express server also serves the built React app

---

# ✨ Features

### 📊 Dashboard

- Total customers, with new customers this month compared with last month
- Total deal value, with the value added this month
- Churn rate and active-customer share
- Bar chart of new customers per month (Recharts)
- A "Recently added" list that links to each customer

Trend colors are calculated from real dates. Metrics that have no honest history, such as churn, show a plain fact instead of a made-up trend.

---

### 👥 Customers

- Search by name or company
- Filter by status (Active, Lead, Churned)
- Add a customer from a slide-open panel
- Change status inline from a colored dropdown
- Delete a customer
- Result count, empty state, and a "clear filters" button

---

### 🧾 Customer Detail

- Edit name, company, and deal value, with a draft that can be cancelled
- Add and delete notes
- Customer URLs such as `/customers/12`, which survive a page refresh

---

### 💼 Deals

- Open deals are customers with the **Lead** status
- Pipeline value, average deal size, and won value
- Deals ranked by size, with a bar showing each deal against the largest

---

### 📈 Reports

- Donut chart of customers by status
- Breakdown table with customer count, share, and deal value per status
- Top five customers by deal value

---

### 🔐 Authentication and Authorization

- **Authentication:** passwords are salted and hashed with `scrypt`, and a signed JWT is stored in an **httpOnly cookie**, so JavaScript on the page cannot read it
- **Authorization:** every customer row has an `owner_id`, and every query includes it, so a user can never read or change another user's data, even by guessing an id
- Login errors are deliberately vague ("Incorrect email or password") so the form cannot be used to discover which emails have accounts
- New accounts start with an empty workspace and an optional button to load sample customers

---

# 🧠 Application Flow

```text
Open app
   │
   ▼
Check session (GET /api/auth/me)
   │
 ┌─┴───────────────┐
 ▼                 ▼
Logged out       Logged in
 │                 │
 ▼                 ▼
Login / Sign up   Workspace
                   │
                   ▼
        Load customers (GET /api/customers)
                   │
                   ▼
   Dashboard · Customers · Deals · Reports
```

---

# 🛠️ Tech Stack

| Category | Technology |
|---|---|
| 🎨 Frontend | React, Vite |
| 🧭 Routing | React Router |
| 📈 Charts | Recharts |
| 🖥️ Backend | Node.js, Express |
| 🗄️ Database | PostgreSQL (hosted on Neon) |
| 🔌 Database Driver | node-postgres (`pg`) |
| 🔐 Authentication | JSON Web Tokens, `cookie-parser`, Node `crypto` (scrypt) |
| 🧹 Code Quality | ESLint |
| 🔧 Version Control | Git |
| ☁️ Hosting | Render (app), Neon (database) |

---

# 🗄️ Database

Two tables:

**users**

| Column | Type |
|---|---|
| id | serial, primary key |
| email | text, unique |
| name | text |
| password_hash | text |
| created_at | timestamp |

**customers**

| Column | Type |
|---|---|
| id | serial, primary key |
| name | text |
| company | text |
| status | text (Active, Lead, Churned) |
| deal_value | integer |
| created_at | date |
| notes | jsonb |
| owner_id | integer, references users(id) |

All queries use parameterized SQL, which prevents SQL injection.

---

# 🔌 API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account and start a session |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | End the session |
| GET | `/api/auth/me` | Return the current user |
| GET | `/api/customers` | List the user's customers |
| POST | `/api/customers` | Add a customer |
| POST | `/api/customers/sample` | Load sample customers into an empty workspace |
| PATCH | `/api/customers/:id` | Update name, company, status, deal value, or notes |
| DELETE | `/api/customers/:id` | Delete a customer |

Every `/api/customers` route requires a valid session.

---

# 📂 Project Structure

```text
pulsecrm/
│
├── server/
│   ├── server.js          Express API, auth, and static file serving
│   └── setup.js           Creates the database tables
│
├── src/
│   ├── main.jsx           Mounts the app inside BrowserRouter
│   ├── App.jsx            Auth gate: login page or workspace
│   ├── Workspace.jsx      Layout and routes
│   ├── index.css          Styles and design tokens
│   │
│   ├── components/
│   │   ├── AddCustomerForm.jsx
│   │   ├── Avatar.jsx
│   │   ├── CustomerRow.jsx
│   │   ├── KpiCard.jsx
│   │   └── Sidebar.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useCustomers.js
│   │
│   └── pages/
│       ├── AuthPage.jsx
│       ├── CustomerDetailPage.jsx
│       ├── CustomersPage.jsx
│       ├── DashboardPage.jsx
│       ├── DealsPage.jsx
│       └── ReportsPage.jsx
│
├── public/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── .gitignore
└── README.md
```

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/harsh8767/pulsecrm.git
```

## 2. Navigate into the Project

```bash
cd pulsecrm
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Create a Database

Create a free PostgreSQL database (for example on [Neon](https://neon.com)) and copy its connection string.

## 5. Add Environment Variables

Create a file named `.env` in the project root:

```text
DATABASE_URL=your-postgres-connection-string
JWT_SECRET=a-long-random-string
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> `.env` is listed in `.gitignore`. Never commit it.

## 6. Create the Tables

```bash
npm run db:setup
```

---

# ▶️ Run the Application

### Development

Run these in two terminals:

```bash
npm run server    # API on http://localhost:3001
npm run dev       # app on http://localhost:5173
```

Vite proxies `/api` requests to the Express server.

### Production Mode

```bash
npm run build
npm run server
```

Open `http://localhost:3001`. The Express server serves both the API and the built React app.

---

# ☁️ Deployment

PulseCRM is deployed as a **single web service on Render**, with a **PostgreSQL database on Neon**.

| Setting | Value |
|---|---|
| Build command | `npm install --include=dev && npm run build` |
| Start command | `node server/server.js` |

Environment variables set on the host:

```text
DATABASE_URL
JWT_SECRET
NODE_ENV=production
```

With `NODE_ENV=production`, the session cookie is sent only over HTTPS.

---

# 📌 How to Use the Application

### Step 1

Open the app and click **Create an account**.

### Step 2

Click **Load sample customers**, or add your first customer on the **Customers** page.

### Step 3

Explore the **Dashboard**, then open **Customers**, **Deals**, and **Reports**.

### Step 4

Click a customer's name to edit their details and add notes.

### Step 5

Change a status from the dropdown and watch the Dashboard, Deals, and Reports update.

---

# 💡 Key Insights

What this project demonstrates:

- **Lifting state up:** shared data lives in one parent and flows down as props
- **Derived values:** counts, percentages, and totals are calculated from the customer list instead of being stored as extra state
- **Immutable updates:** state is replaced with new arrays and objects, never edited in place
- **Custom hooks:** data fetching and auth logic live in `useCustomers` and `useAuth`, so pages stay focused on layout
- **Authorization in the query:** ownership is enforced in SQL with `WHERE id = $1 AND owner_id = $2`, not in the UI
- **Honest metrics:** cards show a trend only when the data supports one
- **Single-service deployment:** the API and the built frontend ship together, which avoids cross-origin cookie problems

---

# ⚠️ Limitations

- Each user has a private workspace. There are no shared organizations or role-based permissions, so every account can edit everything in its own workspace.
- There is no email verification and no password reset.
- Login attempts are not rate-limited.
- Status changes are not recorded, so churn and active-customer cards show current facts, not trends.
- Sample customers are demo data, loaded on request.
- The free hosting tier sleeps when idle, so the first request after inactivity is slow.
- There is no automated test suite yet.

---

# 🚀 Future Improvements

- Organizations with roles (admin, member, viewer) and invitations
- Status history for real churn trends
- Rate limiting and email verification
- Password reset by email
- CSV import and export
- Automated tests for the API and key components
- TypeScript migration
- Pagination for large customer lists

---

# 🙏 Acknowledgements

This project makes use of the following open-source technologies:

- React
- Vite
- React Router
- Recharts
- Express
- node-postgres
- PostgreSQL
- JSON Web Tokens
- ESLint
- Git

---

# 👨‍💻 Developer

## Harsh Chavan

Computer Engineering Student

Passionate about **Artificial Intelligence, Machine Learning, Data Analytics, SQL, Power BI, and Python Development**.

### GitHub

https://github.com/harsh8767

### LinkedIn

https://www.linkedin.com/in/harsh-chavan-1646a2257/

---

# 📜 License

This project is licensed under the MIT License.

See the `LICENSE` file for more information.
