import { API_BASE_URL } from '../constants/api';

type RequestOtpParams = {
    phone: string;
    mode: 'login' | 'register';
    name?: string;
};

type RequestOtpResponse = {
    verificationId: string;
    expiresIn: number;
    maskedPhone: string;
};

type VerifyOtpParams = {
    phone: string;
    verificationId: string;
    otp: string;
};

type VerifyOtpResponse = {
    token: string;
    user: {
        id: string;
        phone: string;
        name?: string;
    };
};

type ApiErrorBody = {
    error?: string;
    message?: string;
};

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function requestJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        const data = (await response.json().catch(() => ({}))) as TResponse & ApiErrorBody;

        if (!response.ok) {
            throw new ApiError(data.error ?? data.message ?? 'Request failed', response.status);
        }

        return data as TResponse;
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AbortError') {
            throw new ApiError('Server request timed out. Make sure the backend is running and reachable from your phone.', 408);
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

export function requestOtp(params: RequestOtpParams) {
    return requestJson<RequestOtpResponse>('/auth/request-otp', params);
}

export function verifyOtp(params: VerifyOtpParams) {
    return requestJson<VerifyOtpResponse>('/auth/verify-otp', params);
}