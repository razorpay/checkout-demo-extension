export const copyToClipboard = (selector, refData) => {
  var selectedElement = document.querySelector(selector);
  var textArea = document.createElement('textarea');
  textArea.value = refData;
  selectedElement.appendChild(textArea);
  textArea.select();
  try {
    return document.execCommand('copy');
  } catch (err) {
    return false;
  } finally {
    selectedElement.removeChild(textArea);
  }
};
