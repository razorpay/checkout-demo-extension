var dummyDiv = document.createElement('div');
var selectedClass = ' selected',
  appliedClass = ' applied',
  discountClass = ' has-discount',
  singleOfferClass = 'single-offer';

var createNode = function(html) {
  dummyDiv.innerHTML = html;
  return dummyDiv.firstChild;
};

function Offer(data, options) {
  var that = this;

  this.data = data;
  this.discount = data.original_amount - data.amount;

  var $el = (this.$el = createNode(
      templates.offer({
        name: data.name,
        description: data.display_text,
        discount: this.discount > 0 && options.formatAmount(this.discount),
      })
    )),
    $offerTitle = $el.querySelector('.offer-title'),
    $removeOffer = $el.querySelector('.remove-offer');

  $offerTitle.onclick = function() {
    options.onOfferSelection(that);
  };

  $removeOffer.onclick = function() {
    options.onOfferRemoval();
  };
}

var offerProto = Offer.prototype;

offerProto.select = function() {
  if (this.isSelected) {
    return;
  }

  this.isSelected = true;
  this.$el.className = this.$el.className + selectedClass;
};

offerProto.deselect = function() {
  if (!this.isSelected) {
    return;
  }

  this.isSelected = false;
  this.$el.className = this.$el.className.replace(selectedClass, '');
};

offerProto.apply = function() {
  if (this.isApplied) {
    return;
  }

  this.isApplied = true;
  this.$el.className = this.$el.className + appliedClass;
};

offerProto.remove = function() {
  if (!this.isApplied) {
    return;
  }

  this.deselect();
  this.isApplied = false;
  this.$el.className = this.$el.className.replace(appliedClass, '');
};

function initOffers(
  $container,
  offersData,
  filter,
  onApplyOffer,
  onRemoveOffer,
  formatAmount,
  $root
) {
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
    ),
    $offersListCont = createNode(templates.offerslist()),
    $offersListTitle = $offersListCont.querySelector('.offers-list-title'),
    $offersList = $offersListCont.querySelector('.offers-list'),
    $applyOffer = $offersListCont.querySelector('.apply-offer'),
    $offersError = null,
    $offersErrorCancel = null,
    $offersErrorPay = null,
    offersErrorResolutionCb = null;

  var appliedOffer,
    selectedOffer,
    allOffers,
    visibleOffers,
    shouldShowOfferList = false;

  function showOfferList() {
    if (visibleOffers.length === 1) {
      // select first offer automatically if there is only one offer
      offers.selectOffer(visibleOffers[0]);
    }

    $root.appendChild($offersListCont);
  }

  function hideOfferList() {
    $offersListCont.remove();
  }

  function toggleOfferList() {
    return (shouldShowOfferList = !shouldShowOfferList)
      ? showOfferList()
      : hideOfferList();
  }

  function hideOfferError() {
    if (!$offersError) {
      return;
    }

    $offersError.remove();
    $offersError = $offersErrorPay = $offersErrorCancel = null;
  }

  function appendOffer(offer) {
    $offersList.appendChild(offer.$el);
    return offer;
  }

  var offers = {
    applyFilter: function applyFilter(criteria) {
      var criteriaKeys = Object.keys(criteria || {});

      $offersList.innerHTML = '';

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
    display: function display(shouldDisplay) {
      var isAttached = !!$el.parentElement;

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
    appliedOffer: {
      get: function() {
        return appliedOffer && appliedOffer.data;
      },
    },
    selectedOffer: {
      get: function() {
        return selectedOffer && selectedOffer.data;
      },
    },
    numVisibleOffers: {
      get: function() {
        return visibleOffers.length;
      },
    },
    defaultOffer: {
      get: function() {
        return visibleOffers.length === 1 && visibleOffers[0];
      },
    },
  });

  // TODO: need to change to addEventlistner style
  $offersTitle.onclick = $offersListTitle.onclick = toggleOfferList;
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

    if ($offersErrorPay.contains($target)) {
      isOfferRemoved = true;
      Analytics.track('offers:retry_screen:remove', {
        type: AnalyticsTypes.BEHAV,
        data: appliedOffer.data,
      });
      offers.removeOffer();
      hideOfferError();
      if (onRemoveOffer) {
        onRemoveOffer();
      }
    } else if ($offersErrorCancel.contains($target)) {
      Analytics.track('offers:retry', {
        type: Analytics.BEHAV,
        data: appliedOffer.data,
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
