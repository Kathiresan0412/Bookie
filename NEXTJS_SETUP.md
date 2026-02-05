# Next.js Setup Guide

This project has been migrated from Express.js to Next.js.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your actual values in `.env.local`.

### 3. Initialize Time Slots

```bash
npm run init-slots
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
Bookie/
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.js      # WhatsApp webhook handler
│   │   └── health/
│   │       └── route.js      # Health check endpoint
│   ├── layout.js             # Root layout (initializes schedulers)
│   └── page.js               # Home page
├── lib/
│   ├── userState.js          # User conversation state management
│   ├── messageHandlers.js    # Message handling logic
│   └── initSchedulers.js     # Scheduler initialization
├── sheets.js                 # Google Sheets integration
├── whatsapp.js               # WhatsApp API functions
├── scheduler.js              # Automated schedulers
├── initSlots.js              # Initialize time slots script
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
└── .env.local                # Environment variables (create from .env.example)
```

## 🔄 Changes from Express.js

### API Routes

- **Before**: `app.get('/webhook', ...)` and `app.post('/webhook', ...)`
- **After**: `app/api/webhook/route.js` with `GET` and `POST` exports

### State Management

- User states are now managed in `lib/userState.js`
- States persist in memory (consider Redis for production scaling)

### Scheduler Initialization

- Schedulers initialize automatically when the app starts
- Handled in `app/layout.js` and `lib/initSchedulers.js`

## 🌐 API Endpoints

### Webhook (WhatsApp)
- **GET** `/api/webhook` - Webhook verification
- **POST** `/api/webhook` - Receive WhatsApp messages

### Health Check
- **GET** `/api/health` - System health status

## 🚢 Deployment

### Render.com

1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add all environment variables from `.env.example`
5. Deploy!

### Vercel

1. Import your repository
2. Add environment variables
3. Deploy automatically

### Other Platforms

Next.js works on any platform that supports Node.js:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Amplify
- etc.

## 📝 Notes

- The old `server.js` file is kept for reference but not used
- All functionality remains the same
- Schedulers run automatically on server startup
- User states are stored in memory (will reset on server restart)

## 🔧 Troubleshooting

### Schedulers Not Running

Check server logs for initialization messages. Schedulers should start automatically.

### Webhook Not Receiving Messages

1. Verify webhook URL: `https://your-domain.com/api/webhook`
2. Check `VERIFY_TOKEN` matches in both `.env.local` and Meta dashboard
3. Ensure webhook is subscribed to "messages" events

### Import Errors

Make sure you're using the correct import syntax:
- API routes: Use `require()` for CommonJS modules
- React components: Use `import` for ES modules

## 🎯 Next Steps

- Consider adding Redis for persistent state management
- Add a web dashboard for admin management
- Implement rate limiting
- Add error tracking (Sentry, etc.)
