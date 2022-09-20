import { getSelectedEmiBank } from 'emiV2/store';
import { getCurrentTab } from 'emiV2/ui/components/EmiTabsScreen/store';
import type * as EmiTabs from '../types/emiTabs';
import { get } from 'svelte/store';
import { selectedTab } from 'components/Tabs/tabStore';
import type { Instrument, EMIBANKS, TabList } from 'emiV2/types';
import { cardlessTabProviders, tabLabels, tabValues } from 'emiV2/constants';
import { getSelectedSavedCard } from './card';
import { formatTemplateWithLocale } from 'i18n';

const { CREDIT, DEBIT, DEBIT_CARDLESS, CARDLESS } = tabValues;

const formateTabNameWithLocale = (tab: string, locale: string) => {
  return formatTemplateWithLocale(tab, {}, locale);
};

/**
 * If user is coming from custom block we need to filter out the tabs based on istrument
 * For emi block we won't show cardless tab if it is there
 * For cardless emi block we need to hide the credit and debit card tab
 * @param tabs
 * @param instrument
 * @returns Array<tabs>
 */
export const filterTabsAgainstInstrument = (
  tabs: EmiTabs.TabList,
  instrument: Instrument
): EmiTabs.TabList => {
  if (!instrument) {
    return tabs;
  }

  if (instrument.method === 'emi') {
    return tabs.filter((tab) => tab.value === CREDIT || tab.value === DEBIT);
  } else if (instrument.method === 'cardless_emi') {
    return tabs.filter(
      (tab) => tab.value === CARDLESS || tab.value === DEBIT_CARDLESS
    );
  }
  return [];
};

/*
  Return the list of tabs to be shown in EMI plan selection screen
  Based on whether debit, credit or cardless emi is available
  @returns {Array<Tabs>}
*/
export const getEmiTabs = (instrument: Instrument, locale: string): TabList => {
  const selectedSavedCard = getSelectedSavedCard();
  const selectedBank = getSelectedEmiBank();
  const currentTab = getCurrentTab();

  if (!selectedBank) {
    return [];
  }
  /**
   * If selected emi option is Bajaj manually select Bajaj plans
   */
  if (selectedBank.code && cardlessTabProviders.includes(selectedBank.code)) {
    return [
      {
        label: formateTabNameWithLocale(tabLabels[CARDLESS], locale),
        value: CARDLESS,
      },
    ];
  }

  /**
   * From saved card manuall select the tab as the card type
   */
  if (selectedSavedCard && selectedSavedCard.card) {
    const { card } = selectedSavedCard;
    return [
      {
        label: formateTabNameWithLocale(tabLabels[card.type], locale),
        value: card.type,
      },
    ];
  }
  const tablist: EmiTabs.TabList = [];
  if (getSelectedEmiBank()?.creditEmi) {
    tablist.push({
      label: formateTabNameWithLocale(tabLabels[CREDIT], locale),
      value: CREDIT,
    });
  }

  const currentBank: EMIBANKS | null = getSelectedEmiBank();
  if (currentBank && currentBank.code) {
    /**
      if selected bank exists has both debit and cardless emi show both tabs
      else check for debit_emi_providers and show debit & cardless emi (if cardless for that bank is enabled)
    */
    if (currentBank.debitEmi && currentBank.isCardless) {
      tablist.push({
        label: formateTabNameWithLocale(tabLabels[DEBIT], locale),
        value: DEBIT,
      });
      tablist.push({
        label: formateTabNameWithLocale(tabLabels[CARDLESS], locale),
        value: CARDLESS,
      });
    } else if (
      currentBank.debitCardlessConfig &&
      currentBank.debitCardlessConfig.meta &&
      currentBank.isCardless
    ) {
      tablist.push({
        label: formateTabNameWithLocale(tabLabels[DEBIT_CARDLESS], locale),
        value: DEBIT_CARDLESS,
      });
    } else {
      // Else check for tab availability individually
      // if debit card emi is available
      // Show debit card tab
      if (currentBank.debitEmi) {
        tablist.push({
          label: formateTabNameWithLocale(tabLabels[DEBIT], locale),
          value: DEBIT,
        });
      }
      // If debit card & cardless emi is available and bank is eligible for cardless
      // Show debit&cardless tab
      if (
        currentBank.debitCardlessConfig &&
        currentBank.debitCardlessConfig.meta &&
        currentBank.isCardless
      ) {
        tablist.push({
          label: formateTabNameWithLocale(tabLabels[DEBIT_CARDLESS], locale),
          value: DEBIT_CARDLESS,
        });
      }
      // If debit card & cardless emi is available
      // Show debit&cardless tab
      if (currentBank.isCardless) {
        tablist.push({
          label: formateTabNameWithLocale(tabLabels[CARDLESS], locale),
          value: CARDLESS,
        });
      }
    }
  }

  const filteredTabList: TabList = filterTabsAgainstInstrument(
    tablist,
    instrument
  );

  // For the first time when the user lands on tab screen
  // make the first tab as the default tab
  if (!currentTab && filteredTabList && filteredTabList?.length > 0) {
    selectedTab.set(filteredTabList[0].value);
  }
  return filteredTabList;
};

/**
 * Returns true if current tab is cardless or debit and cardless
 * Returns {Boolean}
 */
export const isCardlessTab = () => {
  const tab: string = get(selectedTab);
  return !['credit', 'debit'].includes(tab);
};
