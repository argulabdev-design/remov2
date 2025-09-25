import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDaNpUhv6biSC5HGTMlkF9B_kZntxhc_Y0',
  authDomain: 'remo-1195c.firebaseapp.com',
  databaseURL: 'https://remo-1195c-default-rtdb.firebaseio.com',
  projectId: 'remo-1195c',
  storageBucket: 'remo-1195c.firebasestorage.app',
  messagingSenderId: '568335384493',
  appId: '1:568335384493:web:2334f0bb5fed68046c6b24',
  measurementId: 'G-RPLXD5BG9B'
};

// Validate Firebase configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('Missing Firebase configuration fields:', missingFields);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize auth with proper error handling
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User authenticated:', user.email);
  } else {
    console.log('User signed out');
  }
}, (error) => {
  console.error('Auth state change error:', error);
});
