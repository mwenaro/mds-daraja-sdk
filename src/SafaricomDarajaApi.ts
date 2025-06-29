// safaricom-daraja.ts
import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * STK Push request parameters.
 */
export interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

/**
 * STK Push response structure.
 */
export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export class SafaricomDarajaApi {
  private axios: AxiosInstance;
  private consumerKey: string;
  private consumerSecret: string;
  private shortCode: string;
  private passkey: string;
  private baseUrl: string;

  constructor(options?: {
    consumerKey?: string;
    consumerSecret?: string;
    shortCode?: string;
    passkey?: string;
    baseUrl?: string;
  }) {
    this.consumerKey = options?.consumerKey || process.env.DARAJA_CONSUMER_KEY || "";
    this.consumerSecret = options?.consumerSecret || process.env.DARAJA_CONSUMER_SECRET || "";
    this.shortCode = options?.shortCode || process.env.DARAJA_SHORT_CODE || "";
    this.passkey = options?.passkey || process.env.DARAJA_PASSKEY || "";
    this.baseUrl = options?.baseUrl || process.env.DARAJA_BASE_URL || "https://sandbox.safaricom.co.ke";
    this.axios = axios.create({ baseURL: this.baseUrl });
  }

  /**
   * Initiate an STK Push request.
   */
  async stkPush(request: StkPushRequest): Promise<StkPushResponse> {
    this.validateStkPushRequest(request);
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString("base64");
    const callbackUrl = request.callbackUrl || process.env.DARAJA_CALLBACK_URL;
    if (!callbackUrl) throw new Error("Callback URL must be provided.");

    try {
      const response = await this.axios.post(
        "/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: request.amount,
          PartyA: request.phoneNumber,
          PartyB: this.shortCode,
          PhoneNumber: request.phoneNumber,
          CallBackURL: callbackUrl,
          AccountReference: request.accountReference,
          TransactionDesc: request.transactionDesc,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data as StkPushResponse;
    } catch (error: any) {
      throw new Error(
        `STK Push failed: ${error.response?.data?.errorMessage || error.message}`
      );
    }
  }

  /**
   * Get OAuth access token.
   */
  async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");
    try {
      const response = await this.axios.get("/oauth/v1/generate?grant_type=client_credentials", {
        headers: { Authorization: `Basic ${credentials}` },
      });
      return response.data.access_token;
    } catch (error: any) {
      throw new Error(
        `Failed to get access token: ${error.response?.data?.errorMessage || error.message}`
      );
    }
  }

  private getTimestamp(): string {
    const date = new Date();
    return (
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0") +
      String(date.getHours()).padStart(2, "0") +
      String(date.getMinutes()).padStart(2, "0") +
      String(date.getSeconds()).padStart(2, "0")
    );
  }

  private validateStkPushRequest(request: StkPushRequest) {
    if (!request.phoneNumber || !request.amount || !request.accountReference || !request.transactionDesc) {
      throw new Error("Missing required STK Push parameters.");
    }
  }
}

export const safaricomDarajaApi = new SafaricomDarajaApi();
