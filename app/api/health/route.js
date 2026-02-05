// app/api/health/route.js - Health check endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'WhatsApp Salon Booking System',
    version: '1.0.0'
  });
}
