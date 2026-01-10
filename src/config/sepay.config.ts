export default () => ({
  sepay: {
    apiKey: process.env.SEPAY_API_KEY,              
    baseUrl: process.env.SEPAY_BASE_URL,     
    bankId: 'TPB',                                   
    accountNo: '43311032004',               
  }
});
