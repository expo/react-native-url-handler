/**
 * @flow
 */
'use strict';

let EventEmitter = require('eventemitter3');
let React = require('react-native');
let {
  DeviceEventEmitter,
  NativeModules: {
    EXURLHandler,
  },
} = React;

let url = require('url');

let emitter = new EventEmitter();

let UrlHandler = {
  /**
   * The list of URL protocols handled by this app.
   */
  schemes: EXURLHandler.schemes,

  /**
   * The URL that opens the settings for this app. It is defined on iOS 8 and
   * up.
   */
  settingsUrl: EXURLHandler.settingsURL,

  /**
   * The URL that launched this app if it was launched from a URL.
   */
  initialUrl: EXURLHandler.initialURL,

  /**
   * Referrer information about the URL that launched this app if it was
   * launched from a URL.
   */
  initialReferrer: EXURLHandler.initialReferrer,

  /**
   * Opens the given URL. The URL may be an external URL or an in-app URL. URLs
   * without a host are treated as in-app URLs.
   */
  openUrl(targetUrl: string) {
    if (this.isInternalUrl(targetUrl)) {
      emitter.emit('url', { url: targetUrl });
    } else {
      EXURLHandler.openURLAsync(targetUrl).catch(error => {
        console.error('Error opening URL: ' + error.message);
      });
    }
  },

  /**
   * Returns whether the OS can open the given URL. This method returns false if
   * no app on the device can open the provided URL.
   */
  canOpenUrlAsync(targetUrl: string) {
    if (this.isInternalUrl(targetUrl)) {
      return Promise.resolve(true);
    }
    return EXURLHandler.canOpenURLAsync(targetUrl);
  },

  /**
   * Returns whether the given URL is an in-app URL or an external URL.
   */
  isInternalUrl(targetUrl: string): bool {
    // Parse the query string and have "//" denote the hostname
    let { protocol } = url.parse(targetUrl, false, true);
    if (!protocol) {
      return true;
    }
    return false; // TODO: Come up with a better way to handle this.
    // We want a message passing channel between different instances of the JavaScript
    // The problem here is that an event is fired within the inner Frame, but the browser
    // can't repond to events fired within the frame in JavaScript
    // let scheme = protocol.substring(0, protocol.length - 1);
    // return this.schemes.indexOf(scheme) !== -1;
  },

  /**
   * Adds a listener for the specified event. Supported events are:
   *
   * url: the app has been instructed to open a URL
   *   Event:
   *     url: string
   *     referrer?: Referrer
   */
  addEventListener(type: string, listener: Function) {
    emitter.addListener(type, listener);
  },

  /**
   * Removes a listener for the specified event.
   */
  removeEventListener(type: string, listener: Function) {
    emitter.removeListener(type, listener);
  },
};

DeviceEventEmitter.addListener('EXURLHandler.openURL', (event) => {
  let { url, sourceApplication, annotation } = event;
  if (sourceApplication != null) {
    var referrer: Referrer = { sourceApplication, annotation };
  }
  emitter.emit('url', { url, referrer });
});

type Referrer = {
  sourceApplication: string;
  annotation?: any;
};

module.exports = UrlHandler;
