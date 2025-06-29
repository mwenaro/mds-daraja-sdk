// Jest test file for SafaricomDarajaApi
// @ts-nocheck
// Ensure you have @types/jest installed for type support

import { SafaricomDarajaApi, StkPushRequest, StkPushResponse } from './SafaricomDarajaApi';

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
};

describe('SafaricomDarajaApi', () => {
  let daraja: SafaricomDarajaApi;

  beforeEach(() => {
    daraja = new SafaricomDarajaApi({
      consumerKey: 'mockConsumerKey',
      consumerSecret: 'mockConsumerSecret',
      shortCode: '123456',
      passkey: 'mockPassKey',
      baseUrl: 'https://sandbox.safaricom.co.ke',
      axiosInstance: mockAxiosInstance as any,
    });
    jest.clearAllMocks();
  });

  it('should generate access token', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { access_token: 'mockAccessToken' } });
    const accessToken = await daraja.getAccessToken();
    expect(accessToken).toBe('mockAccessToken');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: expect.stringContaining('Basic') } }
    );
  });

  it('should initiate STK push', async () => {
    const mockStkResponse: StkPushResponse = {
      MerchantRequestID: '123',
      CheckoutRequestID: '321',
      ResponseCode: '0',
      ResponseDescription: 'Success',
      CustomerMessage: 'Request accepted',
    };
    jest.spyOn(daraja, 'getAccessToken').mockResolvedValue('mockAccessToken');
    mockAxiosInstance.post.mockResolvedValue({ data: mockStkResponse });
    const stkPushRequest: StkPushRequest = {
      phoneNumber: '254700000000',
      amount: 100,
      accountReference: 'Test123',
      transactionDesc: 'Payment',
      callbackUrl: 'https://example.com/callback',
    };
    const result = await daraja.stkPush(stkPushRequest);
    expect(result).toEqual(mockStkResponse);
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      '/mpesa/stkpush/v1/processrequest',
      expect.objectContaining({
        BusinessShortCode: '123456',
        Amount: 100,
        PhoneNumber: '254700000000',
        CallBackURL: 'https://example.com/callback',
        AccountReference: 'Test123',
        TransactionDesc: 'Payment',
      }),
      { headers: { Authorization: 'Bearer mockAccessToken' } }
    );
  });

  it('should throw if required STK push params are missing', async () => {
    await expect(
      daraja.stkPush({
        phoneNumber: '',
        amount: 0,
        accountReference: '',
        transactionDesc: '',
      })
    ).rejects.toThrow('Missing required STK Push parameters.');
  });
});
