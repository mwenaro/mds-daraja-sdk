# MDS DARAJA SDK

The `mds-daraja-sdk` is a simple, easy-to-use Node.js SDK for integrating with the Safaricom M-Pesa API. It supports key M-Pesa functionalities such as STK Push, B2C payments, and transaction reversals. This SDK works with both JavaScript and TypeScript environments.

## Table of Contents

- [MDS DARAJA SDK](#mds-daraja-sdk)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Importing the SDK](#importing-the-sdk)
    - [Initialization](#initialization)
    - [STK Push](#stk-push)
      - [Example:](#example)
    - [Transaction Reversal](#transaction-reversal)
      - [Example:](#example-1)
    - [B2C Payments](#b2c-payments)
      - [Example:](#example-2)
  - [Utilities](#utilities)
    - [Generate Password](#generate-password)
    - [Generate Timestamp](#generate-timestamp)
  - [Error Handling](#error-handling)
      - [Example:](#example-3)
  - [Contributing](#contributing)
  - [License](#license)
  - [Notes](#notes)

---

## Installation

To install the SDK, simply run:

```bash
npm install mds-daraja-sdk
```

Or with Yarn:

```bash
yarn add mds-daraja-sdk
```

---

## Usage

### Importing the SDK

The SDK can be imported in both JavaScript and TypeScript projects.

- **JavaScript**:

  ```js
  const { MdsDarajaSdk } = require('mds-daraja-sdk');
  ```

- **TypeScript**:

  ```ts
  import { MdsDarajaSdk } from 'mds-daraja-sdk';
  ```

### Initialization

To start using the SDK, you need to create an instance of the `MdsDarajaSdk` class. The constructor takes three arguments:

1. **Consumer Key** (from Safaricom Developer Portal)
2. **Consumer Secret** (from Safaricom Developer Portal)
3. **Sandbox Mode** (optional, default is `true`)

Example:

```ts
const sdk = new MdsDarajaSdk('your-consumer-key', 'your-consumer-secret', true); // Sandbox mode
```

For production use:

```ts
const sdk = new MdsDarajaSdk('your-consumer-key', 'your-consumer-secret', false); // Production mode
```

---

### STK Push

The STK Push feature allows you to initiate a payment request to a customer's phone. It requires the following parameters:

- `businessShortCode`: The short code of your M-Pesa Paybill or Till Number.
- `password`: Base64-encoded string derived from your short code, passkey, and timestamp.
- `timestamp`: The current timestamp in the format `yyyyMMddHHmmss`.
- `phoneNumber`: The customer's phone number (in the format 2547XXXXXXXX).
- `amount`: The amount to be paid.
- `callbackUrl`: The URL Safaricom will call to confirm payment status.

#### Example:

```ts
const businessShortCode = '174379'; // Your shortcode
const passkey = 'your-lipa-na-mpesa-passkey'; // Safaricom passkey
const timestamp = MdsDarajaSdk.generateTimeStamp();
const password = MdsDarajaSdk.generatePassword(businessShortCode, passkey);
const phoneNumber = '254712345678'; // Customer's phone number
const amount = 100;
const callbackUrl = 'https://example.com/callback';

sdk.initiateStkPush(businessShortCode, password, timestamp, phoneNumber, amount, callbackUrl)
  .then(response => console.log('STK Push Response:', response))
  .catch(error => console.error('STK Push Error:', error));
```

---

### Transaction Reversal

The transaction reversal feature allows you to reverse a mistaken transaction.

Parameters:
- `shortCode`: The short code initiating the reversal.
- `password`: Security credential.
- `transactionID`: The ID of the transaction to be reversed.

#### Example:

```ts
const shortCode = '600000'; // Your shortcode
const password = 'your-security-credential'; // Safaricom security credential
const transactionID = 'LKXXXX1234'; // The ID of the transaction to reverse

sdk.reverseTransaction(shortCode, password, transactionID)
  .then(response => console.log('Reversal Response:', response))
  .catch(error => console.error('Reversal Error:', error));
```

---

### B2C Payments

B2C (Business to Customer) payments allow you to send money from your business to a customer.

Parameters:
- `shortCode`: The short code initiating the payment.
- `password`: Security credential.
- `timestamp`: The current timestamp.
- `phoneNumber`: The customer's phone number.
- `amount`: The amount to be paid.

#### Example:

```ts
const shortCode = '600000'; // Your shortcode
const password = 'your-security-credential'; // Safaricom security credential
const timestamp = MdsDarajaSdk.generateTimeStamp();
const phoneNumber = '254712345678'; // Recipient's phone number
const amount = 1000; // Amount to send

sdk.initiateB2cPayment(shortCode, password, timestamp, phoneNumber, amount)
  .then(response => console.log('B2C Response:', response))
  .catch(error => console.error('B2C Error:', error));
```

---

## Utilities

### Generate Password

The password for STK Push is generated using your Business Short Code, Passkey, and a timestamp.

```ts
const password = MdsDarajaSdk.generatePassword('shortCode', 'passkey');
```

### Generate Timestamp

Generate a Safaricom-compliant timestamp in the format `yyyyMMddHHmmss`:

```ts
const timestamp = MdsDarajaSdk.generateTimeStamp();
```

---

## Error Handling

All methods return a `Promise`. Use `.then()` and `.catch()` to handle the responses and errors.

#### Example:

```ts
sdk.initiateStkPush(businessShortCode, password, timestamp, phoneNumber, amount, callbackUrl)
  .then(response => {
    console.log('STK Push successful:', response);
  })
  .catch(error => {
    console.error('Error initiating STK Push:', error);
  });
```

Common error scenarios include:
- Invalid consumer key or secret.
- Incorrect API credentials.
- Network-related issues.

For detailed error codes, consult the [M-Pesa API Documentation](https://developer.safaricom.co.ke/).

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## Notes

1. Ensure your callback URLs are publicly accessible when testing M-Pesa API features like STK Push and B2C payments.
2. For security, make sure you do not expose sensitive credentials (consumer key, secret, passkey, etc.) in your production code or version control.

