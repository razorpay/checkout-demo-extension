/**
 * sends a request to the specified url from a form. this will change the window location.
 * @param formData Information of form
 * @param formData.path the path to send the post request to
 * @param formData.params the parameters to add to the url
 * @param formData.method the method to use on the form (default post)
 * @param formData.target target of form action
 * @param formData.doc html document object used to create form in that document (default current window.document)
 */

export function submitForm(formData) {
  const {
    doc = window.document,
    path,
    params,
    method = 'post',
    target,
  } = formData;

  if (method && method.toLowerCase() === 'get') {
    const action = appendParamsToUrl(path, params);
    if (target) {
      window.open(action, target);
    } else {
      window.location = action;
    }
    return;
  }
  // The rest of this code assumes you are not using a library.
  // It can be made less verbose if you use one.
  const form = doc.createElement('form');
  form.method = method;
  form.action = path;
  if (target) {
    form.target = target;
  }

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = doc.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  doc.body.appendChild(form);
  form.submit();
}

/**
 * Appends params to the URL from an object
 * @param {string} url
 * @param {Object} params
 *
 * @returns {string}
 */
export function appendParamsToUrl(url, params) {
  if (typeof params === 'object' && params !== null) {
    params = serialize(params);
  }
  if (params) {
    url += url.indexOf('?') > 0 ? '&' : '?';
    url += params;
  }
  return url;
}

/**
 * Returns query string generated from the provided object.
 * @param {Object} obj
 *
 * @returns {string}
 */
 export function serialize(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}