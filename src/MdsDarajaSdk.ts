import axios, { AxiosResponse } from "axios";

export class MdsDarajaSdk {
  private consumerKey: string;
  private consumerSecret: string;
  private baseUrl: string;

  constructor(
    consumerKey: string,
    consumerSecret: string,
    sandbox: boolean = true
  ) {
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.baseUrl = sandbox
      ? "https://sandbox.safaricom.co.ke"
      : "https://api.safaricom.co.ke";
  }

  private async getAccessToken(): Promise<string> {
    const url = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    const credentials = `${this.consumerKey}:${this.consumerSecret}`;
    const auth = Buffer.from(credentials).toString("base64");

    const response: AxiosResponse = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  }

  async initiateStkPush(
    businessShortCode: string,
    password: string,
    timestamp: string,
    phoneNumber: string,
    amount: number,
    callbackUrl: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;

    const requestBody = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: "TestPayment",
      TransactionDesc: "TestPayment",
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  async reverseTransaction(
    shortCode: string,
    password: string,
    transactionID: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/reversal/v1/request`;

    const requestBody = {
      Initiator: shortCode,
      SecurityCredential: password,
      CommandID: "TransactionReversal",
      TransactionID: transactionID,
      Amount: 1,
      ReceiverParty: shortCode,
      RecieverIdentifierType: "11",
      Remarks: "Reversal",
      QueueTimeOutURL: "https://example.com/timeout",
      ResultURL: "https://example.com/result",
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  async initiateB2cPayment(
    shortCode: string,
    password: string,
    phoneNumber: string,
    amount: number
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`;

    const requestBody = {
      InitiatorName: shortCode,
      SecurityCredential: password,
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: shortCode,
      PartyB: phoneNumber,
      Remarks: "Payment to customer",
      QueueTimeOutURL: "https://example.com/timeout",
      ResultURL: "https://example.com/result",
      Occassion: "Payment",
    };

    const response: AxiosResponse = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  static generatePassword(businessShortCode: string, passkey: string): string {
    const timestamp = MdsDarajaSdk.generateTimeStamp();
    const dataToEncode = `${businessShortCode}${passkey}${timestamp}`;
    return Buffer.from(dataToEncode).toString("base64");
  }

  static generateTimeStamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    const seconds = `0${date.getSeconds()}`.slice(-2);
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}
