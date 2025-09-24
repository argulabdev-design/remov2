import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
