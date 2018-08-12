var dummyDiv = document.createElement('div');
var selectedClass = ' selected',
  appliedClass = ' applied';

var createNode = function(html) {
  dummyDiv.innerHTML = html;
  return dummyDiv.firstChild;
};

function Offer(data, options) {
  var that = this,
    $el = (this.$el = createNode(templates.offer(data))),
    $offerTitle = $el.querySelector('.offer-title'),
    $removeOffer = $el.querySelector('.remove-offer');

  this.data = data;

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
  onRemoveOffer
) {
  var $el = createNode(templates.offers()),
    $numOffers = $el.querySelector('.num-offers'),
    $offersTitle = $el.querySelector('.offers-title'),
    $selectedOfferTitle = $offersTitle.querySelector(
      '.selected-offer .offer-title'
    ),
    $offersListCont = $el.querySelector('.offers-list-container'),
    $offersListTitle = $offersListCont.querySelector('.offers-list-title'),
    $offersList = $offersListCont.querySelector('.offers-list'),
    $applyOffer = $offersListCont.querySelector('.apply-offer');

  var appliedOffer,
    selectedOffer,
    shouldShowOfferList = false;

  function showOfferList() {
    $el.appendChild($offersListCont);
  }

  function hideOfferList() {
    $offersListCont.remove();
  }

  function toggleOfferList() {
    shouldShowOfferList = !shouldShowOfferList;

    return shouldShowOfferList ? showOfferList() : hideOfferList();
  }

  var offers = {
    visibleOffers: offersData.length,
    applyFilter: function applyFilter(criteria) {
      $offersList.innerHTML = '';

      var visibleOffers = Object.keys(criteria || {}).reduce(function(
        offers,
        key
      ) {
        return offers.reduce(function(filteredOffers, offer) {
          return (
            criteria[key] === offer.data[key] &&
              ($offersList.appendChild(offer.$el), filteredOffers.push(offer)),
            filteredOffers
          );
        }, []);
      },
      this.offers.slice());

      this.visibleOffers = visibleOffers;
      this.display(visibleOffers.length !== 0);
    },
    display: function display(shouldDisplay) {
      var isAttached = !!$el.parentElement;

      if (!shouldDisplay) {
        shouldShowOfferList = false;
        hideOfferList();
        return isAttached && $container.removeChild($el);
      }

      var numVisibleOffers = this.visibleOffers.length;

      $numOffers.innerText =
        numVisibleOffers + ' Offer' + (numVisibleOffers > 1 ? 's' : '');

      if (appliedOffer && this.visibleOffers.indexOf(appliedOffer) < 0) {
        this.removeOffer();
      }

      return !isAttached && shouldDisplay && $container.appendChild($el);
    },
    applyOffer: function() {
      if (appliedOffer === selectedOffer) {
        return toggleOfferList();
      }

      if (!appliedOffer) {
        $offersTitle.className = $offersTitle.className + appliedClass;
      }

      var offer = (appliedOffer = selectedOffer);
      offer.apply();
      $selectedOfferTitle.innerText = offer.data.name;
      toggleOfferList();

      return onApplyOffer && onApplyOffer(appliedOffer.data);
    },
    selectOffer: function selectOffer(offer) {
      if (selectedOffer) {
        selectedOffer.deselect();
      } else {
        $offersListCont.className = $offersListCont.className + selectedClass;
      }

      (selectedOffer = offer).select();
    },
    removeOffer: function removeOffer() {
      if (selectedOffer) {
        $offersListCont.className = $offersListCont.className.replace(
          selectedClass,
          ''
        );

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

        return onRemoveOffer && onRemoveOffer();
      }
    },
  };

  Object.defineProperty(offers, 'appliedOffer', {
    get: function() {
      return appliedOffer;
    },
  });

  hideOfferList();

  // TODO: need to change to addEventlistner style
  $offersTitle.onclick = $offersListTitle.onclick = toggleOfferList;
  $applyOffer.onclick = offers.applyOffer.bind(offers);

  offers.offers = offersData.map(function(offer) {
    return new Offer(offer, {
      onOfferSelection: function(offer) {
        offers.selectOffer(offer);
      },
      onOfferRemoval: function() {
        offers.removeOffer();
        toggleOfferList();
      },
    });
  });

  return offers;
}
