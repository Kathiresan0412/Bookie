# WhatsApp Salon Booking System

A fully automated salon booking system using WhatsApp Business API, perfect for managing 100+ daily appointments with zero cost.

## 🌟 Features

### For Customers
- ✅ Book appointments via WhatsApp
- ✅ View available time slots
- ✅ Receive instant booking confirmation
- ✅ Get automated reminders 1 hour before appointment
- ✅ Cancel/reschedule easily

### For Admins
- ✅ View all bookings
- ✅ Modify schedules
- ✅ Block/unblock time slots
- ✅ Automated daily reports
- ✅ Google Sheets dashboard

## 🏗️ Technology Stack

- **Framework**: Next.js 14 (React)
- **Backend**: Next.js API Routes
- **Database**: Google Sheets (Free)
- **Messaging**: WhatsApp Business API (Meta Cloud API)
- **Hosting**: Render.com / Vercel (Free tier)
- **Automation**: Node-cron for scheduling

## 📋 Prerequisites

1. **WhatsApp Business Account**
   - Facebook/Meta Business Account
   - Phone number for WhatsApp Business

2. **Google Account**
   - For Google Sheets and Service Account

3. **Render.com Account** (or similar hosting)
   - Free tier available

## 🚀 Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd whatsapp-salon-booking
npm install
```

### Step 2: Set Up Google Sheets

1. Create a new Google Sheet
2. Create 4 tabs with these exact names:
   - `Bookings`
   - `TimeSlots`
   - `Services`
   - `Settings`

3. **Bookings Tab** - Add headers:
   ```
   Booking ID | Customer Name | Phone | Service | Date | Time | Status | Created At
   ```

4. **TimeSlots Tab** - Add headers:
   ```
   Date | Time | Status | Booking ID
   ```

5. **Services Tab** - Add this data:
   ```
   Service Name | Duration (min) | Price
   Haircut      | 30             | $20
   ```

6. **Settings Tab** - Add this data:
   ```
   Key               | Value
   shop_open_time    | 09:00
   shop_close_time   | 18:00
   slot_duration     | 30
   admin_password    | admin123
   ```

### Step 3: Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (e.g., "Salon Booking")
3. Enable Google Sheets API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name it (e.g., "salon-booking-bot")
   - Click "Create and Continue"
   - Skip optional steps
   - Click "Done"

5. Create Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create New Key"
   - Choose "JSON"
   - Download the file

6. Share Google Sheet:
   - Open the JSON file
   - Copy the `client_email` value
   - Go to your Google Sheet
   - Click "Share"
   - Paste the email
   - Give "Editor" access
   - Click "Send"

### Step 4: Set Up WhatsApp Business API

#### Using Meta Cloud API (Recommended - Free)

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" → "Next"
4. Fill in details:
   - App Name: "Salon Booking Bot"
   - Contact Email: Your email
   - Click "Create App"

5. Add WhatsApp Product:
   - In the app dashboard, find "WhatsApp"
   - Click "Set Up"

6. Get Test Number:
   - You'll see a test phone number provided by Meta
   - Add your phone number to test with
   - You can send messages to yourself for testing

7. Get Credentials:
   - Go to "WhatsApp" → "API Setup"
   - Copy the **Phone Number ID**
   - Copy the **Temporary Access Token** (for testing)
   - For production, you'll need to create a **System User Token**

8. Set Up Webhook:
   - You'll need your webhook URL (get this after deploying to Render)
   - For now, we'll come back to this

### Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```env
   # WhatsApp Configuration
   WHATSAPP_TOKEN=your_access_token_from_meta
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   VERIFY_TOKEN=mysecretverifytoken123  # Choose any random string

   # Google Sheets Configuration
   GOOGLE_SHEET_ID=your_google_sheet_id  # From sheet URL
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPaste your key here\n-----END PRIVATE KEY-----\n"

   # Admin Configuration
   ADMIN_PASSWORD=admin123
   ADMIN_PHONE_NUMBER=+1234567890  # Your admin phone number

   # Server
   PORT=3000
   ```

3. How to get values:
   - **GOOGLE_SHEET_ID**: From your sheet URL (between `/d/` and `/edit`)
   - **GOOGLE_SERVICE_ACCOUNT_EMAIL**: From the JSON file (`client_email`)
   - **GOOGLE_PRIVATE_KEY**: From the JSON file (`private_key`) - keep the quotes and \n characters

### Step 6: Initialize Time Slots

```bash
npm run init-slots
```

This will create time slots for the next 7 days.

### Step 7: Test Locally

```bash
npm run dev
```

The server should start on `http://localhost:3000`

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

### Step 8: Deploy to Render.com

1. Go to [Render.com](https://render.com)
2. Sign up/Login
3. Click "New" → "Web Service"
4. Connect your GitHub repository (or use "Public Git repository")
5. Configure:
   - **Name**: salon-booking-bot
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Add Environment Variables:
   - Click "Advanced"
   - Add all variables from your `.env` file

7. Click "Create Web Service"

8. Wait for deployment (2-3 minutes)

9. Copy your webhook URL:
   ```
   https://your-app-name.onrender.com/api/webhook
   ```

### Step 9: Configure WhatsApp Webhook

1. Go back to Meta for Developers
2. Go to WhatsApp → Configuration
3. Click "Edit" next to Webhook
4. Enter:
   - **Callback URL**: `https://your-app-name.onrender.com/api/webhook`
   - **Verify Token**: Same as `VERIFY_TOKEN` in your `.env`
5. Click "Verify and Save"

6. Subscribe to Webhook Fields:
   - Check: `messages`
   - Click "Subscribe"

### Step 10: Test Your Bot!

1. Send "Hi" to your WhatsApp Business number
2. You should receive the welcome message
3. Follow the booking flow
4. Check your Google Sheet to see the booking

## 📱 Usage

### For Customers

**Start a booking:**
```
Hi
```

**Cancel a booking:**
```
CANCEL BK00001
```

### For Admins

**Access admin panel:**
```
ADMIN admin123
```

**Admin options:**
- 1️⃣ View Today's Bookings
- 2️⃣ View Tomorrow's Bookings
- 3️⃣ Block Time Slot
- 4️⃣ View All Bookings
- 5️⃣ Exit Admin

## 🔧 Configuration

### Business Hours

Edit the `Settings` tab in your Google Sheet:
```
shop_open_time: 09:00
shop_close_time: 18:00
```

### Slot Duration

Change in `Settings` tab:
```
slot_duration: 30  (in minutes)
```

### Services

Add more services in `Services` tab:
```
Service Name      | Duration | Price
Haircut           | 30       | $20
Haircut & Beard   | 45       | $30
Kids Haircut      | 20       | $15
```

## 🤖 Automated Features

### Reminders
- Runs every 5 minutes
- Sends reminder 1 hour before appointment
- Automatically updates booking status

### Slot Generation
- Runs daily at midnight
- Creates slots for 7 days ahead
- Based on business hours

### Cleanup
- Runs daily at 1 AM
- Archives old bookings
- Keeps database optimized

## 📊 Monitoring

### Check Server Health
```bash
curl https://your-app.onrender.com/api/health
```

### View Logs (Render)
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab

### Monitor Google Sheet
- All bookings appear in real-time
- Use filters to view specific dates
- Export for accounting

## 🐛 Troubleshooting

### Messages Not Sending

1. **Check WhatsApp Token:**
   ```bash
   # Token expires after 24 hours in test mode
   # Generate a new one from Meta Dashboard
   ```

2. **Verify Webhook:**
   ```bash
   curl https://your-app.onrender.com/api/webhook
   # Should return 403 (normal behavior)
   ```

3. **Check Render Logs:**
   - Look for errors in the logs
   - Check if environment variables are set

### Reminders Not Working

1. **Check if scheduler is running:**
   - Look for "Starting reminder scheduler" in logs

2. **Test manually:**
   ```javascript
   // Add this to test reminders
   const { getBookingsForReminders } = require('./sheets');
   const bookings = await getBookingsForReminders();
   console.log(bookings);
   ```

### Double Bookings

- Usually caused by simultaneous requests
- The code has basic locking
- For high traffic, consider upgrading to a proper database

### Google Sheets Quota

Free tier limits:
- 100 requests per 100 seconds per user
- For 100+ appointments, you're fine
- For 500+, consider upgrading to PostgreSQL

## 💰 Cost Breakdown

### Free Tier (100 appointments/day)
- **WhatsApp**: Free (1000 messages/month)
- **Google Sheets**: Free
- **Render Hosting**: Free (750 hours/month)
- **Total**: $0/month ✅

### Scaling (500 appointments/day)
- **WhatsApp**: ~$5/month
- **Hosting**: $7/month (upgrade from free)
- **Database**: $0 (stick with Sheets) or $5 (PostgreSQL)
- **Total**: ~$12-17/month

## 🎯 Next Steps

### Phase 1 (Current)
- ✅ Basic booking system
- ✅ Automated reminders
- ✅ Admin panel

### Phase 2 (Future)
- ⬜ Payment integration
- ⬜ Multiple barbers/chairs
- ⬜ Web dashboard
- ⬜ SMS fallback
- ⬜ Analytics dashboard

### Phase 3 (Advanced)
- ⬜ Mobile app
- ⬜ AI-powered scheduling
- ⬜ Customer loyalty program
- ⬜ Inventory management

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Render logs
3. Test with WhatsApp test number first
4. Verify all environment variables

## 📄 License

MIT License - Feel free to use for your salon!

## 🙏 Credits

Built with:
- Express.js
- WhatsApp Business API
- Google Sheets API
- Node-cron

---

**Happy Booking! 💈✂️**
