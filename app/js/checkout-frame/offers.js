var selectedClass = ' selected',
  appliedClass = ' applied',
  discountClass = ' has-discount',
  singleOfferClass = 'single-offer';

/**
 * Get an element onto which things can be dumped
 *
 * @returns {Element}
 */
function getBlackhole() {
  var blackhole = document.querySelector('#blackhole');

  if (!blackhole) {
    blackhole = document.createElement('div');

    blackhole.id = 'blackhole';
    blackhole.classList.add('hidden');

    document.body.appendChild(blackhole);
  }

  return blackhole;
}

var createNode = function(html) {
  var dummyDiv = document.createElement('div');

  dummyDiv.innerHTML = html;

  return dummyDiv.firstElementChild || dummyDiv.firstChild;
};

/**
 * Creates an Offer entity and adds it to the DOM.
 * @param {Object} data Offer data
 * @param {Object} options Options containing callbacks and helpers
 */
function Offer(data, options) {
  var that = this;

  this.data = data;
  this.discount = data.original_amount - data.amount;

  // Create DOM elements and get references to them
  var $el = (this.$el = createNode(
      templates.offer({
        name: data.name,
        description: data.display_text,
        discount: this.discount > 0 && options.formatAmount(this.discount),
        removable: data.removable,
      })
    )),
    $offerTitle = $el.querySelector('.offer-title'),
    $removeOffer = $el.querySelector('.remove-offer');

  // Add click listener
  $offerTitle.onclick = function() {
    options.onOfferSelection(that);
  };

  // Add remove listener if removal is allowed
  if ($removeOffer) {
    $removeOffer.onclick = function() {
      options.onOfferRemoval();
    };
  }
}

var offerProto = Offer.prototype;

/**
 * Invoked when an offer is selected.
 */
offerProto.select = function() {
  if (this.isSelected) {
    return;
  }

  this.isSelected = true;
  this.$el.className = this.$el.className + selectedClass;
};

/**
 * Invoked when an offer is deselected.
 */
offerProto.deselect = function() {
  if (!this.isSelected) {
    return;
  }

  this.isSelected = false;
  this.$el.className = this.$el.className.replace(selectedClass, '');
};

/**
 * Invoked when an offer is applied.
 */
offerProto.apply = function() {
  if (this.isApplied) {
    return;
  }

  this.isApplied = true;
  this.$el.className = this.$el.className + appliedClass;
};

/**
 * Invoked when an offer is removed.
 * Offer is deselected an unapplied.
 */
offerProto.remove = function() {
  if (!this.isApplied) {
    return;
  }

  this.deselect();
  this.isApplied = false;
  this.$el.className = this.$el.className.replace(appliedClass, '');
};

/**
 * Initializes Offers
 * @param {Element} $container Reference to the container elem
 * @param {Array<Object>} offersData List of offers
 * @param {Object} filter Filters
 * @param {Function} onApplyOffer Callback for when an offer is applied
 * @param {Function} onRemoveOffer Callback for when an offer is removed
 * @param {Function} formatAmount Function to format amount
 * @param {Element} $root Root element onto which we attach classes
 */
function initOffers(
  $container,
  offersData,
  filter,
  onApplyOffer,
  onRemoveOffer,
  formatAmount,
  $root
) {
  // Create offers strip and get references
  var $el = createNode(templates.offers()),
    $numOffers = $el.querySelector('.num-offers'),
    $offersTitle = $el.querySelector('.offers-title'),
    $singleOfferText = $offersTitle.querySelector('.single-offer-text-content'),
    $selectedOfferTitle = $offersTitle.querySelector(
      '.selected-offer .offer-title'
    ),
    $selectedOfferDiscount = $offersTitle.querySelector(
      '.selected-offer .offer-title .discount'
    ),
    $selectedOfferDiscountAmount = $selectedOfferDiscount.querySelector(
      '.discount-amount'
    );

  // Create offers list and get references
  var $offersListCont = createNode(templates.offerslist()),
    $offersListTitle = $offersListCont.querySelector('.offers-list-title'),
    $offersList = $offersListCont.querySelector('.offers-list'),
    $applyOffer = $offersListCont.querySelector('.apply-offer');

  var $offersError = null,
    $offersErrorCancel = null,
    $offersErrorPay = null,
    offersErrorResolutionCb = null;

  var appliedOffer,
    selectedOffer,
    allOffers,
    visibleOffers,
    shouldShowOfferList = false;

  /**
   * Append offers list to DOM
   * and select the offer if there's only one offer
   */
  function showOfferList() {
    if (visibleOffers.length === 1) {
      // select first offer automatically if there is only one offer
      offers.selectOffer(visibleOffers[0]);
    }

    $root.appendChild($offersListCont);
  }

  /**
   * Remove offers list from DOM
   */
  function hideOfferList() {
    $offersListCont.remove();
  }

  /**
   * Toggle the offers list
   */
  function toggleOfferList() {
    return (shouldShowOfferList = !shouldShowOfferList)
      ? showOfferList()
      : hideOfferList();
  }

  /**
   * Remove any error that might be present.
   */
  function hideOfferError() {
    if (!$offersError) {
      return;
    }

    $offersError.remove();
    $offersError = $offersErrorPay = $offersErrorCancel = null;
  }

  /**
   * Append given offer to the list of offers in DOM
   * @param {Offer} offer Instance of Offer
   */
  function appendOffer(offer) {
    $offersList.appendChild(offer.$el);
    return offer;
  }

  var offers = {
    /**
     * Apply filters on the offers
     * and display offers.
     */
    applyFilter: function applyFilter(criteria) {
      var criteriaKeys = Object.keys(criteria || {});

      /**
       * Clear elements from $offersList
       *
       * We're not setting innerHTML directly
       * because that destroys innerHTML
       * of the children too, on IE.
       * https://stackoverflow.com/questions/25167593/why-does-ie-discard-the-innerhtml-children-of-a-dom-element-after-dom-changes
       */
      var _children = Array.from($offersList.childNodes);

      each(_children, function(_index, _child) {
        getBlackhole().appendChild(_child);
      });

      // If there's a criteria, filter
      if (criteriaKeys.length > 0) {
        visibleOffers = criteriaKeys.reduce(function(offers, key) {
          return offers.reduce(function(filteredOffers, offer) {
            var criteriaCheck = false;
            if (Array.isArray(criteria[key])) {
              criteriaCheck = criteria[key].indexOf(offer.data[key]) > -1;
            } else {
              criteriaCheck = criteria[key] === offer.data[key];
            }

            return (
              criteriaCheck && (appendOffer(offer), filteredOffers.push(offer)),
              filteredOffers
            );
          }, []);
        }, allOffers);
      } else {
        visibleOffers = allOffers.map(appendOffer);
      }

      this.display(visibleOffers.length !== 0);
    },

    /**
     * Display or hide Offers based on the param passed
     * @param {Boolean} shouldDisplay
     */
    display: function display(shouldDisplay) {
      var isAttached = document.body.contains($el.parentElement);

      if (!shouldDisplay) {
        shouldShowOfferList = false;
        hideOfferList();
        return isAttached && $container.removeChild($el);
      }

      var numVisibleOffers = visibleOffers.length;

      if (numVisibleOffers > 1) {
        $($el).removeClass(singleOfferClass);
        $numOffers.innerText =
          numVisibleOffers + ' Offer' + (numVisibleOffers > 1 ? 's' : '');
      } else {
        $($el).addClass(singleOfferClass);
        $singleOfferText.innerText = visibleOffers[0].data.name;
      }

      if (appliedOffer && visibleOffers.indexOf(appliedOffer) < 0) {
        this.removeOffer();
      }

      return !isAttached && shouldDisplay && $container.appendChild($el);
    },

    /**
     * Applies the selected offer.
     */
    applyOffer: function() {
      if (appliedOffer === selectedOffer) {
        return;
      }

      if (!appliedOffer) {
        $offersTitle.className = $offersTitle.className + appliedClass;
      } else {
        appliedOffer.remove();
      }

      var offer = (appliedOffer = selectedOffer),
        discountAmount = offer.discount;

      if (!discountAmount) {
        $selectedOfferDiscountAmount.innerText = '';
        $selectedOfferDiscount.remove();
      } else {
        $selectedOfferDiscountAmount.innerHTML = formatAmount(discountAmount);
        $selectedOfferTitle.appendChild($selectedOfferDiscount);
      }

      offer.apply();

      return true;
    },

    /**
     * Selects and applies the offer matching the given ID
     * @param {Number} offerId
     */
    selectOfferById: function selectOfferById(offerId) {
      var matchedOffers = [];
      if (Array.isArray(visibleOffers)) {
        matchedOffers = visibleOffers.filter(function(offer) {
          return offer.data.id === offerId;
        });
      }

      this.selectOffer(matchedOffers[0], true);

      if (matchedOffers.length === 1) {
        this.applyOffer();
      } else if (matchedOffers.length > 1) {
        toggleOfferList();
      }

      if (matchedOffers.length === 1) {
        return matchedOffers[0];
      }
    },

    /**
     * Selects an Offer
     * @param {Offer} offer
     * @param {Boolean} programaticallySelected
     */
    selectOffer: function selectOffer(offer, programaticallySelected) {
      if (selectedOffer) {
        selectedOffer.deselect();
      } else {
        $offersListCont.className = $offersListCont.className + selectedClass;
      }

      if (!programaticallySelected) {
        this.offerSelectedByDrawer = offer.data;
      }

      (selectedOffer = offer).select();
    },

    /**
     * Removes the selected offer.
     */
    removeOffer: function removeOffer() {
      if (selectedOffer) {
        $offersListCont.className = $offersListCont.className.replace(
          selectedClass,
          ''
        );

        this.offerSelectedByDrawer = null;

        selectedOffer.deselect();
        selectedOffer = null;
      }

      if (appliedOffer) {
        $offersTitle.className = $offersTitle.className.replace(
          appliedClass,
          ''
        );

        appliedOffer.remove();
        appliedOffer = null;
      }
    },

    /**
     * Shows an error
     * @param {string} methodDescription
     * @param {Function} cb Callback to be executed when the error is removed
     */
    showError: function showError(methodDescription, cb) {
      $offersError = createNode(
        templates.offererror({
          offer: appliedOffer,
          methodDescription: methodDescription,
          formatAmount: formatAmount,
        })
      );

      ($offersErrorCancel = $offersError.querySelector('.text-btn.cancel')),
        ($offersErrorPay = $offersError.querySelector('.text-btn.pay'));
      $root.appendChild($offersError);
      offersErrorResolutionCb = cb;
    },
  };

  Object.defineProperties(offers, {
    /**
     * Returns the applied offer's data, not the Offer instance
     *
     * @returns {Object}
     */
    appliedOffer: {
      get: function() {
        return appliedOffer && appliedOffer.data;
      },
    },

    /**
     * Returns the selected offer's data, not the Offer instance
     *
     * @returns {Object}
     */
    selectedOffer: {
      get: function() {
        return selectedOffer && selectedOffer.data;
      },
    },

    /**
     * Returns the number of visible offers
     *
     * @returns {Number}
     */
    numVisibleOffers: {
      get: function() {
        return visibleOffers.length;
      },
    },

    /**
     * If there's only one offer, returns it.
     *
     * @returns {Offer|Object}
     */
    defaultOffer: {
      get: function() {
        return visibleOffers.length === 1 && visibleOffers[0];
      },
    },
  });

  // TODO: need to change to addEventlistner style
  // Toggle offers list upon clicking the title
  $offersTitle.onclick = $offersListTitle.onclick = toggleOfferList;

  // Apply an offer
  $applyOffer.onclick = function() {
    var isOfferApplied = offers.applyOffer();
    toggleOfferList();
    Analytics.track('offers:apply', {
      type: AnalyticsTypes.BEHAV,
      data: appliedOffer.data,
    });
    return isOfferApplied && onApplyOffer && onApplyOffer(appliedOffer);
  };

  $root.addEventListener('click', function(e) {
    if (!$offersError) {
      return;
    }

    var $target = e.target,
      isOfferRemoved = false;

    /**
     * Logic around user wanting to remove the offer
     * or retry in case there's an error.
     */
    if ($offersErrorPay.contains($target)) {
      isOfferRemoved = true;
      Analytics.track('offers:retry_screen:remove', {
        type: AnalyticsTypes.BEHAV,
        data: appliedOffer && appliedOffer.data,
      });
      offers.removeOffer();
      hideOfferError();
      if (onRemoveOffer) {
        onRemoveOffer();
      }
    } else if ($offersErrorCancel.contains($target)) {
      Analytics.track('offers:retry', {
        type: Analytics.BEHAV,
        data: appliedOffer && appliedOffer.data,
      });
      hideOfferError();
    }

    if (offersErrorResolutionCb) {
      offersErrorResolutionCb(isOfferRemoved);
      offersErrorResolutionCb = null;
    }
  });

  allOffers = visibleOffers = offersData.map(function(offer) {
    return new Offer(offer, {
      onOfferSelection: function(offer) {
        offers.selectOffer(offer);
      },
      onOfferRemoval: function() {
        Analytics.track('offers:remove', {
          type: AnalyticsTypes.BEHAV,
          data: offer,
        });
        offers.removeOffer();
        toggleOfferList();
        return onRemoveOffer && onRemoveOffer();
      },
      formatAmount: formatAmount,
    });
  });

  return offers;
}
