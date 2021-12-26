import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | pollster', function (hooks) {
  setupTest(hooks);

  let service;
  let x;
  let fn;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:pollster');
    x = false;
    fn = () => x = true;
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
    assert.equal(job, service.findOrCreateJob(fn), 'subsequent calls return the same job');
    assert.false(x, 'job did not execute yet');
    job.run();
    assert.true(x, 'job executed');
  });
});
