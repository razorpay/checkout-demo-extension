import InstrumentsConfig from './instruments-config';

/**
 * Returns individual instruments from an instrument that might contain a group.
 * @param {Instrument} instrument
 * @param {Customer} customer
 *
 * @returns {Array<Instrument>}
 */
function getIndividualInstruments(instrument, customer) {
  const method = instrument.method;
  const config = InstrumentsConfig[method];

  if (config.isIndividual(instrument)) {
    return [instrument];
  }

  const individuals = config.groupedToIndividual(instrument, customer);

  return individuals;
}

/**
 * Ungroups instruments from a block.
 * @param {Block} block
 * @param {Customer} customer
 *
 * @returns {Block}
 */
export function ungroupInstruments(block, customer) {
  const instruments = block.instruments;
  let ungrouped = [];

  _Arr.loop(instruments, instrument => {
    const individuals = getIndividualInstruments(instrument, customer);

    ungrouped = _Arr.mergeWith(ungrouped, individuals);
  });

  return _Obj.extend(_Obj.clone(block), {
    instruments: ungrouped,
  });
}
