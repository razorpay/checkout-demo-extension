{#if loadableIcon && !loaded}
  <img src="{icon}" style="display: none;" use:loader>
{/if}

{#if /^<svg/.test(iconToUse)}
  {@html iconToUse}
{:elseif /^\&.*\;$/.test(iconToUse)}
  <i class="theme">{@html iconToUse}</i>
{:elseif /^\./.test(iconToUse)}
  <div class={iconToUse.split('.').join(' ')}></div>
{:else}
  <img src="{iconToUse}" alt=''>
{/if}

<script>
  export default {
    data() {
      return {
        placeholder: '',

        /**
         * Set this as true by default, `loaded` is set `false` only
         * for external icons, the icons loaded from the network
         * while being loaded.
         */
        loaded: true
      }
    },

    oncreate() {
      const { loadableIcon } = this.get();

      if (loadableIcon) {
        this.set({loaded: false});
      }
    },

    actions: {
      /* This will only be triggered for `loadableIcon`s */
      loader(node){
        node.onload = (evt) => {
          const { icon } = this.get();

          this.set({ loaded: true });
        }
      }
    },

    computed: {
      /* The icon is loadable if it's being loadedd from an external link */
      loadableIcon: ({ icon }) => /^http/.test(icon),

      iconToUse: ({ icon, placeholder, loaded }) =>  {
        if (loaded) {
          return icon || placeholder;
        }

        if (icon) {
          return placeholder ? placeholder : icon;
        }

        if (placeholder) {
          return placeholder;
        }

        return icon;
      }
    }
  }
</script>