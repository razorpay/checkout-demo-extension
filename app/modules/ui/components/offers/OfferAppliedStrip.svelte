<script lang="ts">
  import { t } from 'svelte-i18n';
  import {
    OFFER_APPLIED_ALREADY,
    OFFER_NOT_APPLICABLE,
  } from 'ui/labels/offers';
</script>

<div class="offers-container">
  <header>
    <div>
      <p class="header-text">
        {$t(OFFER_NOT_APPLICABLE)}
      </p>
      <p class="sub-text">{$t(OFFER_APPLIED_ALREADY)}</p>
    </div>
  </header>
</div>

<style>
  header::before {
    content: '\e717';
    font-size: 15px;
    margin: -1px 8px 0 0;
  }
  header {
    padding: 10px 16px;
    display: flex;
  }
  header p {
    margin: 0;
  }
  .header-text {
    font-size: 14px;
    color: #000;
    font-weight: 700;
  }
  .sub-text {
    font-size: 10px;
    font-weight: 400;
    color: #8d97a1;
  }
</style>
