## NativeRadio

```html
<script>
  import NativeRadio from 'ui/elements/NativeRadio';
</script>
```

### inputProps

| Props      | Description                       |
| ---------- | --------------------------------- |
| id?        | radio input id or default to random id |
| checked    | Toggle radio state |
| label?     | radio label     |
| name?      | radio name     |
| value?     | radio value     |
| classes?   | Add custom classes on root element     |
| tabIndex?  | Change tabIndex of radio. Default to 0     |

### Actions

| Props    | Description                                                   |
| -------- | ------------------------------------------------------------- |
| on:change | trigger when checkbox is clicked       |

```html
<script>
    import NativeRadio from 'ui/elements/NativeRadio';

    let checked = false;

    const handleChange = (evt) => {
      checked = evt.target.checked;
    }
</script>

<NativeRadio
    label="Native Radio Input"
    checked={checked}
    on:change={handleChange}
/>
```
