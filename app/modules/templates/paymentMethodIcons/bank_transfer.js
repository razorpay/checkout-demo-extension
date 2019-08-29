export default (foregroundColor, backgroundColor) =>
  `<svg viewBox="0 0 30 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.288 17.143a1.071 1.071 0 1 1 2.143 0V22.5a1.071 1.071 0 0 1-2.143 0v-5.357zM13.716 17.143a1.071 1.071 0 1 1 2.143 0V22.5a1.071 1.071 0 0 1-2.143 0v-5.357zM20.145 17.143a1.071 1.071 0 1 1 2.143 0V22.5a1.071 1.071 0 0 1-2.143 0v-5.357zM4.073 27.857a1.071 1.071 0 0 1 0-2.143h21.429a1.071 1.071 0 0 1 0 2.143H4.073z" fill="${foregroundColor}"/>
    <path d="M14.49 5.222L25.38 13H3.21L14.49 5.222z" stroke="${foregroundColor}" stroke-width="2"/>
    <circle cx="23.5" cy="10.5" r="7.6" fill="#fff" stroke="${backgroundColor}" stroke-width="1.8"/>
    <path d="M19 9.5h9L26 7M28 12h-9l2 2.5" stroke="${backgroundColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `;
