// app/api/webhook/route.js - WhatsApp Webhook Handler
import { NextResponse } from 'next/server';

// Import CommonJS module
const messageHandlers = require('../../lib/messageHandlers');

// Webhook verification (GET) - required by Meta
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse(null, { status: 403 });
  }
}

// Webhook for receiving messages (POST)
export async function POST(request) {
  try {
    const body = await request.json();

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

        // Process the message asynchronously (don't wait for it)
        messageHandlers.handleIncomingMessage(from, messageBody, messageType).catch(error => {
          console.error('Error processing message:', error);
        });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse(null, { status: 500 });
  }
}
