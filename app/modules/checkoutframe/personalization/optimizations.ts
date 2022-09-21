import { isDesktop } from 'common/useragent';
import { getAmount, isInternational } from 'razorpay';
import type { Method } from 'types/types';
import { isInternationalCustomer } from 'common/international';
import {
  ALLOWED_METHODS_GT_PIVOT_AMOUNT,
  ALLOWED_METHODS_LTE_PIVOT_AMOUNT,
  ALLOWED_METHODS_BY_DEVICE,
  PIVOT_AMOUNT,
} from './constants';
import type { Personalization } from './personalization';

function partition<T>(array: T[], isValid: (arg: T) => boolean): [T[], T[]] {
  return array.reduce(
    ([pass, fail], elem: T) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[], []] as [T[], T[]]
  );
}

const optimizeForIntent = (instruments: Personalization.Instrument[]) => {
  const [intent, nonIntent] = partition(
    instruments,
    (instrument) => instrument['_[flow]'] === 'intent'
  );

  // sort them to ensure that the highest score comes first
  const sortedIntentInstruments = intent.sort((a, b) =>
    typeof a.score === 'number' && typeof b.score === 'number'
      ? b.score - a.score
      : 0
  );

  // reduce to unique apps with the highest score per app
  const uniqueIntentInstruments = sortedIntentInstruments.reduce((pV, cV) => {
    const apps = pV.map((x) => x.upi_app);
    if (apps.includes(cV.upi_app)) {
      return pV;
    }
    return [...pV, cV];
  }, [] as Personalization.Instrument[]);

  return [...nonIntent, ...uniqueIntentInstruments];
};

export const optimizeForAmount = (
  instruments: Personalization.Instrument[]
) => {
  /**
   * Since we have a pivot amount, lets do this only for non-international payments.
   */
  if (isInternationalCustomer() || isInternational()) {
    return instruments;
  }
  let ALLOWED_METHODS: Method[] = [];
  if (isDesktop()) {
    ALLOWED_METHODS =
      getAmount() > PIVOT_AMOUNT
        ? ALLOWED_METHODS_GT_PIVOT_AMOUNT
        : ALLOWED_METHODS_LTE_PIVOT_AMOUNT;
  }

  if (ALLOWED_METHODS.length) {
    return instruments.filter((instrument) =>
      ALLOWED_METHODS.includes(instrument.method)
    );
  }

  return instruments;
};

export const optimizeForDevice = (
  instruments: Personalization.Instrument[]
) => {
  /**
   * Since we have a pivot amount, lets do this only for non-international payments.
   */
  if (isInternationalCustomer() || isInternational()) {
    return instruments;
  }
  const ALLOWED_METHODS = isDesktop()
    ? ALLOWED_METHODS_BY_DEVICE.desktop
    : ALLOWED_METHODS_BY_DEVICE.mobile;

  return instruments.filter((instrument) =>
    ALLOWED_METHODS.includes(instrument.method)
  );
};

export const optimizeInstruments = ({
  instruments,
}: {
  instruments: Personalization.Instrument[];
}) => {
  let optimizedInstruments = optimizeForDevice(instruments);
  optimizedInstruments = optimizeForAmount(optimizedInstruments);
  optimizedInstruments = optimizeForIntent(optimizedInstruments);
  return optimizedInstruments;
};
