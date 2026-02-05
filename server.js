// server.js - Main WhatsApp Webhook Server
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { getAvailableSlots, bookAppointment, getBookingById, cancelBooking, getAdminBookings, blockTimeSlot } = require('./sheets');
const { sendWhatsAppMessage, sendTemplateMessage } = require('./Whatsapp');
const { startAllSchedulers } = require('./Scheduler');

const app = express();
app.use(express.json());

// Start automated schedulers (reminders, slot generation, etc.)
startAllSchedulers(process.env.ADMIN_PHONE_NUMBER);

// Store user conversation state
const userStates = {};

// Webhook verification (required by Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook for receiving messages
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Check if it's a WhatsApp message
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      // Check if we have a message
      if (value.messages && value.messages[0]) {
        const message = value.messages[0];
        const from = message.from; // Customer phone number
        const messageBody = message.text?.body?.trim() || '';
        const messageType = message.type;

        console.log(`Message from ${from}: ${messageBody}`);

        // Process the message
        await handleIncomingMessage(from, messageBody, messageType);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

// Main message handling logic
async function handleIncomingMessage(phoneNumber, message, type) {
  const messageLower = message.toLowerCase();

  // Initialize user state if doesn't exist
  if (!userStates[phoneNumber]) {
    userStates[phoneNumber] = { step: 'initial' };
  }

  const state = userStates[phoneNumber];

  try {
    // Check for admin access
    if (messageLower.startsWith('admin ')) {
      await handleAdminAccess(phoneNumber, message);
      return;
    }

    // Check for cancellation request
    if (messageLower.startsWith('cancel ')) {
      await handleCancellation(phoneNumber, message);
      return;
    }

    // Handle conversation flow based on state
    switch (state.step) {
      case 'initial':
        await sendWelcomeMessage(phoneNumber);
        state.step = 'awaiting_service';
        break;

      case 'awaiting_service':
        await handleServiceSelection(phoneNumber, message);
        break;

      case 'awaiting_date':
        await handleDateSelection(phoneNumber, message);
        break;

      case 'awaiting_time':
        await handleTimeSelection(phoneNumber, message);
        break;

      case 'awaiting_name':
        await handleNameInput(phoneNumber, message);
        break;

      case 'awaiting_phone_confirm':
        await handlePhoneConfirmation(phoneNumber, message);
        break;

      case 'admin_panel':
        await handleAdminCommand(phoneNumber, message);
        break;

      default:
        await sendWelcomeMessage(phoneNumber);
        state.step = 'awaiting_service';
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await sendWhatsAppMessage(phoneNumber, '❌ Sorry, something went wrong. Please try again or type "Hi" to restart.');
    state.step = 'initial';
  }
}

// Send welcome message
async function sendWelcomeMessage(phoneNumber) {
  const message = `Welcome to *Salon Booking System*! 👋

Please choose a service:
1️⃣ Haircut ($20 - 30 min)

Reply with *1* to select Haircut.`;

  await sendWhatsAppMessage(phoneNumber, message);
}

// Handle service selection
async function handleServiceSelection(phoneNumber, message) {
  const state = userStates[phoneNumber];

  if (message === '1') {
    state.service = 'Haircut';
    state.serviceDuration = 30;
    state.servicePrice = 20;

    // Show available dates
    const dates = getNextSevenDays();
    let dateMessage = 'Great! Please select a date:\n\n';
    dates.forEach((date, index) => {
      dateMessage += `${index + 1}️⃣ ${date.display}\n`;
    });
    dateMessage += '\nReply with the number (1-7).';

    state.availableDates = dates;
    state.step = 'awaiting_date';
    await sendWhatsAppMessage(phoneNumber, dateMessage);
  } else {
    await sendWhatsAppMessage(phoneNumber, '❌ Invalid selection. Please reply with *1* for Haircut.');
  }
}

// Handle date selection
async function handleDateSelection(phoneNumber, message) {
  const state = userStates[phoneNumber];
  const dateIndex = parseInt(message) - 1;

  if (dateIndex >= 0 && dateIndex < state.availableDates.length) {
    const selectedDate = state.availableDates[dateIndex];
    state.selectedDate = selectedDate.value;

    // Get available time slots for this date
    const slots = await getAvailableSlots(selectedDate.value);

    if (slots.length === 0) {
      await sendWhatsAppMessage(phoneNumber, '❌ No available slots for this date. Please select another date or type "Hi" to restart.');
      return;
    }

    let slotsMessage = `Available times for *${selectedDate.display}*:\n\n`;
    slots.forEach((slot, index) => {
      slotsMessage += `${index + 1}️⃣ ${slot.time}\n`;
    });
    slotsMessage += '\nReply with the number to book.';

    state.availableSlots = slots;
    state.step = 'awaiting_time';
    await sendWhatsAppMessage(phoneNumber, slotsMessage);
  } else {
    await sendWhatsAppMessage(phoneNumber, '❌ Invalid date selection. Please reply with a number between 1-7.');
  }
}

// Handle time selection
async function handleTimeSelection(phoneNumber, message) {
  const state = userStates[phoneNumber];
  const slotIndex = parseInt(message) - 1;

  if (slotIndex >= 0 && slotIndex < state.availableSlots.length) {
    const selectedSlot = state.availableSlots[slotIndex];
    state.selectedTime = selectedSlot.time;

    const confirmMessage = `Perfect! Please provide your full name:`;
    state.step = 'awaiting_name';
    await sendWhatsAppMessage(phoneNumber, confirmMessage);
  } else {
    await sendWhatsAppMessage(phoneNumber, '❌ Invalid time selection. Please reply with a valid number.');
  }
}

// Handle name input
async function handleNameInput(phoneNumber, message) {
  const state = userStates[phoneNumber];
  state.customerName = message;

  const phoneConfirmMessage = `Thanks *${message}*! Your number is *${phoneNumber}*. Is this correct?\n\nReply *YES* to confirm or provide correct number.`;
  state.step = 'awaiting_phone_confirm';
  await sendWhatsAppMessage(phoneNumber, phoneConfirmMessage);
}

// Handle phone confirmation and create booking
async function handlePhoneConfirmation(phoneNumber, message) {
  const state = userStates[phoneNumber];
  let confirmedPhone = phoneNumber;

  if (message.toLowerCase() !== 'yes') {
    confirmedPhone = message;
  }

  // Create booking
  const bookingData = {
    customerName: state.customerName,
    phone: confirmedPhone,
    service: state.service,
    date: state.selectedDate,
    time: state.selectedTime,
    status: 'Confirmed'
  };

  const booking = await bookAppointment(bookingData);

  if (booking.success) {
    const confirmationMessage = `✅ *Booking Confirmed!*

📅 Date: ${state.selectedDate}
⏰ Time: ${state.selectedTime}
💇 Service: ${state.service}
👤 Name: ${state.customerName}
📱 Phone: ${confirmedPhone}

*Booking ID:* ${booking.bookingId}

We'll send you a reminder 1 hour before your appointment.

To cancel, reply: *CANCEL ${booking.bookingId}*`;

    await sendWhatsAppMessage(phoneNumber, confirmationMessage);

    // Reset state
    userStates[phoneNumber] = { step: 'initial' };
  } else {
    await sendWhatsAppMessage(phoneNumber, `❌ Booking failed: ${booking.error}\n\nPlease type "Hi" to try again.`);
    userStates[phoneNumber] = { step: 'initial' };
  }
}

// Handle cancellation
async function handleCancellation(phoneNumber, message) {
  const bookingId = message.split(' ')[1];
  const result = await cancelBooking(bookingId, phoneNumber);

  if (result.success) {
    await sendWhatsAppMessage(phoneNumber, `✅ Booking ${bookingId} has been cancelled successfully.`);
  } else {
    await sendWhatsAppMessage(phoneNumber, `❌ ${result.error}`);
  }
}

// Handle admin access
async function handleAdminAccess(phoneNumber, message) {
  const password = message.split(' ')[1];

  if (password === process.env.ADMIN_PASSWORD) {
    userStates[phoneNumber] = { step: 'admin_panel' };

    const adminMenu = `🔐 *Admin Panel*

Select option:
1️⃣ View Today's Bookings
2️⃣ View Tomorrow's Bookings
3️⃣ Block Time Slot
4️⃣ View All Bookings
5️⃣ Exit Admin

Reply with the number.`;

    await sendWhatsAppMessage(phoneNumber, adminMenu);
  } else {
    await sendWhatsAppMessage(phoneNumber, '❌ Invalid admin password.');
  }
}

// Handle admin commands
async function handleAdminCommand(phoneNumber, message) {
  const state = userStates[phoneNumber];

  switch (message) {
    case '1':
      await showTodayBookings(phoneNumber);
      break;
    case '2':
      await showTomorrowBookings(phoneNumber);
      break;
    case '3':
      await sendWhatsAppMessage(phoneNumber, 'Feature coming soon! Type number to see menu again.');
      break;
    case '4':
      await showAllBookings(phoneNumber);
      break;
    case '5':
      userStates[phoneNumber] = { step: 'initial' };
      await sendWhatsAppMessage(phoneNumber, 'Exited admin panel. Type "Hi" to start booking.');
      break;
    default:
      await sendWhatsAppMessage(phoneNumber, '❌ Invalid option. Please select 1-5.');
  }
}

// Show today's bookings
async function showTodayBookings(phoneNumber) {
  const today = new Date().toISOString().split('T')[0];
  const bookings = await getAdminBookings(today);

  if (bookings.length === 0) {
    await sendWhatsAppMessage(phoneNumber, `📊 No bookings for today (${today})`);
    return;
  }

  let message = `📊 *Today's Bookings* (${today}):\n\n`;
  bookings.forEach((booking, index) => {
    message += `${index + 1}. ${booking.time} - ${booking.customerName} (${booking.bookingId})\n   Service: ${booking.service}\n\n`;
  });
  message += `Total: ${bookings.length} bookings`;

  await sendWhatsAppMessage(phoneNumber, message);
}

// Show tomorrow's bookings
async function showTomorrowBookings(phoneNumber) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const bookings = await getAdminBookings(tomorrowStr);

  if (bookings.length === 0) {
    await sendWhatsAppMessage(phoneNumber, `📊 No bookings for tomorrow (${tomorrowStr})`);
    return;
  }

  let message = `📊 *Tomorrow's Bookings* (${tomorrowStr}):\n\n`;
  bookings.forEach((booking, index) => {
    message += `${index + 1}. ${booking.time} - ${booking.customerName} (${booking.bookingId})\n   Service: ${booking.service}\n\n`;
  });
  message += `Total: ${bookings.length} bookings`;

  await sendWhatsAppMessage(phoneNumber, message);
}

// Show all bookings
async function showAllBookings(phoneNumber) {
  const bookings = await getAdminBookings();
  
  if (bookings.length === 0) {
    await sendWhatsAppMessage(phoneNumber, '📊 No bookings found.');
    return;
  }

  let message = `📊 *All Upcoming Bookings*:\n\n`;
  bookings.slice(0, 20).forEach((booking, index) => {
    message += `${index + 1}. ${booking.date} ${booking.time}\n   ${booking.customerName} - ${booking.service}\n   ID: ${booking.bookingId}\n\n`;
  });
  
  if (bookings.length > 20) {
    message += `\n... and ${bookings.length - 20} more bookings`;
  }

  await sendWhatsAppMessage(phoneNumber, message);
}

// Helper: Get next 7 days
function getNextSevenDays() {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    days.push({
      display: `${dayName} - ${dateStr}`,
      value: date.toISOString().split('T')[0]
    });
  }

  return days;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📱 Webhook URL: https://your-app.onrender.com/webhook`);
});

module.exports = app;
