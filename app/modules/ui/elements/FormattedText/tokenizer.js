const formatters = [
  {
    flag: '<strong>',
    type: 'strong',
  },
  {
    flag: '<i>',
    type: 'italic',
  },
  {
    flag: '<em>',
    type: 'emphasis',
  },
  {
    flag: '<b>',
    type: 'bold',
  },
  {
    flag: /<span color=".*?">/,
    type: 'coloredFont',
    colorPicker: /color=".*?"/,
  },
];

const tokenizeTextForFormatter = (tokenText, formatter) => {
  return tokenText.split(formatter.flag).map((text, i) => {
    const type = i % 2 ? formatter.type : 'plain';
    let color = undefined;
    if (type === 'coloredFont') {
      color = tokenText.match(formatter.colorPicker).shift().split('"')[1];
    }
    return { text, type, color };
  });
};

/**
 * @description converts marked strings to recognizable tokens
 *
 * @param {String} text text to be converted into tokens
 *
 * @variation FeatureRequest would need changes to support nesting of tags **This will __not__ work **
 * @example tokenizeTextForFormatters(textToBeFormatted) -> [{"text":"This ","type":"plain"},{"text":"might","type":"italic"},{"text":" work","type":"plain"}]
 */
export const tokenizeTextForFormatters = (text) => {
  let _tokenized = [
    {
      text: text,
      type: 'plain',
    },
  ];
  formatters.forEach((formatter) => {
    _tokenized = _tokenized.reduce((pV, cV) => {
      if (cV.type === 'plain') {
        return pV.concat(tokenizeTextForFormatter(cV.text, formatter));
      }
      pV.push(cV);
      return pV;
    }, []);
  });
  return _tokenized;
};
