### How to trigger Track events from module

- Define a set for events at module level. For eg

```
const HomeScreenEvents = {
  CONTACT_ENTERED: {name: 'Contact entered', type: 'behav'}, // can be an object of type {name: string, type: 'render|behav|api|integration..types'}
  HOME_RENDER: 'Home render' // can be a string
}
```

- Define a map of these events with their properties. For eg

```
type HomeEventsMap = {
  CONTACT_ENTERED: {contact: string};
  HOME_RENDER: undefined
}
```

- Create a Tracker for each module. For eg

```
const HomeScreenTracker = createTrackMethodForModule<HomeEventsMap>(HomeScreenEvents);
```

- Use it for each event in module. For eg.

```
HomeScreenTracker.HOME_RENDER() // correct: matches the schema
HomeScreenTracker.HOME_RENDER({}) // error: expected 0 argument
HomeScreenTracker.CONTACT_ENTERED({contact: 'a'}) // correct: matches the schema
HomeScreenTracker.CONTACT_ENTERED({email: 'a'}) // error: expected {contact:string}
```
