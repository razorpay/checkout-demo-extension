import fs from 'fs/promises';
import { execSync } from 'child_process';
import { compare } from 'odiff-bin';
// import pixelmatch from 'pixelmatch';
// import { PNG } from 'pngjs';
import { RECORD_MODE, HEADLESS } from './index.mjs';

const BASE_DIR = 'vision/autogen/screenshots/';
const TEMP_DIR = 'vision/autogen/.screenshots-temp/';

execSync(`rm -rf ${TEMP_DIR}/*; mkdir -p ${TEMP_DIR}`);

async function matchScreenshot(firstImagePath, secondImagePath) {
  const diffPath = secondImagePath.replace(/\.png$/, '') + `-diff.png`;
  const { match, reason } = await compare(firstImagePath, secondImagePath, diffPath);
  return match;
  return doPixelMatch(firstImagePath, secondImagePath, diffPath);
}

function readImage(path) {
  return new Promise(resolve => fs
    .open(path)
    .then(handle => {
      return handle.createReadStream()
        .pipe(new PNG())
        .on('parsed', function() {
          resolve(this);
        });
    })
  );
}

async function doPixelMatch(firstImagePath, secondImagePath, diffPath) {
  const [ firstImage, secondImage ] = await Promise.all([
    readImage(firstImagePath),
    readImage(secondImagePath),
  ]);

  if (firstImage.width !== secondImage.width || firstImage.height !== secondImage.height) {
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
    height,
  );

  if (mismatchedPixels) {
    const handle = await fs.open(diffPath, 'w+');
    diff.pack().pipe(handle.createWriteStream());
    return false;
  }

  return true;
}

function captureScreenshot(page, path) {
  return page.screenshot({
    path,
    fullPage: true,
  });
}

function getMapPath(dir) {
  return `${dir}map.json`;
}

async function getReferenceMap() {
  try {
    return JSON.parse(String(await fs.readFile(getMapPath(BASE_DIR))));
  } catch(e) {
    return {
      data: {},
      count: 0,
    }
  }
}

const referenceMap = await getReferenceMap();
const map = referenceMap;
map.newCount = 0;

function pathLabel(historySlice) {
  if (historySlice.length === 1) {
    const first = historySlice[0];
    if (first.type === 'requests' && !first.label) {
      return 'req';
    }
    return first.label;
  }
  return historySlice.map(h => h.label).filter(Boolean).join();
}

function getPath(map, labels) {
  let parent = map;
  for (let label of labels) {
    if (parent = parent.data[label]) {
      continue;
    }
  }
  return parent;
}

export async function capture(pageState) {
  const { page, state } = pageState;

  let label = pathLabel(state.history.slice(state.offset));

  if (!state.offset) {
    label = state.labels[0] += ',' + label;
    pageState.path = map;
  } else {
    if (!pageState.path) {
      pageState.path = getPath(map, state.labels);
    }
    state.labels.push(label);
  }

  state.offset = state.history.length;

  if (!pageState.path.data) {
    pageState.path.data = {};
  }
  if (!pageState.path.data[label]) {
    pageState.path.data[label] = {};
  }
  pageState.path = pageState.path.data[label];

  if (!HEADLESS) {
    return;
  }

  const fileName = ++map.newCount;
  const filePath = `${TEMP_DIR}${fileName}.png`;
  await captureScreenshot(page, filePath);
  pageState.path.newShot = fileName;

  if (pageState.path.shot) {
    const baseFilePath = `${BASE_DIR}${pageState.path.shot}.png`;

    // compare
    const result = await matchScreenshot(baseFilePath, filePath);
    if (!result) {
      console.error('no match for path', state.labels);
    } else {
      pageState.path.match = true;
    }
  }
}

export async function report() {
  const { map, matched, notMatched, newShots } = mapFromReference(referenceMap, {
    count: referenceMap.newCount,
  });
  const missing = referenceMap.newCount - matched - notMatched - newShots;
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
  console.log(`Test ${testSuccess ? "was successful" : "failed"}`);

  await fs.writeFile(getMapPath(TEMP_DIR), JSON.stringify(map));
  if (RECORD_MODE) {
    execSync(`rm -rf "${BASE_DIR}"; mv "${TEMP_DIR}" "${BASE_DIR}"; rm -rf "${BASE_DIR}*-diff.png"`);
  }

  return testSuccess ? 0 : 1;
}

function mapFromReference(referenceMap, map) {
  let notMatched = 0;
  let matched = 0;
  let newShots = 0;

  for (let o of Object.entries(referenceMap.data)) {
    if (o[1].newShot) {
      if (o[1].match) {
        matched++;
      } else if (o[1].shot) {
        notMatched++;
      } else {
        newShots++;
      }
      if (!map.data) {
        map.data = {};
      }
      map.data[o[0]] = {
        shot: o[1].newShot
      };
      if (o[1].data) {
        const subresult = mapFromReference(o[1], map.data[o[0]]);
        notMatched += subresult.notMatched;
        matched += subresult.matched;
        newShots += subresult.newShots;
      }
    }
  }

  return {
    map,
    matched,
    notMatched,
    newShots,
  };
}
