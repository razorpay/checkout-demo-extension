<Tab method="nach" overrideMethodCheck="true">
  <Screen>
    <input type="file" ref:file class="hidden" on:input="selectFile(event)" accept="{ALLOWED_EXTS.concat(['.svg']).join(',')}" />

    <p>Please upload a clear and legible copy of your signed NACH form</p>

    {#if view === 'upload'}
      <div ref:illustration>
        <svg viewBox="0 0 256 116" version="1" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect fill="#F4F7FA" width="256" height="115" rx="1"/><rect fill="#FFF" x="27" y="7" width="201" height="101" rx="1"/><g transform="translate(46 17)" fill="#F0F4F9"><rect x="116" y="44" width="49" height="7" rx="1"/><rect x="116" y="59" width="49" height="7" rx="1"/><rect y="44" width="108" height="7" rx="1"/><rect y="59" width="108" height="7" rx="1"/><rect x="34" width="86" height="7" rx="1"/><rect width="27" height="7" rx="1"/><rect x="128" width="37" height="7" rx="1"/><rect y="15" width="164" height="7" rx="1"/><rect y="29" width="164" height="7" rx="1"/><rect y="73" width="50" height="7" rx="1"/><rect x="58" y="73" width="50" height="7" rx="1"/><rect x="116" y="73" width="49" height="7" rx="1"/></g><rect fill="#D9E2EC" x="7" y="7" width="13" height="13" rx="1"/><rect fill="#D9E2EC" x="236" y="7" width="13" height="13" rx="1"/><rect fill="#D9E2EC" x="7" y="95" width="13" height="13" rx="1"/><rect fill="#D9E2EC" x="236" y="95" width="13" height="13" rx="1"/><path d="M52.1999986,98.0999974 C53.9565578,98.0018541 55.058136,97.6549539 55.504733,97.0592967 C55.9513301,96.4636395 55.9513301,95.3412892 55.504733,93.6922458 C54.8930683,91.3301263 54.7633018,89.8842073 55.1154336,89.3544887 C56.1502461,87.7978001 58.8305446,88.1015275 59.4276354,88.61746 C60.8513794,89.8476847 60.2292937,93.6480306 60.3173993,94.1375533 C60.4655454,94.9606659 60.6491775,95.6869439 61.6161432,95.6295809 C62.5831088,95.572218 63.5426116,92.9922898 65.0122902,92.9922898 C66.4819688,92.9922898 66.2980463,95.1878516 67.3907533,95.1878516 C68.4834603,95.1878516 68.7106951,94.1375533 70.3635228,94.1375533 C70.9869325,94.1375533 71.6848475,95.0499041 73.488504,95.4379808 C74.411391,95.6365501 76.3152226,95.8092701 79.1999986,95.9561407" stroke="#BCCBE2" stroke-linecap="round" stroke-linejoin="round"/><path fill="#F0F4F9" d="M9 9H11V18H9zM238 9H240V16H238zM238 97H240V104H238zM9 97H11V106H9zM13 16H18V18H13zM239 16H241V18H239zM239 104H244V106H239zM245 16H247V18H245zM13 101H18V103H13z"/></g></svg>
      </div>
    {:elseif file}
      <Attachment on:remove="removeFile(event)">myfile.png</Attachment>
    {/if}
  </Screen>

  {#if view === 'upload'}
    <Callout
      showIcon={false}
      classes={['nach-callout']}
    >
      <ol>
        <li>The image should not be <strong>cropped</strong> and should not have any <strong>shadows</strong></li>
        <li>Only {ALLOWED_EXTS.map(x => x.toUpperCase()).join(', ')} files with size less than {ALLOWED_MAX_SIZE} MB are allowed</li>
      </ol>
    </Callout>
  {/if}
</Tab>


<style>
  :global(.nach-callout) {
    padding-left: 12px !important;

    ol {
      padding-left: 12px;
      margin: 0;
    }
  }

  ref:illustration {
    text-align: center;

    svg {
      max-width: 90%;
    }
  }
</style>


<script>
  import { makeAuthUrl } from 'common/Razorpay';

  const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png'];
  const ALLOWED_MAX_SIZE = 6;

  /**
   * Tells if a filename has a valid extension
   * @param {string} filename
   * @param {Array<string>} extensions
   *
   * @returns {boolean}
   */
  function hasValidExtension (filename, extensions) {
    return _Arr.any(extensions, extension => filename.indexOf(extension) === filename.length - extension.length);
  }

  /**
   * Validates the uploaded file
   * @param {File} file
   *
   * @returns {Object} error
   */
  function validateFile (file) {
    const filename = file.name;
    const size = file.size;

    if (!hasValidExtension(filename, ALLOWED_EXTS)) {
      return {
        main: 'File type not supported',
        description: `The uploaded file type is not supported. Only ${_Arr.map(ALLOWED_EXTS, x => x.toUpperCase()).join(', ')} files are allowed.`
      };
    }

    if (size / 1024 / 1024 > ALLOWED_MAX_SIZE) {
      return {
        main: 'File size is too large',
        description: `Please upload a smaller file. The uploaded file is larger than ${ALLOWED_MAX_SIZE} MB`
      }
    }
  }

  /**
   * Uploads the NACH document
   * @param {Razorpay} razorpay
   * @param {File} file
   * 
   * @returns {[Promise, Function]} [promise, abort]
   */
  function uploadDocument (razorpay, file) {
    let ajax;

    // Aborts the upload request
    function abort () {
      if (ajax) {
        ajax.abort();
        ajax = null;
      }
    }

    // Promise that gets fulfilled when upload n/w request is complete
    const promise = new Promise((resolve, reject) => {
      const url = makeAuthUrl(razorpay, 'token.registration/paper_mandate/authenticate');
      const data = new FormData();
      const order_id = razorpay.get('order_id');
      const auth_link_id = razorpay.get('auth_link_id');

      data.append('form_uploaded', file);

      if (order_id) {
        data.append('order_id', order_id);
      }

      if (auth_link_id) {
        data.append('auth_link_id', auth_link_id);
      }

      ajax = fetch({
        data,
        url,
        method: 'POST',
        callback: response => {
          ajax = null;

          if (response.error) {
            return reject(response);
          }

          return resolve(response);
        }
      });
    });

    return [promise, abort];
  }

  export default {
    components: {
      Attachment: 'templates/views/ui/Attachment.svelte',
      Callout: 'templates/views/ui/Callout.svelte',
      Tab: 'templates/tabs/Tab.svelte',
      Screen: 'templates/layouts/Screen.svelte',
    },

    computed: {
      view: ({ file }) => file ? 'confirm' : 'upload'
    },

    data: () => ({
      ALLOWED_EXTS,
      ALLOWED_MAX_SIZE,

      abortUpload: () => {}, // Fn to abort the upload request
      file: null, // File that is uploaded
      uploading: false, // Are we currently uploading?
    }),

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

        const {
          error,
          session,
          uploading,
          view,
        } = this.get();

        _El.addClass(footerButtons.pay, 'invisible');

        if (view === 'upload' && !uploading) {
          _El.removeClass(footerButtons.attachNachForm, 'invisible');
        }
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

            this.set({
              uploading: false,
            });

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
          file,
          view,
        } = this.get();

        if (!file) {
          this.refs.file.click();
          return false;
        }

        if (view === 'upload') {
          return false;
        }

        return true;
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
        const error = validateFile(file);

        this.set({
          uploading: true
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
            session.showLoadError('Uploading your NACH form');

            const [ uploadRequest, abortUpload ] = uploadDocument(session.r, file);

            this.set({
              abortUpload,
            });

            uploadRequest
              .then(response => {
                this.set({
                  file: true,
                  uploading: false,
                });

                session.hideOverlayMessage();
              })
              .catch(({ error }) => {
                this.showError(error);
              });
          }
        }, 1000);
      },
    }
  }
</script>
