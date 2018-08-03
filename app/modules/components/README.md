# Documentation of components within the `components` directory.

## Curtain

### `Curtain.show(options)`

Shows the curtain.

These are the options:

| name | type | required? | default | description |
| --- | --- | --- | --- | --- |
| heading | html | no | '' | Heading of the curtain |
| content | html | yes | | Content of the curtain |
| showClose | boolean | no | true | Whether or not to show the close icon |
| onShow | function | no | noop | Callback invoked once curtain is shown |
| onHide | function | no | noop | Callback invoked once user clicks on the close icon and the curtain is closed |

### `Curtain.hide()`

Hides the curtain.
