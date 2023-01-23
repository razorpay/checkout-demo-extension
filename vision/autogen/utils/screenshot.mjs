import fs from 'fs/promises';
import { execSync } from 'child_process';
import { md5 } from './index.mjs';
import { matchScreenshot } from './matchScreenshot.mjs';
import {
  getExistingRef,
  getMapPath,
  storeRef,
  refStore,
} from '#vision/autogen/utils/ref.mjs';
import {
  HistoryType,
  RECORD_MODE,
  HEADLESS,
  TEST_DIR,
  BASE_DIR,
} from '#vision/autogen/utils/constants.mjs';

const filesWritten = new Set();
async function captureScreenshot(page) {
  const shotBuffer = await page.screenshot({
    fullPage: true,
  });
  const hash = md5(shotBuffer);
  if (!filesWritten.has(hash)) {
    filesWritten.add(hash);
    await fs.writeFile(`${TEST_DIR}/${hash}.png`, shotBuffer);
  }
  return { fileName: hash, buffer: shotBuffer };
}

function getPathFromHistory(history) {
  const paths = [];
  const requests = [];
  for (let action of history) {
    if (
      (action.type === HistoryType.REQUEST ||
        action.type === HistoryType.OPTIONS) &&
      action.name &&
      action.id
    ) {
      const name = storeRef(action.name);
      const id = storeRef(action.id);
      requests.push(`${name}-${id}`);
    } else if (
      action.type === HistoryType.CLICK ||
      action.type === HistoryType.FILL
    ) {
      if (requests.length) {
        paths.push(requests.sort().join());
        requests.length = 0;
      }
      const name = storeRef(action.name);
      const variant = storeRef(action.variant);
      const value = storeRef(action.value);
      paths.push(`${name}-${variant}-${value}`);
    }
  }
  if (requests.length) {
    paths.push(requests.sort().join());
  }
  return paths.join();
}

const matching = new Set();
const notMatching = new Set();
export async function capture(pageState) {
  const { page, state } = pageState;

  if (!HEADLESS) {
    return;
  }

  const path = getPathFromHistory(state.history);

  if (refStore.test.shots[path]) {
    throw new Error(`screenshot already exists for path ${path}`);
  }

  const { fileName, buffer } = await captureScreenshot(page);
  refStore.test.shots[path] = fileName;

  const refShot = refStore.shots[path];

  if (refShot) {
    const baseFilePath = `${BASE_DIR}/${refShot}.png`;
    const diffPath = `${TEST_DIR}/diff-${fileName}.png`;

    // compare
    const result = await matchScreenshot(baseFilePath, buffer, diffPath);
    if (result) {
      matching.add(path);
    } else {
      notMatching.add(path);
    }
  }
}

export async function report() {
  const baseCount = Object.keys(refStore.shots).length;
  const testCount = Object.keys(refStore.test.shots).length;

  const matched = matching.size;
  const notMatched = notMatching.size;

  const missing = baseCount - matched - notMatched;
  const newShots = testCount - matched - notMatched;

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

  await fs.writeFile(getMapPath(TEST_DIR), JSON.stringify(await getTestMap()));

  if (RECORD_MODE) {
    execSync(
      `rm -rf "${BASE_DIR}"; mv "${TEST_DIR}" "${BASE_DIR}"; rm -rf ${BASE_DIR}/diff-*.png`
    );
  }

  return testSuccess ? 0 : 1;
}

async function getTestMap() {
  const { refs, shots } = refStore.test;
  const maxNum = refs.size;

  const occurances = new Set();
  const overflowing = new Set();
  const idMap = Object.create(null);
  const newShots = Object.create(null);
  const newRefs = Array(maxNum);

  for (let id of refs) {
    if (id > maxNum) {
      overflowing.add(id);
    } else {
      occurances.add(id);
      idMap[id] = id;
      newRefs[id - 1] = refStore.refs[id - 1];
    }
  }

  const overflowingItr = overflowing.values();
  for (let i = 0; i < maxNum; i++) {
    if (!occurances.has(i)) {
      const nextOverflowing = overflowingItr.next().value;
      if (nextOverflowing) {
        idMap[nextOverflowing] = i + 1;
        newRefs[i] = refStore.refs[nextOverflowing];
      } else {
        break;
      }
    }
  }

  Object.entries(shots).forEach(([path, shotName]) => {
    const newPath = path.replace(/\d+/g, (match) => idMap[match]);
    newShots[newPath] = shots[path];
  });

  return {
    shots: newShots,
    refs: newRefs,
  };
}
