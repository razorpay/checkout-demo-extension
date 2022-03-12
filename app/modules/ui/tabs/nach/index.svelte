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
  import { setTabTitle } from 'one_click_checkout/topbar/helper';

  import {
    showUploadNachForm,
    showAmountInCta,
    showSubmit,
  } from 'checkoutstore/cta';

  // UI imports
  import Attachment from 'ui/elements/Attachment.svelte';
  import DocumentIllustration from 'ui/tabs/nach/document-illustration.svelte';
  import Note from 'ui/elements/Note.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, translateErrorDescription } from 'i18n';

  import {
    ALLOWED_FORMATS_INFO,
    ATTACHING_MESSAGE,
    ATTACHMENT_INFO,
    CONFIRM_CANCEL,
    IMAGE_INFO,
    UPLOADING_MESSAGE,
  } from 'ui/labels/nach';

  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  // Constant imports
  import { TAB_TITLE } from 'one_click_checkout/topbar/constants';

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
      showSubmit();
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
    setTabTitle(TAB_TITLE.NACH);
    showUploadNachForm();
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
      // LABEL: Are you sure you want to stop uploading your NACH form?
      const cancel = global.confirm($t(CONFIRM_CANCEL));

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
      session.showLoadError(
        translateErrorDescription(error.description, $locale),
        true
      );
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

    // LABEL: Attaching your NACH form
    session.showLoadError($t(ATTACHING_MESSAGE));

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

    // LABEL: 'Uploading your NACH form'
    session.showLoadError($t(UPLOADING_MESSAGE));

    const { promise: uploadRequest, abort } = uploadDocument(session.r, file);

    abortUploadRequest = abort;

    uploadRequest
      .then((response) => {
        uploaded = true;
        uploading = false;

        session.hideOverlayMessage();

        // Let Session do its thing
        session.preSubmit();
      })
      .catch((response) => {
        const generatedError = generateError(response);

        showError(generatedError);
      });
  }
</script>

<Tab method="nach" overrideMethodCheck="true" pad={true}>
  <Screen>
    <div>
      <input
        type="file"
        bind:this={fileInput}
        class="hidden"
        on:change={selectFile}
        accept={ALLOWED_EXTS.join(',')}
      />
      <!-- LABEL: Please upload a clear and legible copy of your signed NACH form -->
      <p>{$t(ATTACHMENT_INFO)}</p>

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
              <!-- LABEL: The image should not be <strong>cropped<strong> and should not have any <strong>shadows<strong> -->
              <FormattedText text={$t(IMAGE_INFO)} />
            </li>
            <!-- LABEL: Only {extensions} files with size less than {size} MB are allowed -->
            <li>
              {formatTemplateWithLocale(
                ALLOWED_FORMATS_INFO,
                {
                  extensions: ALLOWED_EXTS.map((x) => x.toUpperCase()).join(
                    ', '
                  ),
                  size: ALLOWED_MAX_SIZE_IN_MB,
                },
                $locale
              )}
            </li>
          </ol>
        </Note>
      {/if}
    </div>
  </Screen>
</Tab>

<style>
  .ref-illustration {
    text-align: center;
  }
</style>
