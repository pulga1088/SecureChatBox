const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || 'securechat-dev-secret';
const otpTtlMs = 5 * 60 * 1000;

const otpStore = new Map();
const users = new Map();

app.use(cors());
app.use(express.json());

function generateOtp() {
    return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function normalizePhone(phone) {
    return String(phone ?? '').replace(/\s+/g, '').trim();
}

function isValidPhone(phone) {
    return /^\+?\d{10,15}$/.test(phone);
}

function maskPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length <= 4) {
        return phone;
    }

    return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
}

function createAccountId() {
    return crypto.randomUUID();
}

function sendError(res, status, message) {
    return res.status(status).json({ error: message });
}

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

app.post('/auth/request-otp', (req, res) => {
    const phone = normalizePhone(req.body.phone);
    const mode = req.body.mode === 'register' ? 'register' : 'login';
    const name = String(req.body.name ?? '').trim();

    if (!isValidPhone(phone)) {
        return sendError(res, 400, 'Enter a valid phone number.');
    }

    if (mode === 'register' && name.length < 2) {
        return sendError(res, 400, 'Enter your name to create an account.');
    }

    if (mode === 'login' && !users.has(phone)) {
        return sendError(res, 404, 'No account found for this phone number. Please register first.');
    }

    if (mode === 'register' && users.has(phone)) {
        return sendError(res, 409, 'An account already exists for this phone number. Please login instead.');
    }

    const verificationId = crypto.randomUUID();
    const otp = generateOtp();
    const expiresAt = Date.now() + otpTtlMs;

    otpStore.set(verificationId, {
        phone,
        otp,
        mode,
        name,
        expiresAt,
        attempts: 0,
    });

    console.log(`[OTP] ${mode} -> ${phone}: ${otp}`);

    return res.json({
        verificationId,
        expiresIn: Math.round(otpTtlMs / 1000),
        maskedPhone: maskPhone(phone),
    });
});

app.post('/auth/verify-otp', (req, res) => {
    const phone = normalizePhone(req.body.phone);
    const verificationId = String(req.body.verificationId ?? '');
    const otp = String(req.body.otp ?? '').trim();

    if (!verificationId) {
        return sendError(res, 400, 'Missing verification ID.');
    }

    const record = otpStore.get(verificationId);

    if (!record) {
        return sendError(res, 404, 'OTP request not found.');
    }

    if (record.phone !== phone) {
        return sendError(res, 400, 'Phone number does not match the OTP request.');
    }

    if (record.expiresAt < Date.now()) {
        otpStore.delete(verificationId);
        return sendError(res, 410, 'OTP expired. Please request a new code.');
    }

    if (record.attempts >= 5) {
        otpStore.delete(verificationId);
        return sendError(res, 429, 'Too many invalid attempts. Request a new OTP.');
    }

    if (record.otp !== otp) {
        record.attempts += 1;
        otpStore.set(verificationId, record);
        return sendError(res, 401, 'Invalid OTP.');
    }

    otpStore.delete(verificationId);

    let user = users.get(phone);

    if (record.mode === 'register') {
        user = {
            id: createAccountId(),
            phone,
            name: record.name || undefined,
            createdAt: new Date().toISOString(),
        };
        users.set(phone, user);
    }

    if (!user) {
        return sendError(res, 404, 'No account found for this phone number. Please register first.');
    }

    const token = jwt.sign(
        { sub: phone, phone, mode: record.mode },
        jwtSecret,
        { expiresIn: '7d' }
    );

    return res.json({
        token,
        user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
        },
    });
});

app.listen(port, () => {
    console.log(`SecureChat OTP server running on http://localhost:${port}`);
});