const defaultOptions = {
  heading: '',
  showClose: true,
  onShow: () => {},
  onClose: () => {},
};

var listeners = [];

function on(event, sel, listener) {
  /* $el.on return a function to removeEventListener */
  listeners.push(_Doc.querySelector(sel) |> _El.on(event, listener));
}

function unbind() {
  invokeEach(listeners);
  listeners = [];
}

export function hide() {
  _Doc.querySelector('#curtain-container-parent')
    |> _El.removeClass('visible')
    |> _El.addClass('invisible')
    |> _El.setContents('');
  unbind();
}

export function show(options) {
  options = {} |> _Obj.extend(defaultOptions) |> _Obj.extend(options);

  // Set contents and show container.
  const parentContainer = _Doc.querySelector('#curtain-container-parent');
  _El.setContents(parentContainer, templates.curtain(options));

  if (!options.showClose) {
    _El.addClass(parentContainer, 'curtain-hideclose');
  } else {
    const closer = () => {
      hide();
      options.onClose.call(null);
    };

    on('click', '.curtain-container .curtain-close', closer);
    on('click', '#curtain-overlay', closer);
  }

  parentContainer |> _El.removeClass('invisible') |> _El.addClass('visible');

  // Invoke callback.
  options.onShow.call(null, parentContainer);
}
