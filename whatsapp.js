// whatsapp.js - WhatsApp API Functions
const axios = require('axios');

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;

// Send a text message via WhatsApp
async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios({
      method: 'POST',
      url: WHATSAPP_API_URL,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      }
    });

    console.log(`✅ Message sent to ${to}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Send interactive buttons
async function sendInteractiveButtons(to, bodyText, buttons) {
  try {
    const response = await axios({
      method: 'POST',
      url: WHATSAPP_API_URL,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: bodyText
          },
          action: {
            buttons: buttons.map((btn, index) => ({
              type: 'reply',
              reply: {
                id: `btn_${index}`,
                title: btn
              }
            }))
          }
        }
      }
    });

    console.log(`✅ Interactive message sent to ${to}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending interactive message:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Send interactive list
async function sendInteractiveList(to, bodyText, buttonText, sections) {
  try {
    const response = await axios({
      method: 'POST',
      url: WHATSAPP_API_URL,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: bodyText
          },
          action: {
            button: buttonText,
            sections: sections
          }
        }
      }
    });

    console.log(`✅ Interactive list sent to ${to}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending interactive list:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Send template message (for reminders - requires pre-approved templates)
async function sendTemplateMessage(to, templateName, languageCode = 'en') {
  try {
    const response = await axios({
      method: 'POST',
      url: WHATSAPP_API_URL,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      }
    });

    console.log(`✅ Template message sent to ${to}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending template message:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Send appointment reminder
async function sendAppointmentReminder(booking) {
  const reminderMessage = `🔔 *Reminder!*

Your appointment is in 1 hour:
⏰ Time: ${booking.time}
💇 Service: ${booking.service}
👤 Name: ${booking.customerName}

📍 Salon Address: 123 Main Street

See you soon! 😊

To cancel, reply: *CANCEL ${booking.bookingId}*`;

  return await sendWhatsAppMessage(booking.phone, reminderMessage);
}

// Send booking confirmation
async function sendBookingConfirmation(booking) {
  const confirmMessage = `✅ *Booking Confirmed!*

📅 Date: ${booking.date}
⏰ Time: ${booking.time}
💇 Service: ${booking.service}
👤 Name: ${booking.customerName}
📱 Phone: ${booking.phone}

*Booking ID:* ${booking.bookingId}

We'll send you a reminder 1 hour before your appointment.

To cancel, reply: *CANCEL ${booking.bookingId}*`;

  return await sendWhatsAppMessage(booking.phone, confirmMessage);
}

// Send cancellation confirmation
async function sendCancellationConfirmation(booking) {
  const cancelMessage = `❌ *Booking Cancelled*

Your appointment has been cancelled:
📅 Date: ${booking.date}
⏰ Time: ${booking.time}
🆔 Booking ID: ${booking.bookingId}

To book again, type *Hi*.`;

  return await sendWhatsAppMessage(booking.phone, cancelMessage);
}

// Mark message as read
async function markAsRead(messageId) {
  try {
    await axios({
      method: 'POST',
      url: WHATSAPP_API_URL,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking message as read:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  sendTemplateMessage,
  sendAppointmentReminder,
  sendBookingConfirmation,
  sendCancellationConfirmation,
  markAsRead
};
