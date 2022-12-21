const urlToKey = (url = '') => url.replace(/[:\/.*]/g, '_');

export default function loadScript(url: string, id: string) {
  const key = id || urlToKey(url);
  if (document.getElementById(key)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.onerror = reject;
    script.async = true;
    script.id = key;
    script.onload = resolve;
    script.addEventListener('error', reject);
    script.addEventListener('load', resolve);
    document.body.appendChild(script);
  });
}
