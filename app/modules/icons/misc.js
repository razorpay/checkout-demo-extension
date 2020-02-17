const icons = {
  recieve: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.4597 11.24V14.18H9.19584V9.18H14.2111V10.42H11.2822L15.0336 14.18L20.0489 9.18L20.8714 10L15.0336 15.86L10.4597 11.24ZM5.68514 3H14.0306C14.4853 3 14.8798 3.16666 15.2142 3.5C15.5485 3.83334 15.7157 4.22666 15.7157 4.68V7.18H14.0306V5.5H5.68514V18.86H14.0306V17.18H15.7157V19.68C15.7157 20.1333 15.5485 20.5267 15.2142 20.86C14.8798 21.1933 14.4853 21.36 14.0306 21.36H5.68514C5.23042 21.36 4.83588 21.1933 4.50153 20.86C4.16717 20.5267 4 20.1333 4 19.68V4.68C4 4.22666 4.16717 3.83334 4.50153 3.5C4.83588 3.16666 5.23042 3 5.68514 3Z" fill="#3A97FC"/>
    </svg>`,
  redirect: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.68514 3H15.0306C15.4853 3 15.8798 3.16666 16.2142 3.5C16.5485 3.83334 16.7157 4.22666 16.7157 4.68V7.18H15.0306V5.5H6.68514V18.86H15.0306V17.18H16.7157V19.68C16.7157 20.1333 16.5485 20.5267 16.2142 20.86C15.8798 21.1933 15.4853 21.36 15.0306 21.36H6.68514C6.23042 21.36 5.83588 21.1933 5.50153 20.86C5.16717 20.5267 5 20.1333 5 19.68V4.68C5 4.22666 5.16717 3.83334 5.50153 3.5C5.83588 3.16666 6.23042 3 6.68514 3Z" fill="#3A97FC"/>
    <path d="M18.0034 12C17.0087 11.1056 15.7184 10.5556 14.2937 10.5556C11.7937 10.5556 9.68078 12.2389 8.93884 14.5667L10.2077 15C10.7722 13.2278 12.3851 11.9444 14.2937 11.9444C15.3421 11.9444 16.2991 12.3444 17.0464 12.9889L15.1001 15H19.9388V10L18.0034 12Z" fill="#3A97FC"/>
    </svg>`,
};

export function getMiscIcon(icon) {
  return icons[icon];
}
