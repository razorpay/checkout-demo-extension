export default (foregroundColor: string, backgroundColor = '#0D2366') =>
  `<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18.9 6.25024H2.1V4.12524H18.9V6.25024ZM18.9 16.8752H2.1V9.50024H18.9V16.8752ZM18.9 2.00024H2.1C0.9345 2.00024 0 2.94587 0 4.12524V16.8752C0 17.4388 0.221249 17.9793 0.615076 18.3778C1.0089 18.7764 1.54305 19.0002 2.1 19.0002H18.9C19.457 19.0002 19.9911 18.7764 20.3849 18.3778C20.7787 17.9793 21 17.4388 21 16.8752V4.12524C21 3.56166 20.7787 3.02116 20.3849 2.62264C19.9911 2.22413 19.457 2.00024 18.9 2.00024Z" fill="${foregroundColor}"/>
  <rect x="15.5718" y="9.42854" width="4.71429" height="9.42857" rx="2.35714" fill="white" stroke="${backgroundColor}" stroke-width="1.57143"/>
  <rect x="14.0007" y="13.357" width="7.85714" height="6.28571" rx="0.785714" fill="white" stroke="${backgroundColor}" stroke-width="1.57143"/>
  </svg>
`;
