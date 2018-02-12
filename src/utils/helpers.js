/* ========================================================================
 * @author: Steven Jackson
 * ======================================================================== */
/* eslint-disable */
import PropTypes from 'prop-types';
var areIntlLocalesSupported = require('intl-locales-supported');
 
var localesMyAppSupports = [
    /* list locales here */
];
 
if (global.Intl) {
    // Determine if the built-in `Intl` has the locale data we need. 
    if (!areIntlLocalesSupported(localesMyAppSupports)) {
        // `Intl` exists, but it doesn't have the data we need, so load the 
        // polyfill and patch the constructors we need with the polyfill's. 
        var IntlPolyfill    = require('intl');
        Intl.NumberFormat   = IntlPolyfill.NumberFormat;
        Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
    }
} else {
    // No `Intl`, so use and load the polyfill. 
    global.Intl = require('intl');
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function clientTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function uID() {
  return `${s4() + s4()}-${s4()}-4${s4().substr(
    0,
    3,
  )}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function isUsable(value) {
  if (typeof value !== 'undefined' && value !== null) {
    if (typeof value === 'string') {
      return /\S/.test(value);
    }
    return true;
  }
  return false;
}

export function dataExists(obj) {
  return typeof obj !== 'undefined' && obj !== null;
}

export function isLeftClickEvent(event) {
  return event.button === 0;
}

export function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function compileClass(fn) {
  return (...args) => {
    const last = args[args.length - 1];
    if (typeof last === 'function') {
      return fn(...args);
    }
    return Component => fn(...args, Component);
  };
}

export function prefix(props, variant) {
  return props.customClass + (variant ? `-${variant}` : '');
}

export const customClass = compileClass((defaultClass, Component) => {
  const propTypes = Component.propTypes || (Component.propTypes = {});
  const defaultProps = Component.defaultProps || (Component.defaultProps = {});

  propTypes.customClass = PropTypes.string;
  defaultProps.customClass = defaultClass;

  return Component;
});

export const _compileClass = compileClass;

export function createChainedFunction(...funcs) {
  return funcs.filter(f => f != null).reduce((acc, f) => {
    if (typeof f !== 'function') {
      throw new Error(
        'Invalid Argument Type, must only provide functions, undefined, or null.',
      );
    }

    if (acc === null) {
      return f;
    }

    return function chainedFunction(...args) {
      acc.apply(this, args);
      f.apply(this, args);
    };
  }, null);
}
