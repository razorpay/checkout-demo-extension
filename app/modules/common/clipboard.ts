export const copyToClipboard = (selector: string, refData: string) => {
  const selectedElement = document.querySelector(selector) as HTMLElement;
  const textArea = document.createElement('textarea');
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
