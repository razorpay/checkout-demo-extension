/**
 * Attaches listeners that add functionality
 * to the Log Out dropdown
 * @param {Session} session
 */
export function attachLogoutListeners(session) {
  const profile = _Doc.querySelector('#profile');
  const topRight = _Doc.querySelector('#top-right');

  function outsideDropdownListener(event) {
    const open = _El.hasClass(topRight, 'focus');

    if (open) {
      const isTargetTopRight =
        _El.closest(event.target, '#top-right') === topRight;

      /**
       * If the user has clicked outside of the dropdown, collapse
       * and don't let the click propagate
       */
      if (!isTargetTopRight) {
        event.stopPropagation();
        hideDropdown();
      }
    }
  }

  function showDropdown() {
    _El.addClass(topRight, 'focus');

    /**
     * Attach listener on body to collapse the dropdown
     * when the dropdown is open and the user clicks
     * somewhere outside the dropdown
     */
    document.body.addEventListener('click', outsideDropdownListener, true);
  }

  function hideDropdown() {
    _El.removeClass(topRight, 'focus');

    document.body.removeEventListener('click', outsideDropdownListener);
  }

  /**
   * Toggle the dropdown every time it's clicked on
   */
  topRight.addEventListener('click', event => {
    event.preventDefault();

    const open = _El.hasClass(topRight, 'focus');

    if (open) {
      hideDropdown();
    } else {
      showDropdown();
    }
  });

  /**
   * When the user clicks on one of the buttons, do something.
   *
   * This should probably have individual click listeners, once we move this to Svelte.
   */
  profile.addEventListener('click', event => {
    event.preventDefault();

    const target = event.target;

    if (target.tagName !== 'LI') {
      return;
    }

    if (_Obj.getSafely(target.dataset, 'all')) {
      session.logUserOutOfAllDevices(session.customer);
    } else {
      session.logUserOut(session.customer);
    }
  });
}
