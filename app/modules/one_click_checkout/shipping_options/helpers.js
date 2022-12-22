export function isOptionIdValid(id = '', options = []) {
  const idList = options.map((option) => option.id);

  return idList.includes(id);
}

export function sortShippingOptions(options = []) {
  const arr = [...options];

  return arr.sort((a, b) => a.shipping_fee - b.shipping_fee);
}

export function getSelectedOptionIndex(id = '', options = []) {
  return options.findIndex((option) => id === option.id);
}
