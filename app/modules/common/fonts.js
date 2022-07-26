import { Events } from 'analytics';
import { isCssLoaded, loadCSS } from 'utils/doc';

const INTER_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap';

export function loadInterFont() {
  if (!isCssLoaded(INTER_FONT_URL)) {
    loadCSS(INTER_FONT_URL).catch((e) => {
      Events.TrackMetric('inter_font_load_failure', {
        data: {
          error: e,
        },
      });
    });
  }
}
