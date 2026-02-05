// lib/initSchedulers.js - Initialize schedulers for Next.js
// This runs once when the server starts

let schedulersStarted = false;

export function initializeSchedulers() {
  if (schedulersStarted) {
    return;
  }

  // Only run on server side
  if (typeof window === 'undefined') {
    try {
      const { startAllSchedulers } = require('../scheduler');
      
      console.log('🚀 Initializing schedulers...');
      startAllSchedulers(process.env.ADMIN_PHONE_NUMBER);
      schedulersStarted = true;
      console.log('✅ Schedulers initialized');
    } catch (error) {
      console.error('Error initializing schedulers:', error);
    }
  }
}

// Also initialize on module load (for serverless environments)
if (typeof window === 'undefined') {
  initializeSchedulers();
}
