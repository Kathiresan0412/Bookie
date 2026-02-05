# Deployment Checklist - WhatsApp Salon Booking System

## ✅ Pre-Deployment Checklist

### 1. Google Sheets Setup
- [ ] Created Google Sheet with ID: _______________
- [ ] Added 4 tabs: Bookings, TimeSlots, Services, Settings
- [ ] Added headers to all tabs
- [ ] Added service data (Haircut)
- [ ] Added settings data (business hours)

### 2. Google Service Account
- [ ] Created Google Cloud project
- [ ] Enabled Google Sheets API
- [ ] Created service account
- [ ] Downloaded JSON key file
- [ ] Shared Google Sheet with service account email
- [ ] Given Editor permissions

### 3. WhatsApp Business API
- [ ] Created Meta Developer account
- [ ] Created Business App
- [ ] Added WhatsApp product
- [ ] Got Phone Number ID: _______________
- [ ] Got Access Token: _______________
- [ ] Added test phone number

### 4. Environment Variables Prepared
- [ ] WHATSAPP_TOKEN
- [ ] WHATSAPP_PHONE_NUMBER_ID
- [ ] VERIFY_TOKEN (create your own)
- [ ] GOOGLE_SHEET_ID
- [ ] GOOGLE_SERVICE_ACCOUNT_EMAIL
- [ ] GOOGLE_PRIVATE_KEY
- [ ] ADMIN_PASSWORD
- [ ] ADMIN_PHONE_NUMBER

## 🚀 Deployment Steps

### Step 1: Deploy to Render
- [ ] Created Render account at render.com
- [ ] Clicked "New" → "Web Service"
- [ ] Connected GitHub repo or used public repo
- [ ] Configured build settings:
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Added all environment variables
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment (2-5 minutes)
- [ ] Copied webhook URL: https://____________.onrender.com/webhook

### Step 2: Configure WhatsApp Webhook
- [ ] Went to Meta for Developers dashboard
- [ ] Selected app
- [ ] Went to WhatsApp → Configuration
- [ ] Clicked "Edit" on Webhook
- [ ] Entered callback URL
- [ ] Entered verify token
- [ ] Clicked "Verify and Save"
- [ ] Subscribed to "messages" field

### Step 3: Initialize Time Slots
- [ ] SSH into Render or run locally
- [ ] Ran: `npm run init-slots`
- [ ] Verified slots created in Google Sheet

### Step 4: Test the System
- [ ] Sent "Hi" to WhatsApp number
- [ ] Received welcome message
- [ ] Completed test booking
- [ ] Verified booking in Google Sheet
- [ ] Tested admin access: `ADMIN admin123`
- [ ] Verified admin panel works

### Step 5: Production Checklist
- [ ] Changed ADMIN_PASSWORD to strong password
- [ ] Set up proper access token (not test token)
- [ ] Verified webhook is receiving messages
- [ ] Checked Render logs for errors
- [ ] Tested reminder system (wait 1 hour)
- [ ] Verified slot generation at midnight

## 🧪 Testing Checklist

### Customer Flow
- [ ] Test: Send "Hi"
- [ ] Test: Select service (1)
- [ ] Test: Select date (1-7)
- [ ] Test: Select time
- [ ] Test: Enter name
- [ ] Test: Confirm phone
- [ ] Test: Receive confirmation
- [ ] Verify: Booking appears in sheet
- [ ] Test: Cancel booking with CANCEL command

### Admin Flow
- [ ] Test: Send "ADMIN password"
- [ ] Test: View today's bookings (1)
- [ ] Test: View tomorrow's bookings (2)
- [ ] Test: View all bookings (4)
- [ ] Test: Exit admin (5)

### Automated Systems
- [ ] Wait for reminder time (or modify booking to test)
- [ ] Verify reminder sent 1 hour before
- [ ] Check slot generation next day
- [ ] Verify no double bookings possible

## 🔍 Monitoring Setup

### Daily Checks (First Week)
- [ ] Check Render logs for errors
- [ ] Verify bookings are created
- [ ] Check reminder delivery
- [ ] Monitor Google Sheets quota usage
- [ ] Test response time

### Weekly Checks
- [ ] Review all bookings
- [ ] Check for any failed reminders
- [ ] Verify slot generation
- [ ] Check error logs
- [ ] Test admin functions

## 🐛 Common Issues & Solutions

### Issue: Webhook verification fails
**Solution:**
- Verify VERIFY_TOKEN matches in both .env and Meta dashboard
- Check webhook URL is correct and accessible
- Try using ngrok for local testing first

### Issue: Messages not sending
**Solution:**
- Verify access token is valid
- Check phone number is test number or verified
- Review Meta Business verification status
- Check Render logs for API errors

### Issue: Bookings not saving
**Solution:**
- Verify Google Sheet is shared with service account
- Check GOOGLE_PRIVATE_KEY formatting (keep \n)
- Test Google Sheets API access separately
- Check for quota limits

### Issue: Reminders not working
**Solution:**
- Verify scheduler is running (check logs)
- Test time calculation logic
- Check booking status is "Confirmed"
- Verify phone numbers are formatted correctly

### Issue: Render app sleeping
**Solution:**
- Free tier apps sleep after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid tier ($7/month)
- Or use a cron job to ping /health every 10 minutes

## 📈 Scaling Preparation

### When you reach 50 bookings/day:
- [ ] Monitor WhatsApp message quota
- [ ] Check Google Sheets API quota
- [ ] Consider caching frequently accessed data
- [ ] Set up proper error logging

### When you reach 100 bookings/day:
- [ ] Upgrade Render to paid tier ($7/month)
- [ ] Consider Redis for caching
- [ ] Implement rate limiting
- [ ] Set up monitoring alerts

### When you reach 500 bookings/day:
- [ ] Migrate from Google Sheets to PostgreSQL
- [ ] Implement queue system for messages
- [ ] Set up load balancing
- [ ] Consider dedicated server

## 💡 Pro Tips

1. **Testing**: Always test with the WhatsApp test number first
2. **Backups**: Export Google Sheet weekly
3. **Monitoring**: Set up UptimeRobot to ping /health endpoint
4. **Documentation**: Keep this checklist updated
5. **Support**: Add your phone number for customer support queries

## 🎉 Launch Day Checklist

### Morning of Launch
- [ ] Verify all systems operational
- [ ] Test complete booking flow
- [ ] Clear any test data
- [ ] Send test reminder to yourself
- [ ] Prepare admin panel on phone

### Announce to Customers
- [ ] Post WhatsApp number on social media
- [ ] Send message to existing customers
- [ ] Update website with booking info
- [ ] Print QR code for in-store

### First Day Monitoring
- [ ] Check logs every hour
- [ ] Monitor booking rate
- [ ] Be ready to handle issues quickly
- [ ] Collect customer feedback

## 📝 Notes

Date Deployed: _______________
Deployed By: _______________
Webhook URL: _______________
Admin Phone: _______________

Issues Encountered:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Solutions Applied:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## ✅ Final Sign-Off

- [ ] All systems tested and working
- [ ] Documentation complete
- [ ] Team trained on admin panel
- [ ] Backup procedures in place
- [ ] Monitoring set up
- [ ] Ready for production! 🚀

**Deployed By:** _______________
**Date:** _______________
**Signature:** _______________
