<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';

  const dispatch = createEventDispatcher();
</script>

<div class="attachment">
  <Stack horizontal>
    <div class="attachment-icon">
      <svg viewBox="0 0 24 18" version="1" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <path
            d="M0,2.13515898 L0,8 C1.3527075e-16,9.1045695 0.8954305,10 2,10
            C3.1045695,10 4,9.1045695 4,8 L4,1 C4,0.44771525
            3.55228475,-1.01453063e-16 3,0 C2.44771525,1.01453063e-16
            2,0.44771525 2,1 L2,7.92102942 L2,7.92102942"
            stroke="#528FF0"
            transform="translate(1 1)"
          />
          <path
            stroke="#528FF0"
            d="M2.78736216 11.3770904L2.78736216 15.9514316 18.0208471
            15.9514316 22.5670798 12.691115 22.5670798 3.52933932 5.36613221
            3.52933932"
            transform="translate(1 1)"
          />
          <path
            fill="#528FF0"
            d="M17.8568235 16.0011571L17.8568235 12.4627791 22.5651114
            12.4627791z"
            transform="translate(1 1)"
          />
          <g stroke="#528FF0">
            <path
              d="M0 .714285714L12.9837774.714285714M0 7.07142857L8.16129032
              7.07142857M0 3.71428571L10.3250978 3.71428571"
              transform="translate(8 7)"
            />
          </g>
        </g>
      </svg>
    </div>
    <div class="attachment-item">
      <slot />
    </div>
    <div class="attachment-remove">
      <button
        type="button"
        on:click={() => dispatch('remove')}
        aria-label="Remove attachment"
      >
        &times;
      </button>
    </div>
  </Stack>
</div>

<style>
  .attachment {
    border: 1px solid #528ff0;
    border-left-width: 3px;
    border-radius: 2px;
    padding: 8px;
    background-color: #f6faff;
  }

  .attachment > :global(.stack) {
    position: relative;
    padding-right: 24px;
  }

  .attachment-icon {
    margin-right: 8px;

    svg {
      height: 16px;
      width: 22px;
    }
  }

  .attachment-item {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .attachment-remove {
    position: absolute;
    right: 0;

    button {
      display: block;
      padding: 0;

      color: white;
      background-color: #a6c1ec;
      border-radius: 50%;
      border: 1px solid transparent;

      transition: 0.15s linear;

      line-height: 1em;
      text-align: center;
      font-size: 12px;

      width: 1.5em;
      height: 1.5em;

      &:active,
      &:focus,
      &:hover {
        border-color: #528ff0;
      }
    }
  }
</style>
