import Service from '@ember/service';
import Job from '../utilities/job';

/**
 *
 */
export default class PollsterService extends Service {

  // =properties

  /**
   * Map of jobs created via the pollster service.
   * @type {array}
   */
  #jobs = new Array();

  // =methods

  /**
   * Looks up a job by function.
   * @param {function} fn
   * @return {?Job}
   */
  findJob(fn) {
    return this.#jobs[fn];
  }

  /**
   * Creates a new job instance and stores a reference to it by function.
   * @param {function} fn
   * @param {number} frequency
   * @return {Job}
   */
  createJob(fn, frequency) {
    const job = new Job(fn, frequency);
    this.#jobs[fn] = job;
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

}
