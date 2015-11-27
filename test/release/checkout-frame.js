window.payment_methods = {
  "entity":"methods",
  "card":true,
  "netbanking":{"ALLA":"Allahabad Bank","ANDB":"Andhra Bank","UTIB":"Axis Bank","BBKM":"Bank of Bahrain & Kuwait","BARB_C":"Bank of Baroda - Corporate Banking","BARB_R":"Bank of Baroda - Retail Banking","BKID":"Bank of India","MAHB":"Bank of Maharashtra","CNRB":"Canara Bank","CSBK":"Catholic Syrian Bank","CBIN":"Central Bank of India","CIUB":"City Union Bank","COSB":"Cosmos Co-Operative Bank","BKDN":"Dena Bank","DEUT":"Deutsche Bank","DCBL":"Development Credit Bank","DLXB":"Dhanalakshmi Bank","FDRL":"Federal Bank","HDFC":"HDFC Bank","ICIC":"ICICI Bank","IBKL":"IDBI Bank","VYSA":"ING Vysya Bank","IDIB":"Indian Bank","IOBA":"Indian Overseas Bank","INDB":"IndusInd Bank","JAKA":"Jammu & Kashmir Bank","JSBP":"Janata Sahakari Bank Ltd","KARB":"Karnataka Bank","KVBL":"Karur Vysya Bank","LAVB_C":"Lakshmi Vilas Bank - Corporate Banking","LAVB_R":"Lakshmi Vilas Bank - Retail Banking","NKGS":"North Kanara GSB Co-op. Bank","ORBC":"Oriental Bank of Commerce","PMCB":"Punjab & Maharashtra Co-operative Bank","PSIB":"Punjab & Sind Bank","PUNB_C":"Punjab National Bank - Corporate Banking","PUNB_R":"Punjab National Bank - Retail Banking","RATN":"Ratnakar Bank","ABNA":"Royal Bank of Scotland","SRCB":"Saraswat Co-Operative Bank","SVCB":"Shamrao Vithal Co-operative Bank","SIBL":"South Indian Bank","SBBJ":"State Bank of Bikaner & Jaipur","SBHY":"State Bank of Hyderabad","SBIN":"State Bank of India","SBMY":"State Bank of Mysore","STBP":"State Bank of Patiala","SBTR":"State Bank of Travancore","SYNB":"Syndicate Bank","TNSC":"Tamil Nadu State Apex Co-Operative Bank","TMBL":"Tamilnad Mercantile Bank","UCBA":"UCO Bank","UBIN":"Union Bank of India","UTBI":"United Bank of India","VIJB":"Vijaya Bank","YESB":"Yes Bank"},
  "wallet":{
    "paytm":true,
    "mobikwik":false,
    "payzapp":false
  }
};


describe('handleMessage should', function(){

  it('be defined', function(){
  	expect(typeof handleMessage).toBe('function');
  });

  it('show checkout form', function(){
    expect(jQuery('#container').length).toBe(0);
    handleMessage({options: {key: 'rzp_test_1DP5mmOlF5G5ag', amount: '30000'}});
    expect(jQuery('#container').length).toBe(1);
  })
})