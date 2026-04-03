# Finance Data Processing and Access Control Backend

A production-ready REST API built with **Node.js**, **Express**, and **MongoDB**. Designed for secure financial tracking with Role-Based Access Control (RBAC).

---

## Core Functionalities
* **User Auth:** Secure JWT-based Authentication with Bcrypt password hashing.
* **Transaction CRUD:** Full Create, Read, Update, and Delete capabilities.
* **Financial Dashboard:** Advanced MongoDB Aggregation for `Income`, `Expenses`, and `Net Balance`.
* **Role-Based Access (RBAC):** * **Admin:** Full System Access.
    * **Analyst:** View Data + Dashboard (Restricted Write).
    * **Viewer:** Read-only (Restricted Dashboard/Write).

---

## Advanced Features (Extra)
* **Pagination:** Efficient data fetching using `page` and `limit` parameters.
* **Global Search:** Case-insensitive keyword search in descriptions/categories.
* **Soft Delete:** Uses an `isDeleted` flag to preserve data for audit trails.
* **Rate Limiting:** Security middleware preventing API abuse (100 req/15 min).
* **Unit Testing:** Financial math verified via **Jest** testing framework.

---

## API Endpoints

### Authentication
| Endpoint | Method | Access |
| :--- | :--- | :--- |
| `/api/users/register` | `POST` | Public |
| `/api/users/login` | `POST` | Public |

### Transactions
| Endpoint | Method | Query Params | Access |
| :--- | :--- | :--- | :--- |
| `/api/transactions` | `GET` | `page`, `limit`, `search`, `type` | All Roles |
| `/api/transactions/summary` | `GET` | None | Admin/Analyst |
| `/api/transactions` | `POST` | JSON Body | Admin |
| `/api/transactions/:id` | `PUT` | JSON Body | Admin |
| `/api/transactions/:id` | `DELETE` | None | Admin (Soft Delete) |

---

## Assumptions & Tradeoffs

### Assumptions Made:
* **Currency:** All transactions are assumed to be in a single currency (e.g., INR) as multi-currency support was out of scope.
* **Soft Delete:** Assumed that "deleted" records should be hidden from all users, including Admins, unless explicitly queried by a super-user.
* **Date Handling:** Transactions default to the current system date if no date is provided in the request.

### Tradeoffs Considered:
* **Soft Delete vs Hard Delete:** Chose **Soft Delete** to maintain data integrity and audit trails, though it slightly increases database storage over time.
* **No Swagger UI:** Opted for a detailed `README.md` and `Hoppscotch` testing over Swagger to keep the production build lightweight.
* **Simple Rate Limiting:** Used memory-store rate limiting. For a massive scale-up, a Redis-based store would be preferred to handle multiple server instances.

---

## Setup & Installation
1.  **Clone the Repository.**
2.  **Install:** `npm install`
3.  **Environment:** Create a `.env` file with `MONGO_URI` and `JWT_SECRET`.
4.  **Test:** Run `npm test` to verify financial logic.
5.  **Start:** `npm start` (Production) or `npm run dev` (Development).

---

## Assessment Checklist
- [x] Secure JWT Authentication & RBAC
- [x] Complex MongoDB Aggregations (Dashboard)
- [x] Search, Pagination, & Soft Delete
- [x] API Security (Rate Limiting)
- [x] Unit Tested Codebase (Jest)