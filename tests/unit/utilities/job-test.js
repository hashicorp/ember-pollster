import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Job from 'ember-pollster/utilities/job';

module('Unit | Utilities | job', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    assert.ok(Job);
  });

  test('it requires `fn` and `frequency`', function (assert) {
    assert.expect(2);
    assert.throws(() => new Job());
    assert.throws(() => new Job(() => {}));
  });

  test('it can enter a running state (but not automatically execute) in test mode', function (assert) {
    assert.expect(5);
    let x = false;
    const job = new Job(() => x = true, 1000);
    assert.false(x, 'job has not executed yet');
    assert.true(job.isTesting, 'job is in a test mode');
    assert.false(job.isRunning, 'job is in a stopped state');
    job.start();
    assert.false(x, 'job has not executed yet');
    assert.true(job.isRunning, 'job is in a running state');
  });

  test('it can start and stop', function (assert) {
    assert.expect(3);
    let x = false;
    const job = new Job(() => x = true, 1000);
    assert.false(job.isRunning, 'job is in a stopped state');
    job.start();
    assert.true(job.isRunning, 'job is in a running state');
    job.stop();
    assert.false(job.isRunning, 'job is in a stopped state again');
  });

  test('it can be executed on a one-off basis', function (assert) {
    assert.expect(4);
    let x = false;
    const job = new Job(() => x = true, 1000);
    assert.false(x, 'job has not executed yet');
    assert.false(job.isRunning, 'job is in a stopped state');
    job.run();
    assert.true(x, 'job executed');
    assert.false(job.isRunning, 'job is still in a stopped state');
  });

  test('it can be executed, returning a promise', async function (assert) {
    assert.expect(4);
    let x = false;
    const promise = new Promise((resolve) => setTimeout(() => {
      x = true;
      resolve();
    }, 10));
    const job = new Job(() => promise, 1000);
    assert.false(x, 'job has not executed yet');
    assert.false(job.isRunning, 'job is in a stopped state');
    await job.run();
    assert.true(x, 'job executed');
    assert.false(job.isRunning, 'job is still in a stopped state');
  });
});
