<script>
  // UI imports
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { getSession } from 'sessionmanager';
  import Icon from 'ui/elements/Icon.svelte';
  import { selectedInstrument } from 'checkoutstore/screens/home';

  let instrument;
  let point2;
  const session = getSession();
  const icons = session.themeMeta.icons;

  $: {
    const instrumentText = $selectedInstrument?.method === 'card' ? `${instrument} cards are` : `${instrument} is`;
    point2 = `${instrumentText} facing some technical issues at the moment`;
  }

  const handleContinue = () => {
    session.hideOverlayMessage();
    session.submit.call(session);
  };
  const handleBack = () => {
    session.hideOverlayMessage();
  };
  export const handleChange = function(param) {
    instrument = param;
  };
</script>

<style>
  .line1 {
    color: #3f71d7;
  }
  .line2 {
    color: rgba(81, 89, 120, 0.7);
    margin-top: 16px;
  }
  .line3 {
    color: rgba(81, 89, 120, 0.7);
    margin-top: 16px;
  }
  .list {
    list-style: none;
    padding: 0 10px;
  }
  .list li {
    display: flex;
  }
  .list li div {
    margin-left: 4px;
    text-align: left;
    white-space: normal;
  }
  .buttons {
    display: flex;
    justify-content: space-around;
    font-size: 16px;
  }
  .container {
    padding: 0 16px;
  }
  .back-button {
    padding: 12px 32px;
    border: 1px solid #5aa4f5;
    color: #5aa4f5;
  }
  .continue-button {
    padding: 12px 60px;
    background: linear-gradient(
        97.84deg,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(0, 0, 0, 0.2) 100%
      ),
      #3a97fc;
    color: #ffffff;
  }
  .icon-wrapper {
    min-width: 25px;
    text-align: right;
    margin-top: 2px;
  }
  #downtime-wrap {
  border-radius: 0 0 3px 3px;
  background: #fff;
  bottom: -55px;
  position: absolute;
  width: 100%;
  display: none;
  -webkit-box-shadow: 0 -2px 8px rgba(0 0 0 0.16);
  box-shadow: 0 -2px 8px rgba(0 0 0 0.16);
  height: 250px;
  -webkit-transition: 0.2s;
  -o-transition: 0.2s;
  transition: 0.2s;
  padding-top: 20px;
  z-index: 100;
}
</style>

<div id="downtime-wrap">
  <div class="container">
    <ul class="list">
      <li class="line1">
        <div class="icon-wrapper"><DowntimeIcon severe="high" /></div>
        <div>There is a high chance this payment might fail</div>
      </li>
      <li class="line2">
        <div class="icon-wrapper"><Icon icon={icons.warning} /></div>
        <div>{point2}</div>
      </li>
      <li class="line3">
        <div class="icon-wrapper"><Icon icon={icons.refund} /></div>
        <div>Incase of failure, any <b>amount deducted</b> will be <b>refunded shortly</b></div>
      </li>
    </ul>
    <div class="buttons">
      <button class="back-button" on:click={handleBack}>Back</button>
      <button
        class="continue-button"
        on:click={handleContinue}>Continue</button>
    </div>
  </div>
</div>