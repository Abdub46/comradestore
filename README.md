# HomeMarket — Second-Hand Household Marketplace (MERN)

A peer-to-peer marketplace for second-hand household items (beds, sofas, kitchen items, electronics, etc.), similar in spirit to Facebook Marketplace or Jiji. There's **no payment processing and no order management** — buyers contact sellers directly on WhatsApp to arrange payment and pickup.

Every account can both buy and sell — there is no separate buyer/seller role.

## Features

- Single account type: sign up, log in, upload/edit/delete products, mark items Available / Reserved / Sold
- Product listings with up to 5 images, category, price, condition, location
- Marketplace browse page with search, category/county/condition/price filters, and pagination
- Product detail page with image gallery, "Add to Cart" and "Contact Seller on WhatsApp" (pre-filled message via `wa.me` link)
- Cart is a local shortlist (no checkout) — just a way to gather items you want to message sellers about
- Seller dashboard ("My Products") — edit, delete, change status, view count
- Editable profile with WhatsApp number, location, avatar
- Dark mode toggle
- Kenyan phone numbers auto-normalized to WhatsApp format (e.g. `0712345678` → `254712345678`)

## Tech Stack

**Frontend:** React, React Router, Axios, React Hook Form, Tailwind CSS, Vite
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT auth, Multer + Cloudinary (image storage), bcryptjs

## Project Structure

```
marketplace/
  server/
    config/       # db.js, cloudinary.js
    models/       # User.js, Product.js
    controllers/  # authController.js, productController.js
    routes/       # authRoutes.js, productRoutes.js
    middleware/   # auth.js, upload.js, errorHandler.js
    utils/        # phoneFormatter.js, generateToken.js
    server.js
  client/
    src/
      components/ # Navbar, Footer, Hero, SearchBar, CategoryList, ProductCard, PrivateRoute, Loader
      pages/      # Home, Login, Register, SearchResults, ProductDetail, SellItem, EditProduct, Dashboard, Profile, Cart, NotFound
      contexts/   # AuthContext, CartContext, ThemeContext
      services/   # api.js, authService.js, productService.js
      utils/      # whatsapp.js, phone.js, format.js
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB database (local `mongod`, or a free MongoDB Atlas cluster)
- A free [Cloudinary](https://cloudinary.com) account (for image uploads)

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials
npm run dev
```
The API runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```
The app runs on `http://localhost:5173` (Vite proxies `/api` requests to the backend).

## API Reference

**Auth**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile        (protected)
PUT    /api/auth/profile        (protected)
```

**Products**
```
GET    /api/products                  ?search=&category=&county=&town=&condition=&status=&minPrice=&maxPrice=&page=&limit=&sort=
GET    /api/products/:id
GET    /api/products/my-listings      (protected)
POST   /api/products                  (protected, multipart/form-data, field name "images", up to 5)
PUT    /api/products/:id              (protected, owner only)
DELETE /api/products/:id              (protected, owner only)
PATCH  /api/products/:id/status       (protected, owner only)   body: { status: "Available" | "Reserved" | "Sold" }
PATCH  /api/products/:id/favorite     (protected)
```

## Notes on Design Decisions

- **No payments / no cart checkout** — as specified, this stays a contact-the-seller model over WhatsApp.
- **Seller info pulled from the account, not re-entered per listing** — the name and WhatsApp number are set once at registration/profile and auto-attached to every product, so the "Sell Item" form only asks for product details.
- **Three-state status (Available / Reserved / Sold)** instead of a simple boolean, so sellers can mark an item as promised to someone without fully closing the listing.
- **Categories** are a fixed enum matching your list (Beds, Sofas, Dining Tables, Office Chairs, Plastic Chairs, TV Stands, Wardrobes, Cupboards, Mattresses, Curtains, Kitchen Items, Gas Cookers, Fridges, Microwaves, Phones, Electronics, Other).

## Not Yet Implemented (from your "Future Improvements" list)

These were intentionally left out of this first build so the core marketplace ships first — the code is structured so they can be added later without a rewrite:
- In-app chat
- Buyer/seller ratings
- Saved searches & notifications
- Admin moderation dashboard
- Premium/boosted listings
- Email verification & password reset
- Seller analytics beyond the basic view counter already included
