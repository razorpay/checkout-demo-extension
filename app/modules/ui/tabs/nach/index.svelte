<script>
  // Refs
  let fileInput;

  // Utils imports
  import { getSession } from 'sessionmanager';
  import {
    ALLOWED_EXTS,
    ALLOWED_MAX_SIZE_IN_MB,
    generateError,
    getValidityError,
    uploadDocument,
  } from 'checkoutframe/nach';
  import { updateCta, showAmountInCta } from 'checkoutstore/cta';

  // UI imports
  import Attachment from 'ui/elements/Attachment.svelte';
  import DocumentIllustration from 'ui/illustrations/nach/Document.svelte/';
  import Note from 'ui/elements/Note.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Screen from 'ui/layouts/Screen.svelte';

  let abortUploadRequest = () => {};
  let uploaded = false;
  let uploading = false;
  let error;

  const session = getSession();

  // Computed
  let view;

  let file;

  $: view = file ? 'confirm' : 'upload';
  $: {
    if (file) {
      const text = file ? 'Submit' : 'Upload NACH form';

      updateCta(text);
    }
  }

  /**
   * Aborts the upload request
   */
  function abortUpload() {
    abortUploadRequest();
    reset();
  }

  /**
   * Clears the error
   */
  function clearError() {
    error = null;
  }

  /**
   * Session calls this method when it switches to "nach" tab
   */
  export function onShown() {
    updateCta('Upload NACH Form');
  }

  /**
   * Session calls this to ask if tab will handle back
   *
   * @returns {boolean} will tab handle back
   */
  export function onBack() {
    showAmountInCta();

    return false;
  }

  /**
   * Session calls this to detemine if overlay should be hidden
   *
   * @returns {Boolean} should the overlay be hidden?
   */
  export function shouldHideOverlay() {
    // If we are still upload, ask for confirmation
    if (uploading) {
      const cancel = global.confirm(
        'Are you sure you want to stop uploading your NACH form?'
      );

      if (cancel) {
        abortUpload();

        reset();
      }

      return cancel;
    }

    // If there was an error, reset the UI
    if (error) {
      reset();
    }

    return true;
  }

  /**
   * Removes the file
   */
  function removeFile() {
    fileInput.value = '';

    let event;
    if (typeof global.Event === 'function') {
      event = new global.Event('change');
    } else {
      event = document.createEvent('Event');
      event.initEvent('change', true, true);
    }

    fileInput.dispatchEvent(event);
  }

  /**
   * Performs cleanup and resets the UI
   */
  function reset() {
    removeFile();
    clearError();

    uploaded = false;
    uploading = false;
  }

  /**
   * Session calls this to determine if it should submit
   *
   * @returns {Boolean} Should session submit?
   */
  export function shouldSubmit() {
    setTimeout(() => {
      // If we have already uploaded the file, we should just submit and do nothing
      if (!uploaded) {
        if (file) {
          // If file is selected, start uploading
          upload();
        } else {
          // Select file
          fileInput.click();
          return false;
        }
      }
    });

    // If file is uploaded, we let Session do its thing
    return uploaded;
  }

  /**
   * Sets the error in state
   * and shows it in the overlay
   */
  function showError(error) {
    error = error;
    uploading = false;

    session.hideOverlayMessage();

    // Wait for overlay to be hidden before showing it again
    setTimeout(() => {
      session.showLoadError(error.description, true);
    }, 300);
  }

  /**
   * Invoked when a file is selected
   * @param {Event} event
   */
  function selectFile(event) {
    const { value } = event.currentTarget;

    if (!value) {
      file = null;

      return;
    }

    session.showLoadError('Attaching your NACH form');

    // Validate
    const inputFile = event.currentTarget.files[0];
    const error = getValidityError(inputFile);

    uploading = true;

    setTimeout(() => {
      // Abort if user has requested to stop processing
      if (!uploading) {
        return;
      }

      if (error) {
        showError(error);
      } else {
        file = inputFile;
        uploading = false;

        session.hideOverlayMessage();
      }
    }, 1000);
  }

  /**
   * Uploads the file.
   */
  function upload() {
    uploading = true;

    session.showLoadError('Uploading your NACH form');

    const { promise: uploadRequest, abort } = uploadDocument(session.r, file);

    abortUploadRequest = abort;

    uploadRequest
      .then(response => {
        uploaded = true;
        uploading = false;

        session.hideOverlayMessage();

        // Let Session do its thing
        session.preSubmit();
      })
      .catch(response => {
        const generatedError = generateError(response);

        showError(generatedError);
      });
  }
</script>

<style>
  .ref-illustration {
    text-align: center;
  }
</style>

<Tab method="nach" overrideMethodCheck="true" pad={false}>
  <Screen>
    <div slot="main">
      <input
        type="file"
        bind:this={fileInput}
        class="hidden"
        on:change={selectFile}
        accept={ALLOWED_EXTS.join(',')} />

      <p>Please upload a clear and legible copy of your signed NACH form</p>

      {#if view === 'upload'}
        <div class="ref-illustration">
          <DocumentIllustration />
        </div>
      {:else if file && file.name}
        <Attachment on:remove={reset}>{file.name}</Attachment>
      {/if}

      {#if view === 'upload'}
        <Note>
          <ol>
            <li>
              The image should not be
              <strong>cropped</strong>
              and should not have any
              <strong>shadows</strong>
            </li>
            <li>
              Only {ALLOWED_EXTS.map(x => x.toUpperCase()).join(', ')} files
              with size less than {ALLOWED_MAX_SIZE_IN_MB} MB are allowed
            </li>
          </ol>
        </Note>
      {/if}
    </div>
  </Screen>
</Tab>
