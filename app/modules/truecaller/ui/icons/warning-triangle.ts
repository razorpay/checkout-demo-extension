export default (
  color = '#D12D2D'
) => `<svg id="warning" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
    <path fill="#fff" stroke="${color}" stroke-width="1.4" d="m16.5 12.7-6-10.5a1.6 1.6 0 0 0-3 0l-6 10.5c-.6 1 .2 2.5 1.4 2.5h12.2c1.2 0 2-1.4 1.4-2.5Z"/>
    <path stroke="${color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 6v3m0 3v0"/>
  </svg>`;
