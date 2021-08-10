import InstrumentsConfig, {
  genericGroupedToIndividual,
} from './instruments-config';

/**
 * Returns individual instruments from an instrument that might contain a group.
 * @param {Instrument} instrument
 * @param {Customer} customer
 *
 * @returns {Array<Instrument>}
 */
export function getIndividualInstruments(instrument, customer) {
  const method = instrument.method;
  const config = InstrumentsConfig[method];

  let individuals = config.groupedToIndividual(instrument, customer);

  /**
   * For methods like card and upi, they have their own `groupedToIndividual` methods.
   * However, if they fail to ungroup, we will pass them through the generic function.
   */
  if (individuals.length === 0) {
    individuals = genericGroupedToIndividual(instrument, customer);
  }

  return _Obj.extend(
    {
      _ungrouped: individuals,
    },
    instrument
  );
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

  _Arr.loop(instruments, (instrument) => {
    const individuals = getIndividualInstruments(instrument, customer);

    ungrouped.push(individuals);
  });

  return _Obj.extend(_Obj.clone(block), {
    instruments: ungrouped,
  });
}
