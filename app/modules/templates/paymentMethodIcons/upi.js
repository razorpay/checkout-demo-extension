export default (foregroundColor, backgroundColor) =>
  `<svg width="21" height="24" viewBox="0 0 21 24" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd">
      <path d="M-3-2h28v28H-3z"/>
      <path d="M9.516 20.254l9.15-8.388-6.1-8.388-1.185 6.516 1.629 2.042-2.359 1.974-1.135 6.244zM12.809.412l8 11a1 1 0 0 1-.133 1.325l-12 11c-.707.648-1.831.027-1.66-.916l1.42-7.805 3.547-3.01-1.986-5.579 1.02-5.606c.157-.865 1.274-1.12 1.792-.41z" fill="${backgroundColor}" fill-rule="nonzero"/>
      <path d="M5.566 3.479l-3.05 16.775 9.147-8.388-6.097-8.387zM5.809.412l7.997 11a1 1 0 0 1-.133 1.325l-11.997 11c-.706.648-1.831.027-1.66-.916l4-22C4.174-.044 5.292-.299 5.81.412z" fill="${foregroundColor}" fill-rule="nonzero"/>
    </g>
  </svg>`;
