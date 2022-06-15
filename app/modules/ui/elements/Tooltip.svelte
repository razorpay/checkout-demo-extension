<script lang="ts">
  // Svelte imports
  import { onMount, onDestroy } from 'svelte';
  import { querySelector } from 'utils/doc';

  // Props
  export let className;
  export let shown = false; // Is it shown?
  export let bindTo = '#body'; // Where should the alignment be bound to?
  export let autoAlign = true; // Should align automatically after mounting?
  export let align = ['right']; // Default alignment directions
  export let alignOnHover = true; // Should we align again when parent is hovered on?
  import * as _El from 'utils/DOM';
  // Refs
  let tooltip = null;

  function isWithinBounds(parent, child) {
    const rects = {
      parent: parent.getBoundingClientRect(),
      child: child.getBoundingClientRect(),
    };

    if (
      rects.parent.top <= rects.child.top &&
      rects.parent.bottom >= rects.child.bottom &&
      rects.parent.left <= rects.child.left &&
      rects.parent.right >= rects.child.right
    ) {
      return true;
    }

    return false;
  }

  /**
   * Gets the directions in which the child is overflowing
   * within the parent
   *
   * @param {DOMNode} parent
   * @param {DOMNode} child
   *
   * @return {Array}
   */
  function getOverflowingDirections(parent, child) {
    const rects = {
      parent: parent.getBoundingClientRect(),
      child: child.getBoundingClientRect(),
    };

    const directions = [];

    if (rects.parent.top > rects.child.top) {
      directions.push('top');
    }

    if (rects.parent.bottom < rects.child.bottom) {
      directions.push('bottom');
    }

    if (rects.parent.left > rects.child.left) {
      directions.push('left');
    }

    if (rects.parent.right < rects.child.right) {
      directions.push('right');
    }

    return directions;
  }

  const ALL_DIRECTIONS = ['left', 'right', 'top', 'bottom'];
  const OPPOSITE_DIRECTIONS = {
    top: 'bottom',
    left: 'right',
    right: 'left',
    bottom: 'top',
  };
  const OPPOSITE_AXIS = {
    left: ['top', 'bottom'],
    right: ['top', 'bottom'],
    top: ['left', 'right'],
    bottom: ['left', 'right'],
  };

  /**
   * Aligns tooltip to the list of directions.
   *
   * @param {DOMNode} tooltip
   * @param {Array} directions
   */
  function alignTooltipTo(tooltip, directions = []) {
    // Remove all directions.
    ALL_DIRECTIONS.forEach((direction) =>
      _El.removeClass(tooltip, `tooltip-${direction}`)
    );

    // Align tooltip to provided directions.
    directions.forEach((direction) => {
      if (!direction) {
        return;
      }

      _El.addClass(tooltip, `tooltip-${direction}`);
    });
  }

  /**
   * Aligns tooltip to provided direction and then checks bounds.
   *
   * @param {DOMNode} parent
   * @param {DOMNode} tooltip
   * @param {DOMNode} directions
   *
   * @return {Boolean}
   */
  function alignTooltipAndCheckBounds(parent, tooltip, directions) {
    alignTooltipTo(tooltip, directions);

    return isWithinBounds(parent, tooltip);
  }

  /**
   * Gets the directions in which tooltip should be aligned.
   *
   * @param {DOMNode} parent Container to which tooltip should be kept bounded to.
   * @param {DOMNode} tooltip
   * @param {Array} directions List of initial directions
   *
   * @return {Array}
   */
  function getTooltipAlignedDirections(parent, tooltip, directions) {
    if (isWithinBounds(parent, tooltip)) {
      return directions;
    }

    const rects = {
      parent: parent.getBoundingClientRect(),
      tooltip: tooltip.getBoundingClientRect(),
    };

    const overflowIn = getOverflowingDirections(parent, tooltip);

    let directionsList = [];

    if (overflowIn.length === 2) {
      // Flip only one
      directionsList.push([OPPOSITE_DIRECTIONS[overflowIn[0]], overflowIn[1]]);
      directionsList.push([OPPOSITE_DIRECTIONS[overflowIn[1]], overflowIn[0]]);

      // Flip both
      directionsList.push([
        OPPOSITE_DIRECTIONS[overflowIn[0]],
        OPPOSITE_DIRECTIONS[overflowIn[1]],
      ]);
    } else if (overflowIn.length === 1) {
      const flipped = OPPOSITE_DIRECTIONS[overflowIn[0]];
      const opposite = OPPOSITE_AXIS[flipped];

      // Flip just the overflowing direction
      directionsList.push(
        [flipped].concat(
          directions.filter((direction) => direction !== overflowIn[0])
        )
      );

      // Flip the entire direction
      directionsList.push([flipped]);

      // Flip the direction and add opposite axes.
      opposite.forEach((direction) => {
        directionsList.push([direction, flipped]);
      });

      // Use only the opposite axes.
      opposite.forEach((direction) => {
        directionsList.push([direction]);
      });

      // Last resort: use the overflow direction and flip axes.
      opposite.forEach((direction) => {
        directionsList.push([direction, overflowIn[0]]);
      });
    }

    // Find a direction that binds the tooltip properly.
    for (let i = 0; i < directionsList.length; i++) {
      if (alignTooltipAndCheckBounds(parent, tooltip, directionsList[i])) {
        return directionsList[i];
      }
    }

    return directions;
  }

  function setAlignmentClasses() {
    alignTooltipTo(tooltip, align);
  }

  function setBounds() {
    if (!autoAlign || !bindTo) {
      return;
    }

    const boundingElem = querySelector(bindTo);

    if (!boundingElem || !tooltip) {
      return;
    }

    align = getTooltipAlignedDirections(boundingElem, tooltip, align);

    setAlignmentClasses();
  }

  /**
   * Returns the first parent with 'has-tooltip' class
   *
   * @returns {Element}
   */
  function getHoverParent() {
    let parent = tooltip;
    //Do not call this function if Tooltip is destroyed.
    if (!parent) {
      return;
    }
    while (!_El.hasClass(parent, 'has-tooltip')) {
      parent = _El.parent(parent);
    }

    return parent;
  }

  /**
   * Adds alignment listener on hover parent.
   */
  function addAlignmentListenerFromHoverParent() {
    if (!alignOnHover) {
      return;
    }

    let hoverParent = getHoverParent();

    if (!hoverParent) {
      return;
    }

    hoverParent.addEventListener('mouseover', setBounds);
  }

  /**
   * Removes alignment listener on hover parent.
   */
  function removeAlignmentListenerFromHoverParent() {
    if (!alignOnHover) {
      return;
    }

    let hoverParent = getHoverParent();

    if (!hoverParent) {
      return;
    }

    hoverParent.removeEventListener('mouseover', setBounds);
  }

  onMount(() => {
    setTimeout(() => {
      setAlignmentClasses();
      setBounds();
      addAlignmentListenerFromHoverParent();
    });
  });

  onDestroy(() => {
    removeAlignmentListenerFromHoverParent();
  });
</script>

<div
  class="tooltip {className}"
  class:tooltip-shown={shown}
  bind:this={tooltip}
>
  <slot />
</div>
