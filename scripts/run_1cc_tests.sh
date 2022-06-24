#! /bin/bash

npm run test:unit:1cc:coverage

file="${GITHUB_WORKSPACE}/log-1cc.txt"

metrics=()
i=1
while read line; do  
  if [[ $line == *"Statements"* || $line == *"Branches"* || $line == *"Functions"* || $line == *"Lines"* ]]; then
    metrics+=("$line")
  fi
#Reading each line
i=$((i+1))  
done < $file

export STATEMENTS=${metrics[0]}
export BRANCHES=${metrics[1]}
export FUNCTIONS=${metrics[2]}
export LINES=${metrics[3]}

echo "${STATEMENTS},${BRANCHES}, ${FUNCTIONS}, ${LINES}" >> ut1ccMetrics.csv