// lib/userState.js - User conversation state management
// In-memory store for user states (consider Redis for production)

const userStates = {};

// Get user state
function getUserState(phoneNumber) {
  if (!userStates[phoneNumber]) {
    userStates[phoneNumber] = { step: 'initial' };
  }
  return userStates[phoneNumber];
}

// Set user state
function setUserState(phoneNumber, state) {
  userStates[phoneNumber] = state;
}

// Reset user state
function resetUserState(phoneNumber) {
  userStates[phoneNumber] = { step: 'initial' };
}

// Clear all states (for testing/cleanup)
function clearAllStates() {
  Object.keys(userStates).forEach(key => delete userStates[key]);
}

module.exports = {
  getUserState,
  setUserState,
  resetUserState,
  clearAllStates,
};
