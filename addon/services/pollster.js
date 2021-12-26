import Service from '@ember/service';
import Job from '../utilities/job';
import { all } from 'rsvp';

/**
 * Use pollster to manage jobs (sync or async functions that execute on a
 * recurring schedule) in your Ember application.  Pollster jobs are designed
 * for deterministic testing, making them an ideal replacement for DIY polling
 * and ember-concurrency tasks.
 */
export default class PollsterService extends Service {
  // =properties

  /**
   * Map of jobs created via the pollster service.
   * @private
   * @type {Map}
   */
  #jobs = new Map();

  /**
   * @readonly
   * @type {Job[]}
   */
  get runningJobs() {
    const runningJobs = [];
    this.#jobs.forEach((job) => {
      if (job.isRunning) runningJobs.push(job);
    });
    return runningJobs;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get hasRunningJobs() {
    return !!this.runningJobs.length;
  }

  // =methods

  /**
   * Looks up a job by function.
   * @param {function} fn
   * @return {?Job}
   */
  findJob(fn) {
    return this.#jobs.get(fn);
  }

  /**
   * Creates a new job instance and stores a reference to it by function.
   * @param {function} fn
   * @param {number} frequency
   * @return {Job}
   */
  createJob(fn, frequency) {
    const job = new Job(fn, frequency);
    this.#jobs.set(fn, job);
    return job;
  }

  /**
   * Returns an existing job instance corresponding to the passed function.
   * Or, if an associated job does not exist, creates one.
   * @param {function} fn
   * @param {number} frequency
   * @return {Job}
   */
  findOrCreateJob(fn, frequency) {
    return this.findJob(fn) || this.createJob(fn, frequency);
  }

  /**
   * Explicitly executes any jobs in a running state, collecting them into
   * a single awaitable promise.
   * @return {Promise}
   */
  runAll() {
    const jobRuns = this.runningJobs.map((job) => job.run());
    return all(jobRuns);
  }
}
