/**
 * sends a request to the specified url from a form. this will change the window location.
 * @param formData Information of form
 * @param formData.url the path to send the post request to
 * @param formData.params the parameters to add to the url
 * @param formData.method the method to use on the form (default post)
 * @param formData.target target of form action
 * @param formData.doc html document object used to create form in that document (default current window.document)
 */

export function submitForm(formData) {
  const { doc = window.document, url, method = 'post', target } = formData;
  let { params = {} } = formData;
  params = flatten(params);

  if (method && method.toLowerCase() === 'get') {
    const action = appendParamsToUrl(url, params || '');
    if (target) {
      window.open(action, target);
    } else if (doc !== window.document) {
      doc.location = action;
    } else {
      window.location = action;
    }
    return;
  }
  // The rest of this code assumes you are not using a library.
  // It can be made less verbose if you use one.
  const form = doc.createElement('form');
  form.method = method;
  form.action = url;
  if (target) {
    form.target = target;
  }

  appendFormInput({ doc, form, data: params });
  doc.body.appendChild(form);
  form.submit();
}

export function appendFormInput({ doc = window.document, form, data }) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const hiddenField = createFormInput({
        doc,
        name: key,
        value: data[key],
      });

      form.appendChild(hiddenField);
    }
  }
}

function createFormInput(inputData) {
  const { doc = window.document, name, value } = inputData;
  const hiddenField = doc.createElement('input');
  hiddenField.type = 'hidden';
  hiddenField.name = name;
  hiddenField.value = value;
  return hiddenField;
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
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}

export function flatten(data = {}) {
  const result = {};
  if (Object.keys(data).length === 0) {
    return {};
  }
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      let l = cur.length;
      for (let i = 0; i < l; i++) {
        recurse(cur[i], prop + '[' + i + ']');
      }
      if (l === 0) {
        result[prop] = [];
      }
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '[' + p + ']' : p);
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    }
  }
  recurse(data, '');
  return result;
}
