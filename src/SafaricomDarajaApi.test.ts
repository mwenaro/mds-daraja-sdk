// // safaricom-daraja.test.ts
// import { SafaricomDarajaApi, StkPushRequest, StkPushResponse } from './SafaricomDarajaApi';
// import axios from 'axios';

// // Mock axios for testing
// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// describe('SafaricomDarajaApi', () => {
//   let safaricomDarajaApi: SafaricomDarajaApi;

//   beforeEach(() => {
//     safaricomDarajaApi = new SafaricomDarajaApi(
//       'mockConsumerKey',
//       'mockConsumerSecret',
//       'mockBusinessShortCode',
//       'mockPassKey'
//     );
//   });

//   it('should generate access token', async () => {
//     const mockAccessToken = 'mockAccessToken';
//     mockedAxios.get.mockResolvedValue({
//       data: { access_token: mockAccessToken }
//     });

//     const accessToken = await safaricomDarajaApi.getAccessToken();
//     expect(accessToken).toBe(mockAccessToken);
//     expect(mockedAxios.get).toHaveBeenCalledWith(
//       'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
//       { headers: { Authorization: 'Basic bW9ja0NvbnN1bWVyS2V5Om1vY2tDb25zdW1lclNlY3JldA==' } }
//     );
//   });

//   it('should register URLs', async () => {
//     const mockResponseData = { ResponseDescription: 'Success' };
//     mockedAxios.post.mockResolvedValue({ data: mockResponseData });

//     const result = await safaricomDarajaApi.registerUrls('https://example.com/confirm', 'https://example.com/validate');
//     expect(result).toEqual(mockResponseData);
//     expect(mockedAxios.post).toHaveBeenCalled();
//   });

//   it('should initiate STK push', async () => {
//     const mockStkResponse: StkPushResponse = {
//       MerchantRequestID: '123',
//       CheckoutRequestID: '321',
//       ResponseCode: '0',
//       ResponseDescription: 'Success',
//       CustomerMessage: 'Request accepted'
//     };
    
//     mockedAxios.post.mockResolvedValue({ data: mockStkResponse });

//     const stkPushRequest: StkPushRequest = {
//       BusinessShortCode: 'mockBusinessShortCode',
//       Password: 'mockPassword',
//       Timestamp: 'mockTimestamp',
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: 100,
//       PartyA: '254700000000',
//       PartyB: 'mockBusinessShortCode',
//       PhoneNumber: '254700000000',
//       CallBackURL: 'https://example.com/callback',
//       AccountReference: 'Test123',
//       TransactionDesc: 'Payment'
//     };

//     const result = await safaricomDarajaApi.initiateStkPush(stkPushRequest);
//     expect(result).toEqual(mockStkResponse);
//     expect(mockedAxios.post).toHaveBeenCalledWith(
//       'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
//       stkPushRequest,
//       { headers: { Authorization: 'Bearer mockAccessToken', 'Content-Type': 'application/json' } }
//     );
//   });

//   it('should handle transaction confirmation', () => {
//     const confirmationData = {
//       ResultCode: 0,
//       TransAmount: 100,
//       MpesaReceiptNumber: '12345',
//       BillRefNumber: 'Test123'
//     };

//     const result = safaricomDarajaApi.handleTransactionConfirmation(confirmationData);

//     expect(result).toEqual({
//       success: true,
//       message: 'Transaction confirmed successfully',
//       data: {
//         amount: 100,
//         receiptNumber: '12345',
//       }
//     });
//   });

//   it('should validate transactions', () => {
//     const validationData = {
//       TransactionType: 'PayBill',
//       TransAmount: 100,
//       BillRefNumber: 'Test123'
//     };

//     const result = safaricomDarajaApi.handleTransactionValidation(validationData);
//     expect(result).toEqual({
//       success: true,
//       message: 'Transaction accepted'
//     });
//   });

//   it('should check account balance', async () => {
//     const mockResponseData = { ResultDescription: 'Success' };
//     mockedAxios.post.mockResolvedValue({ data: mockResponseData });

//     const result = await safaricomDarajaApi.checkBalance(
//       'shortCode', 'password', 'timestamp', 'partyA'
//     );
//     expect(result).toEqual(mockResponseData);
//   });

//   // Additional tests for other methods like b2cPayment, reverseTransaction, queryTransactionStatus
// });
