<Tab method="nach" overrideMethodCheck="true" pad={false}>
  <Screen>
    <input type="file" ref:file class="hidden" on:change="selectFile(event)" accept="{ALLOWED_EXTS.join(',')}" />

    <p>Please upload a clear and legible copy of your signed NACH form</p>

    {#if view === 'upload'}
      <div ref:illustration>
        <DocumentIllustration />
      </div>
    {:elseif file && file.name}
      <Attachment on:remove="reset(event)">{file.name}</Attachment>
    {/if}

    {#if view === 'upload'}
      <Note>
        <ol>
          <li>The image should not be <strong>cropped</strong> and should not have any <strong>shadows</strong></li>
          <li>Only {ALLOWED_EXTS.map(x => x.toUpperCase()).join(', ')} files with size less than {ALLOWED_MAX_SIZE_IN_MB} MB are allowed</li>
        </ol>
      </Note>
    {/if}
  </Screen>
</Tab>

<style>
  ref:illustration {
    text-align: center;
  }
</style>


<script>
  import {
    ALLOWED_EXTS,
    ALLOWED_MAX_SIZE_IN_MB,

    generateError,
    getValidityError,
    uploadDocument,
  } from 'checkoutframe/nach';

  export default {
    components: {
      Attachment: 'templates/views/ui/Attachment.svelte',
      DocumentIllustration: 'templates/illustrations/nach/Document.svelte/',
      Note: 'templates/views/ui/Note.svelte',
      Tab: 'templates/tabs/Tab.svelte',
      Screen: 'templates/layouts/Screen.svelte',
    },

    computed: {
      view: ({ file }) => file ? 'confirm' : 'upload'
    },

    data: () => ({
      ALLOWED_EXTS,
      ALLOWED_MAX_SIZE_IN_MB,

      abortUpload: () => {}, // Fn to abort the upload request
      file: null, // File that is uploaded
      uploaded: false, // Have we uploaded the file?
      uploading: false, // Are we currently uploading?
    }),

    onstate: function ({ changed, current }) {
      // When file is attached/removed, the CTA needs to be updated to reflect it.
      if (changed.file) {
        const CTA = _Doc.querySelector('#footer .attach-nach-form');
        const text = current.file ? 'Submit' : 'Upload NACH form';

        _El.setContents(CTA, text);
      }
    },

    methods: {
      /**
       * Aborts the upload request
       */
      abortUpload: function () {
        const {
          abortUpload
        } = this.get();

        abortUpload();
        this.reset();
      },

      /**
       * Clears the error
       */
      clearError: function () {
        this.set({
          error: null
        });
      },

      /**
       * Session calls this method when it switches to "nach" tab
       */
      onShown: function () {
        const footerButtons = {
          attachNachForm: _Doc.querySelector('#footer .attach-nach-form'),
          pay: _Doc.querySelector('#footer .pay-btn'),
        };

        _El.addClass(footerButtons.pay, 'invisible');
        _El.removeClass(footerButtons.attachNachForm, 'invisible');
      },

      /**
       * Session calls this to ask if tab will handle back
       *
       * @returns {boolean} will tab handle back
       */
      onBack: function () {
        const footerButtons = {
          attachNachForm: _Doc.querySelector('#footer .attach-nach-form'),
          pay: _Doc.querySelector('#footer .pay-btn'),
        };

        _El.addClass(footerButtons.attachNachForm, 'invisible');
        _El.removeClass(footerButtons.pay, 'invisible');

        return false;
      },

      /**
       * Session calls this to detemine if overlay should be hidden
       *
       * @returns {Boolean} should the overlay be hidden?
       */
      shouldHideOverlay: function () {
        const {
          error,
          file,
          uploading
        } = this.get();

        // If we are still upload, ask for confirmation
        if (uploading) {
          const cancel = global.confirm('Are you sure you want to stop uploading your NACH form?');

          if (cancel) {
            this.abortUpload();

            this.reset();
          }

          return cancel;
        }

        // If there was an error, reset the UI
        if (error) {
          this.reset();
        }

        return true;
      },

      /**
       * Removes the file
       */
      removeFile: function () {
        this.refs.file.value = '';
        this.refs.file.dispatchEvent(new global.Event('change'));
      },

      /**
       * Performs cleanup and resets the UI
       */
      reset: function () {
        this.removeFile();
        this.clearError();
        this.set({
          uploaded: false,
          uploading: false,
        });
      },

      /**
       * Session calls this to determine if it should submit
       *
       * @returns {Boolean} Should session submit?
       */
      shouldSubmit: function () {
        const {
          uploaded,
          file,
        } = this.get();

        setTimeout(() => {
          // If we have already uploaded the file, we should just submit and do nothing
          if (!uploaded) {
            if (file) {
              // If file is selected, start uploading
              this.upload();
            } else {
              // Select file
              this.refs.file.click();
              return false;
            }
          }
        });

        // If file is uploaded, we let Session do its thing
        return uploaded;
      },

      /**
       * Sets the error in state
       * and shows it in the overlay
       */
      showError: function (error) {
        const {
          session
        } = this.get();

        this.set({
          error,
          uploading: false,
        });

        session.hideOverlayMessage();

        // Wait for overlay to be hidden before showing it again
        setTimeout(() => {
          session.showLoadError(error.description, true);
        }, 300);
      },

      /**
       * Invoked when a file is selected
       * @param {Event} event
       */
      selectFile: function (event) {
        const { value } = event.currentTarget;

        if (!value) {
          this.set({
            file: null
          });

          return;
        }

        const {
          session
        } = this.get();

        session.showLoadError('Attaching your NACH form');

        // Validate
        const file = event.currentTarget.files[0];
        const error = getValidityError(file);

        this.set({
          uploading: true,
        });

        setTimeout(() => {
          const {
            uploading
          } = this.get();

          // Abort if user has requested to stop processing
          if (!uploading) {
            return;
          }

          if (error) {
            this.showError(error);
          } else {
            this.set({
              file,
              uploading: false,
            });

            session.hideOverlayMessage();
          }
        }, 1000);
      },

      /**
       * Uploads the file.
       */
      upload: function () {
        const {
          file,
          session,
        } = this.get();

        this.set({
          uploading: true,
        });

        session.showLoadError('Uploading your NACH form');

        const { promise: uploadRequest, abort: abortUpload } = uploadDocument(session.r, file);

        this.set({
          abortUpload,
        });

        uploadRequest
          .then(response => {
            this.set({
              uploaded: true,
              uploading: false,
            });

            session.hideOverlayMessage();

            // Let Session do its thing
            session.preSubmit();
          })
          .catch(response => {
            const generatedError = generateError(response);

            this.showError(generatedError);
          });
      }
    }
  }
</script>
