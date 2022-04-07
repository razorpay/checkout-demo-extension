const { getDataAttrSelector } = require('./common');

async function openVernacularFromHeader(context) {
  const cta = await getDataAttrSelector(context, 'vernacular-cta');
  await cta.click();
}

async function selectLanguage(context, lang) {
  const langEle = await getDataAttrSelector(context, `lang-${lang}`);
  await langEle.click();

  // TODO: investiage why not working without 2nd click
  await langEle.click();
}

async function verifyVernacularString(context, langString) {
  const langEle = await getDataAttrSelector(context, 'vernacular-text');
  const langEleText = await context.page.evaluate(
    (ele) => ele.textContent,
    langEle
  );
  expect(langEleText).toContain(langString);
}

module.exports = {
  openVernacularFromHeader,
  selectLanguage,
  verifyVernacularString,
};
