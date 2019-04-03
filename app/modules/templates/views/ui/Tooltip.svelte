<div
  class="tooltip {class} "
  class:tooltip-shown="shown"
  ref:tooltip
>
  <slot></slot>
</div>

<script>
  /**
   * Checks if child is within the bounds of parent.
   *
   * @param {DOMNode} parent
   * @param {DOMNODe} child
   *
   * @return {Boolean}
   */
  function isWithinBounds (parent, child) {
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
  function getOverflowingDirections (parent, child) {
    const rects = {
      parent: parent.getBoundingClientRect(),
      child: child.getBoundingClientRect(),
    };

    const directions = []

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
  function alignTooltipTo(tooltip, directions) {
    // Remove all directions.
    _Arr.loop(ALL_DIRECTIONS, direction => _El.removeClass(tooltip, `tooltip-${direction}`));

    // Align tooltip to provided directions.
    _Arr.loop(directions, direction => _El.addClass(tooltip, `tooltip-${direction}`));
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
   * @param {Array} align List of directions
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
      directionsList.push([flipped, _Arr.remove(_Obj.clone(directions), overflowIn[0])]);

      // Flip the entire direction
      directionsList.push([flipped]);

      // Flip the direction and add opposite axes.
      _Arr.loop(opposite, direction => {
        directionsList.push([direction, flipped]);
      });

      // Use only the opposite axes.
      _Arr.loop(opposite, direction => {
        directionsList.push([direction]);
      });

      // Last resort: use the overflow direction and flip axes.
      _Arr.loop(opposite, direction => {
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

  export default {
    data: function () {
      return {
        bindTo: '#body',
        autoAlign: true,
        align: ['right'],
        shown: false,
      }
    },

    methods: {
      /**
       * Sets the alignment classes.
       */
      setAlignmentClasses: function () {
        const {
          align
        } = this.get();

        const {
          tooltip
        } = this.refs;

        alignTooltipTo(tooltip, align);
      },

      /**
       * Sets the bounds.
       */
      setBounds: function () {
        const {
          bindTo,
          autoAlign,
          align
        } = this.get();

        if (!autoAlign || !bindTo) {
          return;
        }

        const boundingElem = _Doc.querySelector(bindTo);
        const tooltip = this.refs.tooltip;

        if (!boundingElem || !tooltip) {
          return;
        }

        this.set({
          align: getTooltipAlignedDirections(boundingElem, tooltip, align),
        });

        this.setAlignmentClasses();
      }
    },

    oncreate: function () {
      setTimeout(() => {
        this.setAlignmentClasses();
        this.setBounds();
      });
    }
  }
</script>
