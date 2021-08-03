function partition(array, isValid) {
  return array.reduce(
    ([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[], []]
  );
}

const optimiseForIntent = (instruments) => {
  const [intent, nonIntent] = partition(
    instruments,
    (instrument) => instrument['_[flow]'] === 'intent'
  );

  // sort them to ensure that the highest score comes first
  const sortedIntentInstruments = intent.sort((a, b) => {
    return a.score < b.score ? 1 : -1;
  });

  // reduce to unique apps with the highest score per app
  const uniqueIntentInstruments = sortedIntentInstruments.reduce((pV, cV) => {
    let apps = pV.map((x) => x.upi_app);
    if (apps.includes(cV.upi_app)) {
      return pV;
    }
    return [...pV, cV];
  }, []);

  return [...nonIntent, ...uniqueIntentInstruments];
};

export const optimizeInstruments = ({ instruments }) => {
  return optimiseForIntent(instruments);
};
