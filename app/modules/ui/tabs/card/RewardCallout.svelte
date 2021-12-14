<script>
  export let reward;
</script>

<div class="reward-container">
  <img src={reward.logo} alt={reward.brand_name} class="logo" />

  <div class="name">{reward.name}</div>
</div>

<style>
  .reward-container {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    background: #f4f8fb;
    border: 1px dashed #dbe6ef;
    box-sizing: border-box;
    max-height: 62px;
    min-height: 62px;
    overflow: hidden;
  }

  .logo {
    width: 36px;
    height: auto;
    min-width: 36px;
    border-radius: 4px;
    border: 1px solid #dbe5ef;
    margin-right: 8px;
  }

  .name {
    font-size: 12px;
    letter-spacing: 1px;
    color: #000000;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
