<div>
  <slot></slot>
</div>

<style>
  div {
    border: 1px solid #F6E1B3;
    border-left-width: 4px;
    border-radius: 2px;
    padding: 12px 18px;
    color: #8E8B80;
    background-color: #FFFCF2;
    line-height: 20px;
    font-size: 14px;
    margin: 12px 0;

    :global(ol) {
      padding-left: 12px;
      margin: 0;
    }
  }
</style>
