import InstrumentsConfig from './instruments-config';

/**
 * Returns individual instruments from an instrument that might contain a group.
 * @param {Instrument} instrument
 *
 * @returns {Array<Instrument>}
 */
function getIndividualInstruments(instrument) {
  const method = instrument.method;
  const config = InstrumentsConfig[method];

  if (config.isIndividual(instrument)) {
    return [instrument];
  }

  const individuals = config.groupedToIndividual(instrument);

  return individuals;
}

/**
 * Ungroups instruments from a block.
 * @param {Block} block
 *
 * @returns {Block}
 */
export function ungroupInstruments(block) {
  const instruments = block.instruments;
  let ungrouped = [];

  _Arr.loop(instruments, instrument => {
    const individuals = getIndividualInstruments(instrument);

    ungrouped = _Arr.mergeWith(ungrouped, individuals);
  });

  return _Obj.extend(_Obj.clone(block), {
    instruments: ungrouped,
  });
}
