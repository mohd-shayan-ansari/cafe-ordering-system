# Cafe Website - Complete Guide

## ✅ What's Built

A full-stack cafe ordering system with:

### Customer Features
- **Signup/Login**: Phone + password authentication, optional profile photo
- **Menu Browsing**: View available items with name, price, description, and images
- **Cart**: Add items with quantities, adjust, and checkout
- **Order Placement**: Submit orders (cash payment; no online gateway)
- **QR Code**: Receive unique QR code after placing order
- **Order Tracking**: Real-time status updates (Placed → PaymentReceived → Preparing → Ready → HandedOver)
- **Profile**: View and manage personal details

### Staff Features
- **Secure Login**: Separate staff login (testervip / checkkro)
- **Order Dashboard**: View all active orders with customer details (name, phone, photo)
- **QR Scanner**: Scan customer QR codes to retrieve orders
- **Status Management**: Update order status through workflow (mark payment received → start preparing → ready → hand over)
- **Menu Management**: Toggle item availability on/off
- **Real-time Updates**: Auto-refresh orders and menu (5s polling)

### Technical Stack
- **Frontend/Backend**: Next.js 16 (App Router, TypeScript)
- **Database**: MongoDB Atlas (connected and seeded)
- **Auth**: JWT + HTTP-only cookies
- **QR**: `qrcode` for generation, `@yudiel/react-qr-scanner` for scanning
- **Styling**: Tailwind CSS

---

## 🚀 Quick Start

### 1. Environment Setup (Already Done)
Your `.env.local` is configured with:
- MongoDB URI (connected to your Atlas cluster)
- Session secret
- Staff credentials

### 2. Install & Run
```bash
cd "F:\cafe website\cafe-app"
npm install
npm run dev
```

App runs at: **http://localhost:3000**

### 3. Initial Setup (Already Done)
Database seeded with 7 menu items:
- Coffee (₹50)
- Tea (₹30)
- Sandwich (₹80)
- Burger (₹120)
- Pizza Slice (₹60)
- Samosa (₹20)
- Cold Drink (₹40)

---

## 📱 How to Use

### Customer Flow
1. Visit **http://localhost:3000**
2. Click **Customer Signup**
3. Enter phone (e.g., 9876543210), name, password, optional photo URL
4. Browse menu at `/menu`
5. Add items to cart, adjust quantities
6. Click **Place Order**
7. Receive QR code on `/order/[id]` page
8. Show QR to staff

### Staff Flow
1. Visit **http://localhost:3000**
2. Click **Staff Login**
3. Enter:
   - Username: `testervip`
   - Password: `checkkro`
4. Dashboard shows all orders and menu items
5. Click **Scan QR** to scan customer's QR code
6. View customer details (photo, name, phone) and order items
7. Progress order through statuses:
   - **Mark Payment Received** (after scanning QR)
   - **Start Preparing** (kitchen begins work)
   - **Mark Ready** (order complete)
   - **Hand Over** (customer receives order)
8. Toggle menu item availability by clicking status buttons

---

## 🔐 Security

- Separate auth for customers and staff
- Staff credentials stored in environment variables (later move to DB)
- JWT sessions with HTTP-only cookies
- Role-based access control (customers can't access staff routes)

---

## 🌐 Deployment Prep

### For Vercel/Netlify
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables:
   - `MONGODB_URI`
   - `SESSION_SECRET` (generate secure random string)
   - `STAFF_USERNAME`
   - `STAFF_PASSWORD`
4. Deploy

### For Custom Domain
- Configure DNS A/CNAME records to point to deployment platform
- Add domain in platform settings

---

## 📂 Project Structure

```
cafe-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home (login options)
│   │   ├── login/page.tsx           # Customer login
│   │   ├── signup/page.tsx          # Customer signup
│   │   ├── menu/page.tsx            # Menu + cart
│   │   ├── order/[id]/page.tsx      # Order QR display
│   │   ├── orders/page.tsx          # Customer orders list
│   │   ├── profile/page.tsx         # Customer profile
│   │   ├── staff/
│   │   │   ├── login/page.tsx       # Staff login
│   │   │   └── dashboard/page.tsx   # Staff dashboard
│   │   └── api/
│   │       ├── auth/                # Auth endpoints
│   │       ├── menu/                # Menu CRUD
│   │       ├── orders/              # Order CRUD
│   │       └── health/              # Health check
│   ├── lib/
│   │   ├── db.ts                    # MongoDB connection
│   │   └── auth.ts                  # Auth utilities
│   └── models/
│       ├── User.ts                  # User schema
│       ├── MenuItem.ts              # Menu item schema
│       └── Order.ts                 # Order schema
├── scripts/
│   └── seed.js                      # Database seeder
├── .env.local                       # Environment variables
└── package.json
```

---

## 🛠️ Next Steps (Optional)

1. **SMS OTP**: Integrate Twilio for phone verification
2. **Image Uploads**: Use Cloudinary/AWS S3 for profile photos and menu images
3. **Staff Management**: Move staff credentials to database with admin panel
4. **Order History**: Archive completed orders for analytics
5. **Notifications**: Add push notifications for order status changes
6. **Analytics**: Track popular items, peak hours, revenue

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI in `.env.local`
- Check Atlas IP whitelist (allow 0.0.0.0/0 for dev)

### QR Scanner Not Working
- Ensure HTTPS in production (camera requires secure context)
- Grant camera permissions in browser

### Staff Can't Log In
- Verify credentials in `.env.local` match testervip / checkkro
- Check console for API errors

---

## 📞 Support

All features are complete and functional. Test the full flow:
1. Sign up as customer
2. Place an order
3. Login as staff (testervip / checkkro)
4. Scan QR (or click order directly in dashboard)
5. Progress order through statuses
6. Toggle menu item availability

The app is ready for deployment!
