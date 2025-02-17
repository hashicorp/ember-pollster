/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MIT
 */

import { assert } from '@ember/debug';
import { isTesting } from '@ember/debug/lib/testing';
import { run } from '@ember/runloop';

/**
 * A job is a wrapper around a vanilla function `fn` which executes `fn` every
 * `frequency` milliseconds within an Ember runloop.  Jobs may be started and
 * stopped, as well as executed on a one-off basis.
 *
 * Jobs are designed for straightforward, deterministic testing.  When Ember is
 * in a test environment, jobs may enter into a running state but are not
 * automatically executed or scheduled.  Instead, jobs must be executed
 * explicitly using `job.run()` or (more commonly) via the pollster service.
 * The trade-off is that test cases relying on job behavior must plan for and
 * execute jobs as needed.
 *
 * @module ember-pollster/utilities/job
 */
class Job {
  // =properties

  /**
   * The wrapped function.
   * @type {function}
   */
  fn;

  /**
   * Frequency in milliseconds to execute `fn`.
   * @type {number}
   */
  frequency;

  /**
   * @private
   * @type {boolean}
   */
  #running = false;

  /**
   * @private
   * @type {?number}
   */
  #timeoutId;

  /**
   * @type {boolean}
   */
  get isTesting() {
    return isTesting();
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isRunning() {
    return this.#running;
  }

  // =methods

  constructor(fn, frequency) {
    assert('`fn` is required.', fn);
    assert('`frequency` in milliseconds is required.', frequency);
    this.fn = fn;
    this.frequency = frequency;
  }

  /**
   * Starts the job and schedules the next run.  In Ember testing mode, runs
   * are not scheduled and must be executed manually.
   */
  start() {
    if (!this.#running) {
      this.#running = true;
      if (!this.isTesting) this.#queueNext();
    }
  }

  /**
   * Stops the job and cancels any pending run.
   */
  stop() {
    clearTimeout(this.#timeoutId);
    this.#running = false;
  }

  /**
   * Executes `fn` within an Ember runloop.
   * @return The result of calling `fn`.
   */
  run() {
    return run(this.fn);
  }

  /**
   * Schedules the next execution of `fn` (if in a running state) after
   * `frequency` milliseconds;
   * @private
   */
  #queueNext() {
    this.#timeoutId = setTimeout(() => {
      if (this.#running) {
        this.run();
        this.#queueNext();
      }
    }, this.frequency);
  }
}

export default Job;
