<div class="magic-inner">
  <div id="form-magic-choice" class="tab-content showable screen pad">
    <h3>
      Pay using
    </h3>
    <div class="options">
      <RadioOption icon={"&#xe70f;"}
        data={{value: 'otp'}}
        selected={selectedChoice === 'otp'}
        on:select="selectChoice(event)"
      >
        <div class="title">One Time Password</div>
        <div class="subtitle">OTP message sent by your bank</div>
      </RadioOption>
      <RadioOption icon={"&#xe710;"}
        data={{value: 'password'}}
        selected={selectedChoice === 'password'}
        on:select="selectChoice(event)"
      >
        <div class="title">Password</div>
        <div class="subtitle">Password for your ACS page</div>
      </RadioOption>
    </div>
  </div>
</div>

<script>
  export default {
    components: {
      RadioOption: 'templates/views/ui/options/RadioOption.svelte',
      OtpScreen: 'templates/screens/otp.svelte'
    },
    data: () => {
      return {
        selectedChoice: null,
      };
    },
    methods: {
      selectChoice: function(e) {
        this.set({ selectedChoice: e.data.value });

        _El.addClass(_Doc.querySelector('#body'), 'sub');
      },
    },
  };
</script>