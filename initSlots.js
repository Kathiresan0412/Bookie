// initSlots.js - One-time script to initialize time slots
require('dotenv').config();
const { initializeTimeSlots } = require('./sheets');

async function main() {
  console.log('🚀 Initializing time slots for the next 7 days...\n');

  try {
    const result = await initializeTimeSlots();
    
    if (result) {
      console.log('\n✅ Time slots initialized successfully!');
      console.log('You can now start the server with: npm start');
    } else {
      console.log('\n❌ Failed to initialize time slots');
      console.log('Please check your Google Sheets configuration');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. Created the Google Sheet with all required tabs');
    console.log('2. Configured the .env file with correct credentials');
    console.log('3. Shared the sheet with your service account email');
  }

  process.exit(0);
}

main();
