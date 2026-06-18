import { initializeApp } from 'firebase/app';

// Replace these configuration parameters with your project's values from the Firebase Console
// Go to Project Settings > General > Your Apps > Web App Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoUafdDyp8cU4Ck9R2X1l_wWNEISxejPA",
  authDomain: "endtoendchat-f92b3.firebaseapp.com",
  projectId: "endtoendchat-f92b3",
  storageBucket: "endtoendchat-f92b3.firebasestorage.app",
  messagingSenderId: "848435718746",
  appId: "1:848435718746:web:63fae7fb0f93957ac50663"
};

const app = initializeApp(firebaseConfig);

export { app, firebaseConfig };
