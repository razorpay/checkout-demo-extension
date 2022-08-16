SELECT ARRAY_JOIN(flow_subset, '-'), COUNT(*)
FROM (
  SELECT
  CAST(COALESCE(JSON_EXTRACT(properties, '$.data.flowCode'), JSON_PARSE('[]')) AS ARRAY(int)) AS f
  FROM hive.events.lumberjack_intermediate
  WHERE event_name = 'submit'
  AND producer_created_date = '2022-08-15'
  AND JSON_EXTRACT_SCALAR(context,'$.env') = 'canary'
) AS t1(flows)
CROSS JOIN UNNEST(
  combinations(flows, 1) || combinations(flows, 2) || combinations(flows, 3) || combinations(flows, 4) || combinations(flows, 5)
) AS t2(flow_subset)
GROUP BY 1
ORDER BY 2 DESC
