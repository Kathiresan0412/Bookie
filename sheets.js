// sheets.js - Google Sheets Database Integration
const { google } = require('googleapis');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Sheet names
const SHEETS = {
  BOOKINGS: 'Bookings',
  TIME_SLOTS: 'TimeSlots',
  SERVICES: 'Services',
  SETTINGS: 'Settings'
};

// Get available time slots for a specific date
async function getAvailableSlots(date) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.TIME_SLOTS}!A2:D`, // Date, Time, Status, BookingID
    });

    const rows = response.data.values || [];
    const availableSlots = rows
      .filter(row => row[0] === date && row[2] === 'Available')
      .map(row => ({
        time: row[1],
        status: row[2]
      }));

    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
}

// Book an appointment
async function bookAppointment(bookingData) {
  try {
    // Generate booking ID
    const bookingId = await generateBookingId();
    const timestamp = new Date().toISOString();

    // Check if slot is still available
    const slotAvailable = await checkSlotAvailability(bookingData.date, bookingData.time);
    if (!slotAvailable) {
      return { success: false, error: 'Time slot no longer available' };
    }

    // Add booking to Bookings sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!A:H`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          bookingId,
          bookingData.customerName,
          bookingData.phone,
          bookingData.service,
          bookingData.date,
          bookingData.time,
          bookingData.status,
          timestamp
        ]]
      }
    });

    // Update TimeSlots sheet to mark as booked
    await updateSlotStatus(bookingData.date, bookingData.time, 'Booked', bookingId);

    return { success: true, bookingId };
  } catch (error) {
    console.error('Error booking appointment:', error);
    return { success: false, error: error.message };
  }
}

// Check if time slot is available
async function checkSlotAvailability(date, time) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.TIME_SLOTS}!A2:D`,
    });

    const rows = response.data.values || [];
    const slot = rows.find(row => row[0] === date && row[1] === time);

    return slot && slot[2] === 'Available';
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
}

// Update slot status
async function updateSlotStatus(date, time, status, bookingId = '') {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.TIME_SLOTS}!A2:D`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === date && row[1] === time);

    if (rowIndex === -1) {
      throw new Error('Slot not found');
    }

    // Update the specific row (rowIndex + 2 because of header and 0-indexing)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.TIME_SLOTS}!C${rowIndex + 2}:D${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[status, bookingId]]
      }
    });

    return true;
  } catch (error) {
    console.error('Error updating slot status:', error);
    return false;
  }
}

// Generate unique booking ID
async function generateBookingId() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!A:A`,
    });

    const rows = response.data.values || [];
    const count = rows.length; // Including header

    return `BK${String(count).padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating booking ID:', error);
    return `BK${String(Date.now()).slice(-5)}`;
  }
}

// Get booking by ID
async function getBookingById(bookingId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!A2:H`,
    });

    const rows = response.data.values || [];
    const booking = rows.find(row => row[0] === bookingId);

    if (!booking) {
      return null;
    }

    return {
      bookingId: booking[0],
      customerName: booking[1],
      phone: booking[2],
      service: booking[3],
      date: booking[4],
      time: booking[5],
      status: booking[6],
      createdAt: booking[7]
    };
  } catch (error) {
    console.error('Error getting booking:', error);
    return null;
  }
}

// Cancel booking
async function cancelBooking(bookingId, phoneNumber) {
  try {
    const booking = await getBookingById(bookingId);

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.phone !== phoneNumber) {
      return { success: false, error: 'Unauthorized to cancel this booking' };
    }

    // Update booking status
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!A2:H`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === bookingId);

    if (rowIndex === -1) {
      return { success: false, error: 'Booking not found' };
    }

    // Update status to Cancelled
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!G${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['Cancelled']]
      }
    });

    // Free up the time slot
    await updateSlotStatus(booking.date, booking.time, 'Available', '');

    return { success: true };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, error: error.message };
  }
}

// Get bookings for admin (filtered by date or all)
async function getAdminBookings(date = null) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!A2:H`,
    });

    const rows = response.data.values || [];
    let bookings = rows.map(row => ({
      bookingId: row[0],
      customerName: row[1],
      phone: row[2],
      service: row[3],
      date: row[4],
      time: row[5],
      status: row[6],
      createdAt: row[7]
    }));

    // Filter by date if provided
    if (date) {
      bookings = bookings.filter(b => b.date === date);
    }

    // Filter out cancelled bookings
    bookings = bookings.filter(b => b.status !== 'Cancelled');

    // Sort by date and time
    bookings.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    return bookings;
  } catch (error) {
    console.error('Error getting admin bookings:', error);
    return [];
  }
}

// Get bookings that need reminders (1 hour before appointment)
async function getBookingsForReminders() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!A2:H`,
    });

    const rows = response.data.values || [];
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const bookingsToRemind = rows
      .map(row => ({
        bookingId: row[0],
        customerName: row[1],
        phone: row[2],
        service: row[3],
        date: row[4],
        time: row[5],
        status: row[6],
        createdAt: row[7]
      }))
      .filter(booking => {
        if (booking.status !== 'Confirmed') return false;

        const [hours, minutes] = booking.time.split(':');
        const appointmentTime = new Date(booking.date);
        appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Check if appointment is approximately 1 hour away (within 5 minute window)
        const timeDiff = appointmentTime - now;
        return timeDiff > 55 * 60 * 1000 && timeDiff <= 65 * 60 * 1000;
      });

    return bookingsToRemind;
  } catch (error) {
    console.error('Error getting bookings for reminders:', error);
    return [];
  }
}

// Mark booking as reminded
async function markAsReminded(bookingId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!A2:H`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === bookingId);

    if (rowIndex === -1) return false;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.BOOKINGS}!G${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['Reminded']]
      }
    });

    return true;
  } catch (error) {
    console.error('Error marking as reminded:', error);
    return false;
  }
}

// Initialize time slots for next 7 days
async function initializeTimeSlots() {
  try {
    console.log('Initializing time slots...');

    // Get existing slots
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.TIME_SLOTS}!A2:D`,
    });

    const existingRows = response.data.values || [];
    const existingDates = new Set(existingRows.map(row => row[0]));

    // Generate slots for next 7 days
    const slotsToAdd = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Skip if already exists
      if (existingDates.has(dateStr)) continue;

      // Generate time slots (9 AM to 6 PM, 30-minute intervals)
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          slotsToAdd.push([dateStr, timeStr, 'Available', '']);
        }
      }
    }

    if (slotsToAdd.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.TIME_SLOTS}!A:D`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: slotsToAdd
        }
      });

      console.log(`✅ Added ${slotsToAdd.length} time slots`);
    } else {
      console.log('No new slots needed');
    }

    return true;
  } catch (error) {
    console.error('Error initializing time slots:', error);
    return false;
  }
}

// Block a time slot
async function blockTimeSlot(date, time) {
  try {
    await updateSlotStatus(date, time, 'Blocked', 'ADMIN_BLOCKED');
    return { success: true };
  } catch (error) {
    console.error('Error blocking time slot:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getBookingById,
  cancelBooking,
  getAdminBookings,
  getBookingsForReminders,
  markAsReminded,
  initializeTimeSlots,
  blockTimeSlot
};
