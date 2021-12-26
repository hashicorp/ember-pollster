import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

// These tests rely on a polling route `/a`.  Whenever the model hook of this
// route is executed, a counter is incremented.  The polling function refreshes
// the route (thereby executing the model hook) as a real-world polling function
// might do.  The model value is output to the DOM, allowing this acceptance
// test to validate that pollster jobs can be run from tests in an explicit and
// deterministic manner.

module('Acceptance | route polling', function (hooks) {
  setupApplicationTest(hooks);

  let service;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:pollster');
  });

  test('visiting index', async function (assert) {
    assert.expect(2);
    await visit('/');
    assert.strictEqual(currentURL(), '/');
    assert.false(service.hasRunningJobs);
  });

  test('visiting polling route', async function (assert) {
    assert.expect(3);
    await visit('/a');
    assert.strictEqual(currentURL(), '/a');
    assert.true(service.hasRunningJobs);
    assert.strictEqual(
      find('.model-value').textContent.trim(''),
      '0',
      'Polling function was not executed'
    );
  });

  test('visiting polling route and explicitly executing jobs', async function (assert) {
    assert.expect(5);
    await visit('/a');
    assert.strictEqual(currentURL(), '/a');
    assert.true(service.hasRunningJobs);
    assert.strictEqual(
      find('.model-value').textContent.trim(''),
      '0',
      'Polling function was not executed'
    );
    await service.runAll();
    assert.strictEqual(
      find('.model-value').textContent.trim(''),
      '1',
      'Polling function executed'
    );
    await service.runAll();
    assert.strictEqual(
      find('.model-value').textContent.trim(''),
      '2',
      'Polling function executed'
    );
  });

  test('visiting subroutes of polling route and explicitly executing jobs', async function (assert) {
    assert.expect(5);
    await visit('/a');
    await visit('/a/a1');
    await visit('/a/a2');
    await visit('/a');
    assert.strictEqual(currentURL(), '/a');
    assert.true(service.hasRunningJobs);
    assert.strictEqual(
      find('.model-value').textContent.trim(''),
      '0',
      'Polling function was not executed'
    );
    await service.runAll();
    assert.strictEqual(
      find('.model-value').textContent.trim(''),
      '1',
      'Polling function executed'
    );
    await service.runAll();
    assert.strictEqual(
      find('.model-value').textContent.trim(''),
      '2',
      'Polling function executed'
    );
  });

  test('visiting polling route and navigating away stops all jobs', async function (assert) {
    assert.expect(3);
    await visit('/a');
    assert.strictEqual(currentURL(), '/a');
    assert.true(service.hasRunningJobs);
    await visit('/b');
    assert.false(service.hasRunningJobs);
  });
});
