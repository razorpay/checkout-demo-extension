<script>
  import Icon from './Icon.svelte';

  export let show = false;
  export let title = '';
  /**
   * data = [{icon: icons.<>, label: '' }]
   */
  export let data = [];

  function replaceNode(node) {
    document.querySelector('#modal').appendChild(node);
    return {
      destroy() {
        node?.parentNode?.removeChild(node);
      },
    };
  }

  function handleClick(event) {
    if (event?.target?.className?.indexOf('info-screen') > -1) {
      show = false;
    }
  }
</script>

{#if show}
  <div class="info-screen" on:click={handleClick} use:replaceNode>
    <div class="info">
      <div class="title">{title}</div>
      <div class="data">
        {#each data as singleData (singleData.label)}
          <div class="single-data">
            <span class="icon">
              {#if singleData.icon}
                <Icon icon={singleData.icon} />
              {/if}
            </span>
            <span>
              {singleData.label}
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .info-screen {
    position: absolute;
    bottom: -55px;
    height: calc(100% + 55px);
    background: rgba(0, 0, 0, 0.5);
    -webkit-transition: 0.2s;
    -o-transition: 0.2s;
    transition: 0.2s;
    z-index: 100;
    width: 100%;
    border-radius: 0 0 3px 3px;
  }

  :global(.mobile) .info-screen {
    bottom: 0;
  }

  .info {
    min-height: 150px;
    width: 100%;
    background: #fff;
    position: absolute;
    bottom: 0;
    padding: 26px;
    box-sizing: border-box;
    text-align: left;
  }

  .title {
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    color: #3f71d7;
  }

  .data {
    margin: 4px 0 4px 10px;
  }

  .single-data {
    font-size: 12px;
    line-height: 16px;
    color: rgba(81, 89, 120, 0.7);
    margin: 12px 0;
    display: flex;
  }

  .single-data:last-child {
    margin-bottom: 0;
  }

  .single-data span.icon {
    margin-right: 10px;
    min-width: 12px;
    align-self: center;
  }
</style>
