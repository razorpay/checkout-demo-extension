<script lang="ts">
  import RazorpayConfig from 'common/RazorpayConfig';
  import { isRedesignV15 } from 'razorpay';
  export let item: {
    name: string;
    code: string;
  };
  let showLogo = true;
  let logoError = false;

  const isRedesignV15Enabled = isRedesignV15();
  function getCharacter() {
    const returnData = item.name
      .split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2);
    if (returnData.length < 2) {
      return item.name.slice(0, 2);
    }
    return returnData;
  }
  const onError = () => {
    logoError = true;
  };
</script>

<div class="container">
  {#if isRedesignV15Enabled}
    <div class="logo-wrapper">
      {#if showLogo}
        {#if logoError}
          <div class="bank-logo auto-generated">
            {getCharacter()}
          </div>
        {:else}
          <img
            class="bank-logo"
            src={`${RazorpayConfig.cdn}bank/${item.code}.gif`}
            alt={item.name}
            on:error={onError}
          />
        {/if}
      {/if}
    </div>
  {/if}
  <span>{item.name}</span>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    height: 28px;
  }
  .logo-wrapper {
    width: 28px;
    height: 28px;
    box-sizing: border-box;
    margin-right: 10px;
  }
  .bank-logo {
    width: 28px;
    height: 28px;
    box-sizing: border-box;
  }
  .auto-generated {
    border-radius: 50%;
    background: #512da8;
    color: #fff;
    height: 28px;
    width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
