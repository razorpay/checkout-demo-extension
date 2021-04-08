/**
 * sends a request to the specified url from a form. this will change the window location.
 * @param {string} path the path to send the post request to
 * @param {object} params the parameters to add to the url
 * @param {string} [method=post] the method to use on the form
 * @param {target} target target of form action
 */

export function submitForm(doc, path, params, method = 'post', target) {
  // The rest of this code assumes you are not using a library.
  // It can be made less verbose if you use one.
  if (!doc) {
    doc = window.document;
  }
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
