<div class={'tnc-curtain ' + (visible ? 'shown' : '')}>
  <div class="tnc-container-bg" on:click="close(event)">
  </div>
  <div class="tnc-container">
    <div class="tnc-header">
      <span>{@html heading}</span>
      {#if image}
        <span class="tnc-provider-image">
          <img src={image} alt={imageAlt}>
        </span>
      {/if}
      <span class="tnc-close" on:click="close(event)">&times;</span>
    </div>
    <div class="separator"></div>
    <div class="tnc-contents">{termsText}</div>
  </div>
</div>
<script>
  export default {
    data: function () {
      return {
        visible: false,
        heading: 'Terms and Conditions'
      }
    },

    computed: {
      termsText: ({ terms }) => {
        const div = document.createElement('div');

        div.innerHTML = terms;

        return div.innerText.replace(/\n{3,}/g, '\n\n');
      }
    },

    methods: {
      close: function (e) {
        this.set({
          visible: false
        });
      }
    }
  }
</script>
