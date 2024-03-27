import "@testing-library/jest-dom"
import { fetch } from 'cross-fetch';
window.fetch = fetch;
/**
 * fix: `matchMedia` not present, legacy browsers require a polyfill
 */
window.matchMedia = window.matchMedia || function() {
    return {
        matches : false,
        addListener : function() {},
        removeListener: function() {}
    }
  }