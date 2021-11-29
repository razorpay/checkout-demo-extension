import { render } from '@testing-library/svelte';
import SavedCard from '../index.svelte';
import { setupPreferences } from 'tests/setupPreferences';

describe('Billing Address Collection for Saved Cards', () => {
  beforeEach(() => {
    setupPreferences();
  });
  describe('AVS flag enabled', () => {
    it('Should render the saved cards screen', () => {
      const { component } = render(SavedCard, {});
      expect(component).toBeTruthy();
    });
  });
});
