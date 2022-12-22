export default (
  foregroundColor?: string,
  backgroundColor = '#36B34F',
  width = '16',
  height = '16'
) =>
  `<svg width="${width}" height="${height}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm4.707-9.96a1 1 0 0 0-1.414-1.414L6.62 9.298 4.66 7.581a1 1 0 1 0-1.317 1.505l2.666 2.333a1 1 0 0 0 1.366-.045l5.333-5.334Z" fill="${backgroundColor}"/></svg>`;
