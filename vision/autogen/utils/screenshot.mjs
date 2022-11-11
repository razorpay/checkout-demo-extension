import fs from 'fs/promises';
import { execSync } from 'child_process';
import { compare } from 'odiff-bin';
// import pixelmatch from 'pixelmatch';
// import { PNG } from 'pngjs';
import { md5 } from './index.mjs';
import { RECORD_MODE, HEADLESS, HistoryType } from './constants.mjs';

const BASE_DIR = 'vision/autogen/screenshots/base/';
const TEMP_DIR = 'vision/autogen/screenshots/temp/';

execSync(`rm -rf ${TEMP_DIR}/*; mkdir -p ${TEMP_DIR}`);

async function matchScreenshot(firstImagePath, secondImagePath) {
  const diffPath = secondImagePath.replace(/\.png$/, '') + `-diff.png`;
  const { match, reason } = await compare(
    firstImagePath,
    secondImagePath,
    diffPath
  );
  return match;
  return doPixelMatch(firstImagePath, secondImagePath, diffPath);
}

function readImage(path) {
  return new Promise((resolve) =>
    fs.open(path).then((handle) => {
      return handle
        .createReadStream()
        .pipe(new PNG())
        .on('parsed', function () {
          resolve(this);
        });
    })
  );
}

async function doPixelMatch(firstImagePath, secondImagePath, diffPath) {
  const [firstImage, secondImage] = await Promise.all([
    readImage(firstImagePath),
    readImage(secondImagePath),
  ]);

  if (
    firstImage.width !== secondImage.width ||
    firstImage.height !== secondImage.height
  ) {
    console.log(`dimension mismatch`);
    return false;
  }

  const { width, height } = firstImage;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    firstImage.data,
    secondImage.data,
    diff.data,
    width,
    height
  );

  if (mismatchedPixels) {
    const handle = await fs.open(diffPath, 'w+');
    diff.pack().pipe(handle.createWriteStream());
    return false;
  }

  return true;
}

async function captureScreenshot(page) {
  const shotBuffer = await page.screenshot({
    fullPage: true,
  });
  const name = md5(shotBuffer);
  await fs.writeFile(`${TEMP_DIR}${name}.png`, shotBuffer);
  return name;
}

function getMapPath(dir) {
  return `${dir}map.json`;
}

async function getReferenceMap() {
  try {
    return JSON.parse(String(await fs.readFile(getMapPath(BASE_DIR))));
  } catch (e) {
    return {
      count: 0,
      snaps: [],
      refs: {},
    };
  }
}

const referenceMap = await getReferenceMap();
referenceMap.newCount = 0;
referenceMap.newRefs = {};

function updateCursor(state) {
  let cursor = state.cursor || referenceMap;

  const actions = state.history.slice(state.offset).filter((action) => {
    if (action.hash) {
      referenceMap.newRefs[action.hash] = {
        url: action.url,
        method: action.method,
        value: action.value,
      };
    } else if (action.type === HistoryType.REQUEST) {
      return false; // remove static files
    }
    return true;
  });
  const existingSnap = cursor.snaps.find((existingSnap) => {
    if (existingSnap.events.length === actions.length) {
      return existingSnap.events.every((event, index) => {
        const action = actions[index];
        switch (action.type) {
          case HistoryType.REQUEST:
          case HistoryType.OPTIONS:
            return action.hash === event;

          default:
            return (
              action.name === event[0] &&
              action.variant === event[1] &&
              action.value === event[2]
            );
        }
      });
    }
  });

  if (existingSnap) {
    cursor = existingSnap;
  } else {
    const snap = {
      snaps: [],
      events: actions.map((action) => {
        return action.hash || [action.name, action.variant, action.value];
      }),
    };
    cursor.snaps.push(snap);
    cursor = snap;
  }

  state.offset = state.history.length;
  state.cursor = cursor;
  return cursor;
}

export async function capture(pageState) {
  const { page, state } = pageState;

  // insert new entries appeared in history
  const cursor = updateCursor(state);

  if (!HEADLESS) {
    return;
  }

  referenceMap.newCount++;
  const fileName = await captureScreenshot(page);
  cursor.newKey = fileName;

  if (cursor.key) {
    const baseFilePath = `${BASE_DIR}${cursor.key}.png`;
    const filePath = `${TEMP_DIR}${fileName}.png`;

    // compare
    const result = await matchScreenshot(baseFilePath, filePath);
    if (result) {
      cursor.match = true;

      // its possible for pixels to match despite md5 not matching
      // restore base file in that case to avoid file changing in git diffs
      if (cursor.key !== fileName) {
        cursor.newKey = cursor.key;
        await Promise.all([
          fs.unlink(filePath),
          fs.copyFile(baseFilePath, `${TEMP_DIR}${cursor.key}.png`),
        ]);
      }
    }
  }
}

export async function report() {
  const { map, matched, notMatched, newShots } = mapFromReference(
    referenceMap,
    {
      count: referenceMap.newCount,
      snaps: [],
      refs: referenceMap.newRefs,
    }
  );
  const missing = referenceMap.count - matched - notMatched;
  console.table({
    'Screenshots Matched': {
      count: matched,
      result: matched ? '✅' : '❌',
    },
    'Screenshots Not Matching': {
      count: notMatched,
      result: notMatched ? '❌' : '✅',
    },
    'Screenshots Missing': {
      count: missing,
      result: missing ? '⚠️' : '✅',
    },
    'New Screenshots': {
      count: newShots,
      result: newShots ? '⚠️' : '✅',
    },
  });

  const testSuccess = !Boolean(missing + notMatched + newShots);
  console.log(`Test ${testSuccess ? 'was successful' : 'failed'}`);

  await fs.writeFile(getMapPath(TEMP_DIR), JSON.stringify(map));
  if (RECORD_MODE) {
    execSync(
      `rm -rf "${BASE_DIR}"; mv "${TEMP_DIR}" "${BASE_DIR}"; rm -rf ${BASE_DIR}*-diff.png`
    );
  }

  console.log(
    `You can view results at http://localhost:8000/autotest${
      RECORD_MODE ? '-base' : ''
    }`
  );

  return testSuccess ? 0 : 1;
}

function mapFromReference(referenceMap, map) {
  let notMatched = 0;
  let matched = 0;
  let newShots = 0;

  referenceMap.snaps.forEach((snap) => {
    if (!snap.newKey) {
      return;
    }
    if (snap.match) {
      matched++;
    } else if (snap.key) {
      notMatched++;
    } else {
      newShots++;
    }

    const newSnap = {
      key: snap.newKey,
      events: snap.events,
    };
    map.snaps.push(newSnap);

    if (snap.snaps) {
      newSnap.snaps = [];
    }
    const subresult = mapFromReference(snap, newSnap);
    notMatched += subresult.notMatched;
    matched += subresult.matched;
    newShots += subresult.newShots;
  });

  return {
    map,
    matched,
    notMatched,
    newShots,
  };
}
