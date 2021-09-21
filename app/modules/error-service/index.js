// normal export won't work
import { SEVERITY_LEVELS } from './models';
import * as utils from './error-service';

// hence default export is added
export default { SEVERITY_LEVELS, ...utils };
