export default (circleColor, arrowColor) => {
  if (!circleColor || !arrowColor) {
    return;
  }
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 0.941406C4.59219 0.941406 1 4.5336 1 8.94141C1 13.3492 4.59219 16.9414 9 16.9414C13.4078 16.9414 17 13.3492 17 8.94141C17 4.5336 13.4078 0.941406 9 0.941406ZM9 16.2473C4.97397 16.2473 1.69414 12.9674 1.69414 8.94141C1.69414 4.91538 4.97397 1.63555 9 1.63555C13.026 1.63555 16.3059 4.91538 16.3059 8.94141C16.3059 12.9674 13.026 16.2473 9 16.2473Z" fill="${circleColor}"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.5 8.94141C0.5 4.25745 4.31605 0.441406 9 0.441406C13.684 0.441406 17.5 4.25745 17.5 8.94141C17.5 13.6254 13.684 17.4414 9 17.4414C4.31605 17.4414 0.5 13.6254 0.5 8.94141ZM9 2.13555C5.25011 2.13555 2.19414 5.19152 2.19414 8.94141C2.19414 12.6913 5.25011 15.7473 9 15.7473C12.7499 15.7473 15.8059 12.6913 15.8059 8.94141C15.8059 5.19152 12.7499 2.13555 9 2.13555Z" fill="${circleColor}"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.36439 8.15929C9.27762 8.15929 9.20821 8.12458 9.13879 8.07252L7.85463 6.89248C7.76786 6.82306 7.73315 6.71894 7.73315 6.61482C7.73315 6.5107 7.78521 6.42393 7.87198 6.35451L11.4815 3.75148C11.603 3.66471 11.7939 3.68206 11.9154 3.78619C12.0195 3.89031 12.0542 4.0812 11.9674 4.22003L9.6594 8.0031C9.60734 8.08987 9.52057 8.14193 9.41645 8.15929H9.36439ZM7.69865 7.65649L10.7182 10.3289L12.8527 12.2378C13.0088 12.3593 13.0088 12.5849 12.8874 12.7237C12.818 12.8105 12.7312 12.8452 12.6271 12.8452C12.5577 12.8452 12.4709 12.8105 12.4015 12.7584L10.4579 11.0404L9.72902 11.509C9.72034 11.509 9.71167 11.5133 9.70299 11.5177C9.69431 11.522 9.68564 11.5263 9.67696 11.5263L6.10212 13.8691C6.03271 13.9038 5.98065 13.9211 5.91123 13.9211C5.82447 13.9211 5.7377 13.8864 5.66828 13.817C5.54681 13.6955 5.52945 13.522 5.61622 13.3832L7.6813 9.98187L5.85917 8.33328C5.7724 8.26387 5.7377 8.15974 5.7377 8.05562C5.7377 7.9515 5.78976 7.86473 5.87653 7.79532L6.37978 7.43089L4.57501 5.81701C4.41883 5.69554 4.41883 5.46994 4.5403 5.33111C4.66178 5.17493 4.88737 5.17493 5.0262 5.2964L7.17804 7.2053L7.69865 7.65649Z" fill="${arrowColor}"/>
  </svg>
  `;
};
