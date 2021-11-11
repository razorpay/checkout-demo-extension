## Experiments

### Create new Experiment

In your module `{module}/experiments`

```js
import { createExperiment } from 'experiments';

/**
 * Experiment: Experiment Name
 * <Experiment Description>
 */
const myExperiment = createExperiment('my_experiment', 0.5); // >= 1 disables the experiment
// or
const myExperiment = createExperiment('my_experiment', () =>
  Math.random() < 0.5 ? 0 : 1
);

// overriding evaluater function
const myExperiment = createExperiment('my_experiment', 0.5, {
  overrideFn: () => 0,
});

export { myExperiment };
```

You can create `n` number of experiments in your module single file.

This will create & register your experiment.
<br /><br />

### how to use it?

```js
import {myExperiment} from '<module>/experiments'

...

if(myExperiment.enabled()) {
    // my experiment is enabled :)
} else {
    // my experiment is disabled :(
}

...
```
