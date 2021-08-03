<div>
  <slot />
</div>

<style>
  div {
    border: 1px solid #f6e1b3;
    border-left-width: 4px;
    border-radius: 2px;
    padding: 12px 18px;
    color: #8e8b80;
    background-color: #fffcf2;
    line-height: 20px;
    font-size: 14px;
    margin: 12px 0;

    :global(ol) {
      padding-left: 12px;
      margin: 0;
    }
  }
</style>
