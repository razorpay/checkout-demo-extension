const glob = require('glob').sync;
const { writeFileSync, readFileSync } = require('fs');
const { execSync } = require('child_process');

const blankTag = '<style></style>';
const styles = {};

let filename = process.argv[2];

if (!filename) {
  process.exit(1);
}

// filename = 'app/modules/ui/components/emi.svelte';
//const files = glob(filename || 'app/modules/**/*.svelte');
const files = glob(filename);

files.forEach(f => {
  let html = String(readFileSync(f)).replace(/<style>.+<\/style>/s, function(
    style
  ) {
    styles[f] = style;
    return blankTag;
  });
  console.log(html);
  writeFileSync(f, html);
});

execSync(`../svelte-upgrade/bin v3 ${filename || 'app/modules'} -f`);

files.forEach(f => {
  let html = String(readFileSync(f)).replace(blankTag, styles[f] || '');
  console.log(html);
  writeFileSync(f, html);
});
