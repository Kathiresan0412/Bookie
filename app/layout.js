// app/layout.js - Root layout for Next.js app
import { initializeSchedulers } from '@/lib/initSchedulers';

// Initialize schedulers when the app starts
if (typeof window === 'undefined') {
  initializeSchedulers();
}

export const metadata = {
  title: 'WhatsApp Salon Booking System',
  description: 'Automated WhatsApp booking system for salons',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
