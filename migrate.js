const glob = require('glob').sync;
const { writeFileSync, readFileSync } = require('fs');
const { execSync } = require('child_process');

const blankTag = '<style></style>';
const styles = {};

let filename;
// filename = 'app/modules/templates/views/emi.svelte';
const files = glob(filename || 'app/modules/**/*.svelte');

files.forEach(f => {
  let html = String(readFileSync(f)).replace(/<style>.+<\/style>/s, function(
    style
  ) {
    styles[f] = style;
    return blankTag;
  });
  writeFileSync(f, html);
});

execSync(`../svelte-upgrade/bin v3 ${filename || 'app/modules'} -f`);

files.forEach(f => {
  let html = String(readFileSync(f)).replace(blankTag, styles[f] || '');
  writeFileSync(f, html);
});
