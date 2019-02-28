<div class="pad">
  <div id="add-emi-container">
    <input type="hidden" name="emi_duration" bind:value="emiDuration">
    <div class="clear"></div>
    <div class="strip emi-plans-info-container emi-plans-trigger details-visible" on:click="fire('editplan')">
      <div class="emi-plan-selected emi-icon-multiple-cards ">
        <div class="emi-plans-text">{emiText}</div>
        <div class="emi-plans-action theme-highlight">Edit</div>
      </div>
    </div>
    <h3>Enter Card Details</h3>
    <div class="card-fields">
      <div class="elem-wrap">
        <div class="elem elem-card">
          <div class="cardtype"></div>
          <label>Card Number</label>
          <i>&#xe605;</i>
          <span class="help">Please enter a valid Bajaj Finserv issued card number</span>
          <input class="input" type="tel" name="card[number]" autocomplete="off" maxlength="19" value={prefill['card[number]']}>
        </div>
      </div>
      <div class="elem-wrap" class:readonly="readonly.name">
        <div class="elem elem-name">
          <span class="help">Please enter name on your card</span>
          <label>Card Holder's Name</label>
          <i>&#xe602;</i>
          <input class="input" type="text" name="card[name]" required value={prefill.name} pattern={"^[a-zA-Z. 0-9'-]{1,100}$"} readonly={readonly.name}>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="pad recurring-message">
  <span>&#x2139;</span>
  You need to have a <strong>Bajaj Finserv issued card</strong> to continue.
</div>

<script>
  export default {
    data () {
      return {
        emiText: '',
        emiDuration: ''
      }
    },

    computed: {
      prefill: ({ session }) => ({
        'card[number]': session.get('prefill.card[number]'),
        name: session.get('prefill.name'),
      }),

      readonly: ({ session }) => ({
        name: session.get('readonly.name') && session.get('prefill.name'),
      })
    },

    oncreate () {
      const {
        session
      } = this.get();
      const emi_el_card = _Doc.querySelector('#form-emi input[name="card[number]"]');

      session.delegator
        .add('card', emi_el_card)
        .on('network', function () {
          const type = this.type;

          // card icon element
          this.el.parentNode
            .querySelector('.cardtype')
            .setAttribute('cardtype', type);
        })
        .on('change', function () {
          let isValid = this.isValid();

          if (this.type !== 'bajaj') {
            isValid = false;
          }

          // set validity classes
          if (isValid) {
            _El.removeClass(this.el.parentNode, 'invalid');
          } else {
            _El.addClass(this.el.parentNode, 'invalid');
          }
        });

      this.bindListeners();
    },

    methods: {
      bindListeners: function () {
        this.on('setplan', plan => {
          const {
            text,
            duration
          } = plan;

          this.set({
            emiText: text,
            emiDuration: duration
          });
        });
      }
    }
  }
</script>
