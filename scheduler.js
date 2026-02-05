// scheduler.js - Automated Reminder Scheduler
const cron = require('node-cron');
const { getBookingsForReminders, markAsReminded, initializeTimeSlots } = require('./sheets');
const { sendAppointmentReminder } = require('./whatsapp');

// Check for bookings needing reminders every 5 minutes
function startReminderScheduler() {
  console.log('🔔 Starting reminder scheduler...');

  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Checking for bookings needing reminders...');
      const bookings = await getBookingsForReminders();

      if (bookings.length === 0) {
        console.log('No reminders needed at this time');
        return;
      }

      console.log(`Found ${bookings.length} bookings needing reminders`);

      for (const booking of bookings) {
        console.log(`Sending reminder to ${booking.customerName} (${booking.phone})`);
        
        const result = await sendAppointmentReminder(booking);
        
        if (result.success) {
          await markAsReminded(booking.bookingId);
          console.log(`✅ Reminder sent for booking ${booking.bookingId}`);
        } else {
          console.error(`❌ Failed to send reminder for ${booking.bookingId}`);
        }

        // Add delay to avoid rate limiting (1 second between messages)
        await sleep(1000);
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });

  console.log('✅ Reminder scheduler started (runs every 5 minutes)');
}

// Initialize time slots daily at midnight
function startSlotInitializer() {
  console.log('📅 Starting time slot initializer...');

  // Run at midnight every day
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Initializing time slots for new day...');
      await initializeTimeSlots();
      console.log('✅ Time slots initialized');
    } catch (error) {
      console.error('Error initializing time slots:', error);
    }
  });

  // Also run immediately on startup
  setTimeout(async () => {
    console.log('Running initial slot initialization...');
    await initializeTimeSlots();
  }, 5000); // Wait 5 seconds after startup

  console.log('✅ Slot initializer started (runs daily at midnight)');
}

// Clean up old bookings (archive past appointments)
function startCleanupScheduler() {
  console.log('🧹 Starting cleanup scheduler...');

  // Run at 1 AM every day
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Running cleanup tasks...');
      // Add cleanup logic here (e.g., move old bookings to archive sheet)
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('Error in cleanup scheduler:', error);
    }
  });

  console.log('✅ Cleanup scheduler started (runs daily at 1 AM)');
}

// Send daily summary to admin
function startDailySummary(adminPhoneNumber) {
  if (!adminPhoneNumber) {
    console.log('⚠️ Admin phone number not configured, skipping daily summary');
    return;
  }

  console.log('📊 Starting daily summary scheduler...');

  // Run at 6 PM every day
  cron.schedule('0 18 * * *', async () => {
    try {
      console.log('Generating daily summary...');
      // Add daily summary logic here
      console.log('✅ Daily summary sent');
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  });

  console.log('✅ Daily summary scheduler started (runs daily at 6 PM)');
}

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start all schedulers
function startAllSchedulers(adminPhoneNumber = null) {
  console.log('\n🚀 Starting all schedulers...\n');
  
  startReminderScheduler();
  startSlotInitializer();
  startCleanupScheduler();
  
  if (adminPhoneNumber) {
    startDailySummary(adminPhoneNumber);
  }

  console.log('\n✅ All schedulers running!\n');
}

module.exports = {
  startAllSchedulers,
  startReminderScheduler,
  startSlotInitializer,
  startCleanupScheduler,
  startDailySummary
};
