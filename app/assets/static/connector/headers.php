<?php
$headers = <<<EOT
Cache-Control:"max-age=0, no-cache, no-store, must-revalidate"
Pragma:"no-cache"
Expires:"Wed, 11 Jan 1984 05:00:00 GMT"
P3P:CP="We dont have P3P headers"
EOT;

$headers = explode("\n", $headers);

foreach ($headers as $header) {
  header($header);
}
