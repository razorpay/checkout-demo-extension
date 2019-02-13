{#if visible}
  <div transition:otherMethods class="othermethods">
    <div class="legend">Select a payment method</div>
    <div class="options pad">
      {#if instruments && instruments.length && false}
        <!-- Hide this for now -->
        <NextOption on:select='fire("hideMethods")'
          type='down-arrow'
          arrowText='Show'
          icon={"&#xe714;"}
        >
          <span style="color:#858585">
            My Preferred Methods ({instruments.length})
          </span>
        </NextOption>
      {/if}
      <NextOption on:select='fire("hideMethods")'
        type='dark down-arrow'
        arrowText='Hide'
        icon={session.themeMeta.icons['othermethods']}
      >
        Other Methods
      </NextOption>
      {#each AVAILABLE_METHODS as method}
        <NextOption
          data={{method}} on:select='fire("methodSelected", event)'
          icon={session.themeMeta.icons[method]}
        >
          {session.tab_titles[method]}
        </NextOption>
      {/each}
    </div>
  </div>
{/if}

<style>
  .othermethods {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    background: #ffffff;
    overflow: hidden;
    overflow-y: auto;
    padding: 0 0 12px 0;
  }
</style>

<script>
  export default {
    components: {
      NextOption: 'templates/views/ui/options/NextOption.svelte',
    },

    transitions: {
      otherMethods: (node, { delay = 0, duration = 200 }) => {
        const o = +global.getComputedStyle(node).opacity;
        const circIn = t => {
          return 1.0 - Math.sqrt(1.0 - t * t);
        };

        const opacity = t => {
          let x = t * 3 * o;

          if (x > 1) {
            x = 1;
          }

          return x;
        };

        return {
          delay,
          duration,
          css: t => {
            t = circIn(t);
            return `opacity: ${opacity(t)}; top: ${240 *
              (1 - t)}px; overflow: hidden; position: absolute`;
          },
        };
      }
    },

    data: () => {
      return {
        visible: false,
        AVAILABLE_METHODS: [],
        instruments: []
      }
    }
  }
</script>