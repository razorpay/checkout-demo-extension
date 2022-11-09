export default (foregroundColor: string, backgroundColor: string) =>
  `<svg viewBox="0 0 28 25" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 15a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5zm6 0a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5zm6 0a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5zM1 25a1 1 0 0 1 0-2h20a1 1 0 0 1 0 2H1zm0-13c-.978 0-1.374-1.259-.573-1.82l10-7a1 1 0 0 1 1.146 0l1.426 1L13 9l1 3H1zm3.172-2h8.814l.017-3.378L11 5.221 4.172 10z" fill="${foregroundColor}"/>
    <circle xmlns="http://www.w3.org/2000/svg" cx="20" cy="8" r="7" fill="#fff" stroke="${backgroundColor}" stroke-width="1.9" />
    <path style="transform: translate(-3.4px, -2.6px)" fill="#fff" d="M19 9.5h9L26 7M28 12h-9l2 2.5" stroke="${backgroundColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
