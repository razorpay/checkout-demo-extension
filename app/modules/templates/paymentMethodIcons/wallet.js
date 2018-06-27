export default (foregroundColor, backgroundColor) =>
  `<svg width="25" height="23" viewBox="0 0 25 23" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd">
      <path d="M-2-2h28v28H-2z"/>
      <g transform="translate(0 5)">
        <path d="M2 2v14h19v-5h2.011V5H21V2H2zm0-2h19a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="${foregroundColor}" fill-rule="nonzero"/>
        <circle fill="${foregroundColor}" cx="17" cy="9" r="1"/>
      </g>
      <g fill="${backgroundColor}" fill-rule="nonzero">
        <path d="M7.326 5L16 2.11V5h2V2.11A2 2 0 0 0 15.368.211L1 5h6.326zM15 12v4h8v-4h-8zm0-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/>
      </g>
    </g>
  </svg>`;
