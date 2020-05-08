export const formatters = [
  {
    flag: '**',
    type: 'bold',
  },
  {
    flag: '__',
    type: 'italic',
  },
];

export const tokenizeTextForFormatter = (tokenText, formatter) => {
  return tokenText.split(formatter.flag).map((text, i) => {
    return { text: text, type: i % 2 ? formatter.type : 'plain' };
  });
};

export const tokenizeTextForFormatters = token => {
  let _tokenized = token;
  formatters.forEach(formatter => {
    _tokenized = _tokenized.reduce((pV, cV) => {
      if (cV.type === 'plain') {
        return [...pV, ...tokenizeTextForFormatter(cV.text, formatter)];
      }
      pV.push(cV);
      return pV;
    }, []);
  });
  return _tokenized;
};
