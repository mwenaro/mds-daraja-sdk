# mds-daraja-sdk

A simple, type-safe SDK for integrating with Safaricom's Daraja API for M-Pesa payments in Node.js and TypeScript.

## Features
- STK Push (Lipa na M-Pesa Online Payment)
- OAuth token management
- TypeScript support
- Flexible configuration (env or constructor)
- Input validation and robust error handling

## Installation

```bash
npm install mds-daraja-sdk
```

## Usage

### 1. Import and Initialize

```typescript
import { SafaricomDarajaApi, StkPushRequest } from "mds-daraja-sdk";

const daraja = new SafaricomDarajaApi({
  consumerKey: process.env.DARAJA_CONSUMER_KEY,
  consumerSecret: process.env.DARAJA_CONSUMER_SECRET,
  shortCode: process.env.DARAJA_SHORT_CODE,
  passkey: process.env.DARAJA_PASSKEY,
  baseUrl: "https://sandbox.safaricom.co.ke" // or production URL
});
```

Or use environment variables (recommended for secrets):

```env
DARAJA_CONSUMER_KEY=your_key
DARAJA_CONSUMER_SECRET=your_secret
DARAJA_SHORT_CODE=your_shortcode
DARAJA_PASSKEY=your_passkey
DARAJA_CALLBACK_URL=https://yourdomain.com/callback
```

### 2. Initiate an STK Push

```typescript
const request: StkPushRequest = {
  phoneNumber: "2547XXXXXXXX",
  amount: 100,
  accountReference: "Order123",
  transactionDesc: "Payment for Order 123",
  // callbackUrl: "https://yourdomain.com/callback" // optional, overrides env
};

try {
  const response = await daraja.stkPush(request);
  console.log(response);
} catch (err) {
  console.error("STK Push failed:", err);
}
```

### 3. Get OAuth Access Token (if needed)

```typescript
const token = await daraja.getAccessToken();
console.log(token);
```

## API Reference

### `class SafaricomDarajaApi`

#### Constructor
```typescript
new SafaricomDarajaApi(options?: {
  consumerKey?: string;
  consumerSecret?: string;
  shortCode?: string;
  passkey?: string;
  baseUrl?: string;
})
```

#### Methods
- `stkPush(request: StkPushRequest): Promise<StkPushResponse>`
- `getAccessToken(): Promise<string>`

#### Types
- `StkPushRequest`
- `StkPushResponse`

## Migration

> **Note:** The old `MdsDarajaSdk` class is deprecated. Please use `SafaricomDarajaApi` for all new integrations.

## Testing & Linting

```bash
npm run test
npm run lint
```

## License

ISC

## Author

Mwero Abdalla <mweroabdalla@gmail.com>

