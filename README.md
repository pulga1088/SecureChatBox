# Secure Chat Box — End-to-End Encrypted Messaging

A secure, real-time chat application built using React Native (Expo) on the frontend and Node.js (Express/Socket.IO) on the backend, with persistent storage in MongoDB.

All communication is protected by **AES-256 Client-Side Encryption**, ensuring that messages are encrypted on the sender's device and can only be decrypted by the recipient. The server and database only store secure encrypted ciphertext.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Sender Device (Expo Go)] -->|1. AES-256 Encrypts Message| B(Cloudflare Tunnel)
    B -->|2. Secure Proxy Forward| C[Node.js Backend (Port 5001)]
    C -->|3. Save Encrypted String| D[(MongoDB Database)]
    C -->|4. Forward Scrambled String| E(Cloudflare Tunnel)
    E -->|5. Deliver Ciphertext| F[Receiver Device (Expo Go)]
    F -->|6. Decrypts locally using Chat ID| F
```

---

## 💾 Where Data is Stored

### 1. Database (MongoDB)
* **Storage Location**: Hosted locally on the development machine hard drive.
* **Database Name**: `secure-chat`
* **Collections**:
  * `users`: Stores verified user profiles (names, phone numbers, and statuses).
  * `chats`: Stores chat participants and room metadata.
  * `messages`: Stores encrypted message bodies, sender/receiver references, and reactions.

### 2. Backend Server (Node.js / Express / Socket.IO)
* **Storage Location**: Runs locally on port `5001`.
* **Tunneling**: Exposed to the internet using **Cloudflare Quick Tunnels** to handle HTTP APIs and WebSockets connections securely without bandwidth limits.

### 3. Frontend App (React Native / Expo)
* **Storage Location**: Bundled on the machine using Metro (`port 8081`) and run inside the **Expo Go** application on user devices.

---

## 🔒 Key Security Features

### Client-Side AES-256 Encryption
Before a message leaves a phone, it is encrypted using **AES-256** using the shared Chat ID as the secret key.
* **Ciphertext Signature**: Every message stored in the database starts with the `U2FsdGVkX1` signature, indicating standard OpenSSL/CryptoJS salted encryption.
* **Zero-Knowledge Server**: Since the encryption keys stay on the user devices, the server administrator cannot read the content of the conversations.

### Native File Uploads
Photo sharing bypasses standard browser Blob vulnerabilities by uploading images directly from the device's native filesystem to the server via Expo's `FileSystem.uploadAsync` client.
