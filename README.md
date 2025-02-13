# ember-pollster

Ember Pollster is a simple polling service designed for deterministically
testable applications.  It replaces heavyweight solutions like Ember Concurrency
for many use cases.

Ember Pollster is compatible with Ember v4.0.


## Compatibility

* Ember.js v3.28, v4.0, and above
* Ember CLI v3.28, v4.0, and above
* Node.js v20 and above


## Installation

```sh
ember install ember-pollster
```


## Usage

Ember Pollster enables two usage modes:  one for automatic route polling and
another for manual polling use cases.  Both cases are easy to test in an
explicit, deterministic manner.

### Route Polling

A route poller is just a plain method on your route, decorated by
`@runEvery(millseconds)`.  Polling route methods are automatically managed by
Ember Pollster ensuring the following conditions are met:

- Polling is activated when the route enters.
- Polling is deactivated when the route exits.
- In a testing environment, polling does not run automatically and must be
  explicitly executed via the included test helpers.

For example:

```js
import Route from '@ember/routing/route';
import runEvery from 'ember-pollster/decorators/route/run-every';

export default class MyRoute extends Route {
  model() {
    // ... make API request
  }

  // This method automatically executes every second when this route
  // (or its children) is active.  Since it's just a plain method, it may still
  // be called like one as needed.
  @runEvery(1000)
  poller() {
    this.refresh();
  }
}
```

### Service Usage

Need to setup and run polling manually?  No problem.  Ember Pollster exposes a
service for this use case:

```js
@service pollster;

createJobAndStartPolling() {
  // Either bind the function to the context first OR pass an arrow function.
  const fn = () => this.poller();
  // Call `findOrCreateJob` to avoid creating multiple jobs
  // for the same function.
  this.job = this.pollster.findOrCreateJob(fn, 1000);
  this.job.start();
}

tearDown() {
  this.job.stop();
}

poller() {
  // do something repeatedly
}
```

Just remember to manually stop polling with `job.stop()`.


### Explicit Testing

To test applications that use Ember Pollster, first import the test helpers:

```js
import { runAllJobs, hasRunningJobs } from 'ember-pollster/test-support';
```

To explicitly run jobs as needed throughout your tests, use
`await runAllJobs()`.  This test helper executes any jobs in a "running" state
(for example, jobs on a currently active route), ignoring jobs that aren't
running.  Note that in a testing environment jobs do not execute automatically
even when they are in a "running" state.  This ensures deterministic testing.

```js
await runAllJobs();
```


## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
