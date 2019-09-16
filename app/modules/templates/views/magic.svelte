<script>
  // UI imports
  import RadioOption from 'templates/views/ui/options/RadioOption.svelte';
  import OtpScreen from 'templates/screens/otp.svelte';

  // Props
  export let selectedChoice = null;

  export function selectChoice(e) {
    selectedChoice = e.data.value;

    _El.addClass(_Doc.querySelector('#body'), 'sub');
  }
</script>

<div class="magic-inner">
  <div id="form-magic-choice" class="tab-content showable screen pad">
    <h3>Pay using</h3>
    <div class="options">
      <RadioOption
        icon={'&#xe70f;'}
        data={{ value: 'otp' }}
        selected={selectedChoice === 'otp'}
        on:select={selectChoice}>
        <div class="title">One Time Password</div>
        <div class="subtitle">OTP message sent by your bank</div>
      </RadioOption>
      <RadioOption
        icon={'&#xe710;'}
        data={{ value: 'password' }}
        selected={selectedChoice === 'password'}
        on:select={selectChoice}>
        <div class="title">Password</div>
        <div class="subtitle">Password for your ACS page</div>
      </RadioOption>
    </div>
  </div>
</div>
