// safaricom-daraja.ts
import axios, { AxiosResponse } from "axios";
import { config } from "dotenv";
config();
export interface StkPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export class SafaricomDarajaApi {
  private consumerKey: string;
  private consumerSecret: string;
  private baseUrl: string;
  private businessShortCode: string;
  private passkey: string;

  constructor(
    consumerKey: string = process.env.DARAJA_API_CONSUMER_KEY!,
    consumerSecret: string = process.env.DARAJA_API_CONSUMER_SECRET!,
    businessShortCode: string = process.env.DARAJA_API_BUSINESS_SHORT_CODE!,
    passkey: string = process.env.DARAJA_API_PASS_KEY!
  ) {
    this.businessShortCode = businessShortCode;
    this.passkey = passkey;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.baseUrl = process.env.DARAJA_API_BASE_URL!; // Use 'https://api.safaricom.co.ke' for production
  }

  /**
   * Get the access token from Safaricom Daraja API
   */
  async getAccessToken(): Promise<string> {
    const url = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString("base64");

    const response: AxiosResponse = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  }

  /**
   * Register C2B URLs
   */
  async registerUrls(
    confirmationUrl: string,
    validationUrl: string,
    shortCode: string = this.businessShortCode
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/c2b/v1/registerurl`;
    const requestBody = {
      ShortCode: shortCode,
      ResponseType: "Completed",
      ConfirmationURL: confirmationUrl,
      ValidationURL: validationUrl,
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  /**
   * Check Account Balance
   */
  async checkBalance(
    shortCode: string,
    password: string,
    timestamp: string,
    partyA: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/accountbalance/v1/query`;

    const requestBody = {
      Initiator: shortCode,
      SecurityCredential: password, // Safaricom expects encrypted password
      CommandID: "AccountBalance",
      PartyA: partyA,
      IdentifierType: "4", // Identifier type 4 = organization short code
      Remarks: "Balance inquiry",
      QueueTimeOutURL: "https://example.com/timeout", // Handle timeout callbacks
      ResultURL: "https://example.com/result", // Handle result callbacks
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  /**
   * Initiate an STK Push
   */
  async initiateStkPush(
    stkPushRequest: StkPushRequest
  ): Promise<StkPushResponse> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;

    const response: AxiosResponse<StkPushResponse> = await axios.post(
      url,
      stkPushRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }

  async intiateC2bStkPush(
    phone: string,
    amount: number,
    callbackUrl: string = process.env.DARAJA_API_CALLBACK_URL!
  ): Promise<StkPushResponse> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;
    const password = SafaricomDarajaApi.generatePassword(
      this.businessShortCode,
      this.passkey
    );

    const formatedPhone = phone.startsWith("0")
      ? `254${phone.substring(1)}`
      : phone;

    const stkPushRequestBody: StkPushRequest = {
      BusinessShortCode: this.businessShortCode,
      Password: password,
      Timestamp: SafaricomDarajaApi.generateTimeStamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formatedPhone,
      PartyB: this.businessShortCode,
      PhoneNumber: formatedPhone,
      CallBackURL: callbackUrl || "https://example.com/callback",
      AccountReference: process.env.DARAJA_API_APP_NAME || "Test Payment",
      TransactionDesc: "Payment",
    };

    const response: AxiosResponse<StkPushResponse> = await axios.post(
      url,
      stkPushRequestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }

  /**
   * Query a transaction status
   */
  async queryTransactionStatus(
    BusinessShortCode: string,
    Password: string,
    Timestamp: string,
    CheckoutRequestID: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/stkpushquery/v1/query`;

    const requestBody = {
      BusinessShortCode,
      Password,
      Timestamp,
      CheckoutRequestID,
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  /**
   * Transaction Reversal
   */
  async reverseTransaction(
    shortCode: string,
    password: string,
    timestamp: string,
    transactionID: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/reversal/v1/request`;

    const requestBody = {
      Initiator: shortCode,
      SecurityCredential: password, // Safaricom expects encrypted password
      CommandID: "TransactionReversal",
      TransactionID: transactionID,
      Amount: 1000, // Example amount
      ReceiverParty: shortCode,
      RecieverIdentifierType: "11", // Identifier type for M-Pesa user
      Remarks: "Reversal of transaction",
      QueueTimeOutURL: "https://example.com/timeout", // Handle timeout callbacks
      ResultURL: "https://example.com/result", // Handle result callbacks
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  /**
   * B2C Payment Request
   */
  async b2cPayment(
    shortCode: string,
    password: string,
    amount: number,
    partyA: string,
    partyB: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`;

    const requestBody = {
      InitiatorName: shortCode,
      SecurityCredential: password, // Safaricom expects encrypted password
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: partyA, // Your shortcode
      PartyB: partyB, // Phone number
      Remarks: "Payment from business",
      QueueTimeOutURL: "https://example.com/timeout",
      ResultURL: "https://example.com/result",
      Occasion: "Payment for services",
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  //============================================

  /**
   * Handles the final confirmation of the transaction after processing.
   * @param confirmationData - The confirmation request data from M-Pesa
   * @returns An object containing the status of the transaction
   */
  public handleTransactionConfirmation(confirmationData: any): {
    success: boolean;
    message: string;
    data?: any;
  } {
    const { ResultCode, TransAmount, MpesaReceiptNumber, BillRefNumber } =
      confirmationData;

    // Check if the transaction was successful
    if (ResultCode === 0) {
      // Transaction successful, process the data
      this.recordTransaction({
        amount: TransAmount,
        receiptNumber: MpesaReceiptNumber,
        accountNumber: BillRefNumber,
      });

      return {
        success: true,
        message: "Transaction confirmed successfully",
        data: {
          amount: TransAmount,
          receiptNumber: MpesaReceiptNumber,
        },
      };
    } else {
      // Handle failed transaction
      return {
        success: false,
        message: "Transaction failed",
      };
    }
  }

  private recordTransaction(transactionData: any) {
    // Implement logic to save the transaction to your database or system
  }

  /**=======================================================================
   * Handles validation of incoming transactions
   * @param validationData - The validation request data from M-Pesa
   * @returns A response indicating whether to accept or reject the transaction
   */
  public handleTransactionValidation(validationData: any): {
    success: boolean;
    message: string;
  } {
    const { TransactionType, TransAmount, BillRefNumber } = validationData;

    // Custom logic to check the validity of the transaction
    if (TransactionType !== "PayBill" || TransAmount <= 0) {
      return {
        success: false,
        message: "Invalid transaction type or amount",
      };
    }

    // Check if BillRefNumber (account number) exists in your system
    const accountExists = this.checkAccountExists(BillRefNumber);

    if (!accountExists) {
      return {
        success: false,
        message: "Account does not exist",
      };
    }

    // Validation passed
    return {
      success: true,
      message: "Transaction accepted",
    };
  }

  private checkAccountExists(accountNumber: string): boolean {
    // Implement your logic to check if the account exists in your system
    return true; // Return true if valid, false if not
  }

  /**
   * Generate password using short code, passkey, and timestamp
   */
  static generatePassword(
    shortcode: string,
    passkey: string,
    timestamp: string = SafaricomDarajaApi.generateTimeStamp()
  ): string {
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  }

  static generateTimeStamp() {
    const date = new Date();
    return (
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2)
    );
  }
}

export const safaricomDarajaApi = new SafaricomDarajaApi();
