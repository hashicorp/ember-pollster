import { getContext, settled } from '@ember/test-helpers';

const POLLSTER_SERVICE_KEY = 'service:pollster';

/**
 * Executes all pollster jobs currently in a running state.
 * @public
 */
export async function runAllJobs() {
  const { owner } = getContext();
  const pollster = owner.lookup(POLLSTER_SERVICE_KEY);
  await pollster.runAll();
  return settled();
}

/**
 * Returns `true` if ember-pollster has jobs in a running state.
 * @public
 * @return {boolean}
 */
export function hasRunningJobs() {
  const { owner } = getContext();
  const pollster = owner.lookup(POLLSTER_SERVICE_KEY);
  return pollster.hasRunningJobs;
}
