import { getOwner } from '@ember/application';

export default function runEvery(frequency) {
  return function (target, propertyKey, desc) {
    let owner;
    let router;
    let pollster;
    let method;
    let job;

    const init = target.init;
    target.init = function () {
      const value = init.apply(this, arguments);
      owner = getOwner(this);
      router = owner.lookup('service:router');
      pollster = owner.lookup('service:pollster');

      // Setup the job
      method = desc.value.bind(this);
      job = pollster.findOrCreateJob(method, frequency);
      // If will change _away from_ the decorated route, stop the job.
      // This has no effect when navigating among subroutes of the
      // decorated route.
      router.on('routeWillChange', (transition) => {
        job = pollster.findJob(method);
        if (!transition.to.name.startsWith(this.routeName)) {
          job.stop();
          job = null;
        }
      });

      // If did change _into_ the decorated route, start the job.
      // This has no effect if the job is already running.
      router.on('routeDidChange', (transition) => {
        if (transition.to.name.startsWith(this.routeName)) {
          if (job) job.start();
        }
      });

      // Return original init return value
      return value;
    };
  };
}
