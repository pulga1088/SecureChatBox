import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { registerSocketHandlers } from './sockets/chat.socket.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - body:`, req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Serve reCAPTCHA page for WebView
app.get('/recaptcha', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>reCAPTCHA Verification</title>
      <script src="https://www.google.com/recaptcha/api.js" async defer></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #121214;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
      </style>
      <script>
        function onRecaptchaSuccess(token) {
          console.log("Success callback triggered");
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', token: token }));
        }
        function onRecaptchaExpired() {
          console.log("Expired callback triggered");
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'expired' }));
        }
        function onRecaptchaError() {
          console.log("Error callback triggered");
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error' }));
        }
      </script>
    </head>
    <body>
      <div class="g-recaptcha" 
           data-sitekey="6LcMZR0UAAAAALgPMcgHwga7gY5p8QMg1Hj-bmUv" 
           data-callback="onRecaptchaSuccess"
           data-expired-callback="onRecaptchaExpired"
           data-error-callback="onRecaptchaError"
           data-theme="dark">
      </div>
    </body>
    </html>
  `);
});

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Secure Chat Backend is running' });
});

// Socket.io Connection Handler
registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export { io };
