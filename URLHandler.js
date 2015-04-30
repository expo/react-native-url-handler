/*
 * Copyright 2015-present 650 Industries. All rights reserved.
 *
 * @flow
 */
'use strict';

var EventEmitter = require('EventEmitter');
var React = require('react-native');
var {
  DeviceEventEmitter,
  NativeModules: {
    NTURLHandler,
  },
} = React;

var url = require('url');

var emitter = new EventEmitter();

var URLHandler = {
  /**
   * The list of URL protocols handled by this app.
   */
  schemes: NTURLHandler.schemes,

  /**
   * The URL that opens the settings for this app. It is defined on iOS 8 and
   * up.
   */
  settingsURL: NTURLHandler.settingsURL,

  /**
   * The URL that launched this app if it was launched from a URL.
   */
  initialURL: NTURLHandler.initialURL,

  /**
   * Referrer information about the URL that launched this app if it was
   * launched from a URL.
   */
   initialReferrer: NTURLHandler.initialReferrer,

  /**
   * Opens the given URL. The URL may be an external URL or an in-app URL. URLs
   * without a host are treated as in-app URLs.
   */
  openURL(targetURL: string) {
    // Parse the query string and have "//" denote the hostname
    var components = url.parse(targetURL, false, true);
    if (components.protocol === 'xxx:') {
      emitter.emit('request', url);
    } else {
      NTURLHandler.openURL(targetURL, () => {}, (error) => {
        console.error('Error opening URL: ' + error.stack);
      });
    }
  },

  /**
   * Adds a listener that receives an object with URL information when the app
   * has been instructed to open a URL. See the Request type.
   *
   * This method returns a subscription to later remove the listener.
   */
  addListener(listener: (url: string, referrer: ?Referrer) => void) {
    return emitter.addListener('request', listener);
  },
};

DeviceEventEmitter.addListener('NTURLHandler.openURL', (event) => {
  var {url, sourceApplication, annotation} = event;
  if (sourceApplication != null) {
    var referrer = {sourceApplication, annotation};
  }
  emitter.emit('request', url, referrer);
});

type Referrer = {
  sourceApplication: string;
  annotation?: any;
};

module.exports = URLHandler;
