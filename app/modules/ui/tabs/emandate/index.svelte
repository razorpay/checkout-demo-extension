<script>
  import { getSession } from 'sessionmanager';

  const session = getSession();

  // Prefill
  const bank = session.get('prefill.bank');
  const bank_account = session.get('prefill.bank_account[account_number]');
  const bank_name = session.get('prefill.bank_account[name]');
  const bank_ifsc = session.get('prefill.bank_account[ifsc]');

  const ifsc_pattern = '^[a-zA-Z]{4}[a-zA-Z0-9]{7}$';
  const name_pattern = "^[a-zA-Z. 0-9\\']{(1, 100)}$";

  const icons = session.themeMeta.icons;
</script>

<div id="emandate-inner">

  <div id="form-emandate-auth-selection" class="tab-content showable screen">
    <div id="emandate-bank">
      <div class="bank-icon" />
      <div class="bank-name">HDFC Bank</div>
      {#if !bank}
        <div class="btn-change-bank">Change Bank</div>
      {/if}
    </div>

    <div class="legend">Authenticate using</div>
    <div id="emandate-options" class="grid clear count-2">
      <div class="auth-option item debitcard">
        <label>
          <i class="theme">
            {@html icons.card}
          </i>
          Debit Card
          <span class="desc">via Bank Account and Debit Card details</span>
        </label>
      </div>
      <div class="auth-option item netbanking">
        <label>
          <i class="theme">
            {@html icons.netbanking}
          </i>
          Netbanking
          <span class="desc">via Bank Account and Netbanking details</span>
        </label>
      </div>

    </div>
  </div>

  <div id="form-emandate-details" class="tab-content showable screen pad">
    <div class="elem-wrap" id="elem-wrap-nb-acc-no">
      <div class="elem elem-nb-acc-no" class:readonly={bank_account}>
        <div class="bank-icon" />
        <div class="help">Please enter a valid Account Number</div>
        <label>Bank account Number</label>
        <input
          class="input"
          name="bank_account[account_number]"
          type="text"
          id="nb-acc-no"
          value={bank_account}
          readonly={Boolean(bank_account)}
          required
          pattern="^[a-zA-Z0-9]{(4, 20)}$"
          maxlength="20"
          spellcheck="false"
          autocorrect="off"
          autocapitalize="off" />
      </div>
    </div>
    <div class="elem-wrap" id="elem-wrap-nb-acc-ifsc">
      <div class="elem elem-nb-acc-ifsc" class:readonly={bank_ifsc}>
        <div class="help">Please enter a valid IFSC</div>
        <label>IFSC</label>
        <input
          class="input"
          name="bank_account[ifsc]"
          type="text"
          id="nb-acc-ifsc"
          value={bank_ifsc}
          readonly={bank_ifsc}
          required
          pattern={ifsc_pattern}
          maxlength="11"
          spellcheck="false"
          autocorrect="off"
          autocapitalize="off" />
      </div>
    </div>
    <div class="elem-wrap" id="elem-wrap-nb-acc-name">
      <div class="elem elem-nb-acc-name" class:readonly={bank_name}>
        <div class="help">Please enter a valid Name as per your account</div>
        <label>Account Holder Name</label>
        <input
          class="input"
          name="bank_account[name]"
          type="text"
          id="nb-acc-name"
          value={bank_name}
          readonly={Boolean(bank_name)}
          required
          pattern={name_pattern}
          maxlength="100"
          spellcheck="false"
          autocorrect="off"
          autocapitalize="off" />
      </div>
    </div>
  </div>
</div>
