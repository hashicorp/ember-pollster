/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MIT
 */

import Route from '@ember/routing/route';
import runEvery from 'ember-pollster/decorators/route/run-every';

export default class ARoute extends Route {
  counter = 0;

  model() {
    return this.counter++;
  }

  @runEvery(1000)
  poller() {
    this.refresh();
  }
}
