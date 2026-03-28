# ShopEase — Backend API

Node.js + Express + MongoDB REST API for the ShopEase fashion e-commerce platform.



## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register buyer or seller |
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/logout | User | Logout |
| GET | /api/auth/me | User | Current user |
| PUT | /api/auth/updatepassword | User | Change password |
| POST | /api/auth/forgotpassword | Public | Send reset email |
| PUT | /api/auth/resetpassword/:token | Public | Reset password |
| GET | /api/products | Public | List + search + filter |
| GET | /api/products/featured | Public | Featured products |
| GET | /api/products/stats | Public | Homepage counters |
| GET | /api/products/:id | Public | Single product |
| POST | /api/products | Seller | Create product |
| PUT | /api/products/:id | Seller | Update product |
| DELETE | /api/products/:id | Seller | Delete product |
| GET | /api/cart | User | Get cart |
| POST | /api/cart | User | Add to cart |
| PUT | /api/cart/:itemId | User | Update quantity |
| DELETE | /api/cart/:itemId | User | Remove item |
| DELETE | /api/cart | User | Clear cart |
| POST | /api/orders | User | Place order |
| GET | /api/orders/myorders | User | Order history |
| GET | /api/orders/:id | User | Order detail |
| PUT | /api/orders/:id/status | Seller | Update status |
| POST | /api/reviews/:productId | User | Submit review |
| GET | /api/wishlist | User | Get wishlist |
| POST | /api/wishlist/:productId | User | Toggle wishlist |
| PUT | /api/users/profile | User | Update profile |
| GET | /api/seller/dashboard | Seller | Stats + recent orders |
| GET | /api/seller/products | Seller | Seller's products |
| GET | /api/seller/orders | Seller | Seller's orders |
| POST | /api/payments/create-payment-intent | User | Stripe intent |
| POST | /api/payments/webhook | Stripe | Payment webhook |


