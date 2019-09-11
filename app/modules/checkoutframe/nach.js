import { makeAuthUrl } from 'common/Razorpay';

export const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png'];
export const ALLOWED_MAX_SIZE_IN_MB = 5;

/**
 * Tells if a filename has a valid extension
 * @param {string} filename
 * @param {Array<string>} extensions
 *
 * @returns {boolean}
 */
function hasValidExtension(filename, extensions) {
  return _Arr.any(
    extensions,
    extension =>
      filename.indexOf(extension) === filename.length - extension.length
  );
}

/**
 * Turns a word to capitalcase
 * @param {string} word
 *
 * @returns {string} Word
 */
function capitalCase(word) {
  return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
}

/**
 * Turns an entity name to a group of words,
 * Splits by underscores and periods.
 * @param {string} word foo_bar.bar_baz
 *
 * @returns {string} Foo Bar Baz
 */
function entityToWords(word) {
  const words = _Arr.map(word.split(/_|\./g), capitalCase);

  let prev;

  const filtered = _Arr.filter(words, word => {
    const sameAsLast = word === prev;

    prev = word;

    return !sameAsLast;
  });

  return _Arr.join(filtered, ' ');
}

/**
 * Validates the uploaded file
 * @param {File} file
 *
 * @returns {Object} error
 */
export function getValidityError(file) {
  const filename = file.name;
  const size = file.size;

  if (!hasValidExtension(filename, ALLOWED_EXTS)) {
    return {
      description: `The uploaded file type is not supported. Only ${_Arr
        .map(ALLOWED_EXTS, x => x.toUpperCase())
        .join(', ')} files are allowed.`,
    };
  }

  if (size / 1024 / 1024 > ALLOWED_MAX_SIZE_IN_MB) {
    return {
      description: `Please upload a smaller file. The uploaded file is larger than ${ALLOWED_MAX_SIZE_IN_MB} MB.`,
    };
  }
}

/**
 * Uploads the NACH document
 * @param {Razorpay} razorpay
 * @param {File} file
 *
 * @returns {[Promise, Function]} [promise, abort]
 */
export function uploadDocument(razorpay, file) {
  let ajax;

  // Aborts the upload request
  function abort() {
    if (ajax) {
      ajax.abort();
      ajax = null;
    }
  }

  // Promise that gets fulfilled when upload n/w request is complete
  const promise = new Promise((resolve, reject) => {
    const url = makeAuthUrl(
      razorpay,
      'token.registration/paper_mandate/authenticate'
    );
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

        if (response.error || response.success === false) {
          return reject(response);
        }

        return resolve(response);
      },
    });
  });

  return {
    abort,
    promise,
  };
}

/**
 * Generates the error object from API response.
 * @param {Object} response
 *
 * @return {Object} error
 */
export function generateError(response) {
  let description =
    "We couldn't process your file. Please upload an image with better quality.";

  if (response.success === false) {
    // Error with the details in the image

    if (response.errors.not_matching) {
      description = `We could not read the following details on the NACH form: ${_Arr.join(
        _Arr.map(response.errors.not_matching, entityToWords),
        ', '
      )}. Please upload an image with better quality.`;
    }

    return {
      description,
    };
  } else if (response.error) {
    // Generic API error
    return response.error;
  }

  return {
    description,
  };
}
