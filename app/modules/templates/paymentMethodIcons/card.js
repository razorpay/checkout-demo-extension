export default (foregroundColor, backgroundColor) =>
  `<svg width="27" height="22" viewBox="0 0 27 22" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <path id="a" d="M0 0h28v28H0z"/>
    </defs>
    <g transform="translate(0 -3)" fill="none" fill-rule="evenodd">
      <mask id="b" fill="#fff">
        <use xlink:href="#a"/>
      </mask>
      <path d="M2 10v13h18v-5H7v-8H2zm0-2h5v10h15v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" fill="${backgroundColor}" fill-rule="nonzero" mask="url(#b)"/>
      <g mask="url(#b)" fill="${foregroundColor}" fill-rule="nonzero">
        <path d="M7 5v13h18V5H7zm0-2h18a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
        <path d="M10.004 16.003a1 1 0 1 1 0-2h2a1 1 0 0 1 0 2h-2zM6.718 10.005a1 1 0 1 1 0-2h19a1 1 0 0 1 0 2h-19z"/>
      </g>
    </g>
  </svg>`;
