<script>
  import Option from '../Slotted/Option.svelte';
  export let withRow = false;
</script>

<Option {withRow}>
  <div slot="icon">icon slot data</div>
  <div slot="title">title slot data</div>
  <div slot="subtitle">subtitle slot data</div>
  <div slot="error">error slot data</div>
  <div slot="extra">extra slot data</div>
  <div slot="row">row slot data</div>
  <div slot="banner">banner slot data</div>
</Option>
