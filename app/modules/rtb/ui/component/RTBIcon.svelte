<script>
  import RazorpayConfig from 'common/RazorpayConfig';
  export let height = 24;
  export let width = 22;

  const cdnUrl = RazorpayConfig.cdn;
  const imgUrl = `${cdnUrl}static/assets/trustedbadge/rtb-live.svg`;
</script>

<img src={imgUrl} {height} {width} alt="rtb-logo" />
