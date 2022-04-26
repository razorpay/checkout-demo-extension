function getCdnUrl() {
  if (window.location.hostname === 'api.razorpay.com') {
    return 'https://cdn.razorpay.com';
  }
  return 'https://betacdn.np.razorpay.in';
}

export function loadInterFont() {
  const cdnUrl = getCdnUrl();

  const snippet = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 300;
      font-display: swap;
      src: url(${cdnUrl}/fonts/Inter-Light.ttf) format('truetype');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: normal;
      font-display: swap;
      src: url(${cdnUrl}/fonts/Inter.ttf) format('truetype');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 500;
      font-display: swap;
      src: url(${cdnUrl}/fonts/Inter-Medium.ttf) format('truetype');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url(${cdnUrl}/fonts/Inter-SemiBold.ttf) format('truetype');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: bold;
      font-display: swap;
      src: url(${cdnUrl}/fonts/Inter-Bold.ttf') format('truetype');
    }
  `;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(snippet));

  head.appendChild(style);
}
