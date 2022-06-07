export function loadInterFont() {
  const head = document.head || document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap';
  link.rel = 'stylesheet';

  head.appendChild(link);
}
