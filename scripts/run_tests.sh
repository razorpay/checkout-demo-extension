#! /bin/bash

export START_TIME=$(date +%s)
echo "start-time: ${START_TIME}"

npm run test:unit:coverage

export END_TIME=$(date +%s)
echo "end-time: ${END_TIME}"

export PASSED=$(jq '.numPassedTests' test-results.json)
export SKIPPED=$(jq '.numPendingTests' test-results.json)
export FAILED=$(jq '.numFailedTests' test-results.json)

echo "${START_TIME},${END_TIME}, ${PASSED}, ${SKIPPED}, ${FAILED}" >> utMetrics.csv
