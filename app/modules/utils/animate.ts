export function flip(
  fn: (...args: any[]) => void,
  firstElements: HTMLElement[],
  lastElements = firstElements
) {
  // Filter out all the elements that that not available
  firstElements = firstElements.filter((i) => i);
  lastElements = lastElements.filter((i) => i);

  // Read position and dimension values before performing an action
  // that'd cause layout change. we will start the animation from
  // this point.
  const firstRectangles = firstElements.map((element) => {
    return element.getBoundingClientRect();
  });

  // perform the action that'd cause layout shift
  fn();

  requestAnimationFrame(() => {
    // getting the last position and dimension values after browser has repainted
    // will get this value in next repaint
    const lastRectangles = lastElements.map((element) => {
      return element.getBoundingClientRect();
    });

    lastRectangles.forEach((lastRectangle, i) => {
      const firstRectangle = firstRectangles[i];
      const lastElement = lastElements[i];
      const avoidWidthStretch = lastElement.dataset.avoidWidthStretch || false;

      // calculating the deltas
      const dx = firstRectangle.left - lastRectangle.left;
      const dy = firstRectangle.top - lastRectangle.top;
      const dh = firstRectangle.height / lastRectangle.height;

      // if width of the element changes because the text got ellipsized or due to some other reason
      // and height has not changed, then the animation should not stretch the width and skip
      // width transformation.
      const dw =
        dh === 1 && avoidWidthStretch
          ? 1
          : firstRectangle.width / lastRectangle.width;

      // adding delta values as a css custom property so that
      // the element can be translated and scaled to the
      // initial position (even though element is moved to
      // the final position)
      lastElement.style.setProperty('--dx', String(dx));
      lastElement.style.setProperty('--dy', String(dy));
      lastElement.style.setProperty('--dw', String(dw));
      lastElement.style.setProperty('--dh', String(dh));

      // applying the above deltas so that element actually
      // appear to be at the initial position
      lastElement.dataset.flip = 'invert';
    });

    requestAnimationFrame(() => {
      // playing the animation where we reset the transform and
      // let element animate from initial position to final
      // position.
      lastElements.forEach((lastElement) => {
        lastElement.dataset.flip = 'play';
      });
    });
  });
}
