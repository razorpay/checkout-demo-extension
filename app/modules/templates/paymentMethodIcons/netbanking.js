export default (foregroundColor, backgroundColor) =>
  `<svg width="28" height="25" viewBox="0 0 28 25" xmlns="http://www.w3.org/2000/svg">
      <path fill="${foregroundColor}" d="M4 15a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0v-5zM10 15a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0v-5zM16 15a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0v-5zM1 25a1 1 0 0 1 0-2h20a1 1 0 0 1 0 2H1zM1 12c-.978 0-1.374-1.259-.573-1.82l10-7a1 1 0 0 1 1.146 0l1.426 1L13 9l1 3H1zm3.172-2h8.814l.017-3.378L11 5.221 4.172 10z"/>
      <path d="M20 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" fill="${backgroundColor}"/>
      <path d="M27 8H13" stroke="${backgroundColor}" stroke-width="2" fill="#FFF"/>
      <path d="M20.395 1.352l1.21-.704C23 3.045 23.7 5.498 23.7 8c0 2.501-.701 4.955-2.095 7.352l-1.21-.704C21.668 12.46 22.3 10.246 22.3 8c0-2.246-.632-4.46-1.905-6.648zM19.605 14.648l-1.21.704C17 12.955 16.3 10.502 16.3 8c0-2.501.701-4.955 2.095-7.352l1.21.704C18.332 3.54 17.7 5.754 17.7 8c0 2.246.632 4.46 1.905 6.648z" fill="${backgroundColor}"/>
  </svg>`;
