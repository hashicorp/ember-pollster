import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | pollster', function (hooks) {
  setupTest(hooks);

  let service;
  let x;
  let y;
  let fn;
  let fn2;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:pollster');
    x = false;
    fn = () => (x = true);
    y = false;
    fn2 = () => (y = true);
  });

  test('it creates jobs by function', function (assert) {
    assert.expect(2);
    const job = service.createJob(fn, 1000);
    assert.false(x, 'job did not execute yet');
    job.run();
    assert.true(x, 'job executed');
  });

  test('it finds jobs by function', function (assert) {
    assert.expect(2);
    service.createJob(fn, 1000);
    const job = service.findJob(fn);
    assert.false(x, 'job did not execute yet');
    job.run();
    assert.true(x, 'job executed');
  });

  test('it finds or creates jobs by function', function (assert) {
    assert.expect(5);
    let job = service.findJob(fn);
    assert.notOk(job, 'job does not exist yet');
    job = service.findOrCreateJob(fn, 1000);
    assert.ok(job, 'job exists');
    assert.strictEqual(
      job,
      service.findOrCreateJob(fn),
      'subsequent calls return the same job'
    );
    assert.false(x, 'job did not execute yet');
    job.run();
    assert.true(x, 'job executed');
  });

  test('it knows if jobs are running', function (assert) {
    assert.expect(6);
    const job = service.createJob(fn, 1000);
    assert.false(job.isRunning, 'job is stopped');
    assert.false(service.hasRunningJobs, 'jobs are stopped');
    assert.false(x, 'job did not execute');
    job.start();
    assert.true(job.isRunning, 'job is started');
    assert.true(service.hasRunningJobs, 'jobs are started');
    assert.false(x, 'though started, job did not execute');
  });

  test('it can explicitly execute jobs that are running', function (assert) {
    assert.expect(9);
    const job = service.createJob(fn, 1000);
    const job2 = service.createJob(fn2, 1000);
    assert.false(service.hasRunningJobs, 'jobs are stopped');
    assert.false(x, 'job did not execute');
    assert.false(y, 'job2 did not execute');
    service.runAll();
    assert.false(service.hasRunningJobs, 'jobs are stopped');
    assert.false(x, 'job did not execute because it is not running');
    assert.false(y, 'job2 did not execute because it is not running');
    job.start();
    job2.start();
    service.runAll();
    assert.true(service.hasRunningJobs, 'jobs are started');
    assert.true(x, 'job executed because it is running');
    assert.true(y, 'job2 executed because it is running');
  });

  test('it can explicitly execute asynchronous jobs that are running', async function (assert) {
    assert.expect(6);
    const promise1 = new Promise((resolve) =>
      setTimeout(() => {
        fn();
        resolve();
      }, 100)
    );
    const promise2 = new Promise((resolve) =>
      setTimeout(() => {
        fn2();
        resolve();
      }, 500)
    );
    const job = service.createJob(() => promise1, 5000);
    const job2 = service.createJob(() => promise2, 5000);
    assert.false(service.hasRunningJobs, 'jobs are stopped');
    await service.runAll();
    assert.false(x, 'async job did not execute because it is not running');
    assert.false(y, 'async job2 did not execute because it is not running');
    job.start();
    job2.start();
    await service.runAll();
    assert.true(service.hasRunningJobs, 'jobs are started');
    assert.true(x, 'async job executed because it is running');
    assert.true(y, 'async job2 executed because it is running');
  });
});
