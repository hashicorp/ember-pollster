/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MIT
 */

import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('a', function () {
    this.route('a1');
    this.route('a2');
  });
  this.route('b');
});
