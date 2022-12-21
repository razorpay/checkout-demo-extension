import InstrumentsConfig, {
  genericGroupedToIndividual,
} from './instruments-config';
import * as ObjectUtils from 'utils/object';
import type {
  Block,
  Instruments,
  InstrumentsConfigMethod,
} from 'configurability/types';
import type { Customer } from 'emiV2/types/tokens';

/**
 * Returns individual instruments from an instrument that might contain a group.
 * @param {Instrument} instrument
 * @param {Customer} customer
 *
 * @returns {Array<Instrument>}
 */
export function getIndividualInstruments(
  instrument: Instruments,
  customer?: Customer
) {
  const method = instrument.method;
  const config = InstrumentsConfig[method as InstrumentsConfigMethod];

  let individuals = config.groupedToIndividual(instrument, customer);

  /**
   * For methods like card and upi, they have their own `groupedToIndividual` methods.
   * However, if they fail to ungroup, we will pass them through the generic function.
   */
  if (individuals.length === 0) {
    individuals = genericGroupedToIndividual(instrument);
  }

  return Object.assign(
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
export function ungroupInstruments(block: Block, customer?: Customer) {
  const instruments = block.instruments as Instruments[];
  const ungrouped: Instruments[] = [];

  instruments.forEach((instrument) => {
    const individuals = getIndividualInstruments(
      instrument,
      customer
    ) as Instruments;

    ungrouped.push(individuals);
  });

  return Object.assign(ObjectUtils.clone(block), {
    instruments: ungrouped,
  });
}
