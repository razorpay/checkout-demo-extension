import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { TEST_DIR, BASE_DIR } from '#vision/autogen/utils/constants.mjs';

// remove test screenshot directory,
// create test & base screenshot directory if not exists
execSync(`
  rm -rf ${TEST_DIR}/*
  mkdir -p ${TEST_DIR}
  mkdir -p ${BASE_DIR}
`);

export const getMapPath = (dir) => `${dir}/map.json`;

export const refStore = {
  valueMap: new Map(),
  refs: [],
  shots: Object.create(null),

  test: {
    refs: new Set(),
    shots: Object.create(null),
  },
};

function loadReferenceMap() {
  const filePath = getMapPath(BASE_DIR);

  try {
    const fileContents = String(readFileSync(filePath));
    const mapObject = JSON.parse(fileContents);

    refStore.shots = mapObject.shots;
    refStore.refs = mapObject.refs;

    mapObject.refs.forEach((value, index) => {
      const id = index + 1;
      refStore.valueMap.set(value, id);
    });
  } catch (e) {}
}
loadReferenceMap();

export function getExistingRef(value) {
  if (typeof value !== 'string' && typeof value !== 'boolean') {
    throw new Error('non string/boolean response');
  }
  return refStore.valueMap.get(value);
}

export function storeRef(value) {
  let id = getExistingRef(value);
  if (!id) {
    id = refStore.refs.push(value);
    refStore.valueMap.set(value, id);
  }
  refStore.test.refs.add(id); // set only has unique values
  return id;
}
