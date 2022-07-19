import { FRAME_CSS_URL, FRAME_JS_URL } from 'common/constants';
import { loadCSS, loadJS } from 'utils/doc';

loadJS(FRAME_JS_URL).catch(() => {
  // appending retry flag which can be used in tracking (To be added later)
  loadJS(FRAME_JS_URL + '?retry');
});

loadCSS(FRAME_CSS_URL).catch(() => {
  loadCSS(FRAME_CSS_URL + '?retry');
});
