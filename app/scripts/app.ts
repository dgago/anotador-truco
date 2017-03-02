"use strict";

/**
 * isLocalhost
 */
let isLocalhost = Boolean(window.location.hostname === "localhost"
  || window.location.hostname === "[::1]"
  || window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));

/**
 * Service worker
 */
if ("serviceWorker" in navigator && (window.location.protocol === "https:" || isLocalhost)) {
  let sw = (navigator as any).serviceWorker;
  sw.register("service-worker.js")
    .then((registration) => {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = () => {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (sw.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          let installingWorker = registration.installing;

          installingWorker.onstatechange = () => {
            switch (installingWorker.state) {
              case "installed":
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case "redundant":
                throw new Error("The installing service worker became redundant.");

              default:
              // Ignore
            }
          };
        }
      };
    }).catch((e) => {
      console.error("Error during service worker registration:", e);
    });
}

/**
 * App
 */
let angular = (window as any).angular;
let ngapp = angular.module("app", ["ngMaterial", "pascalprecht.translate"]);

let userLang = navigator.language || (navigator as any).userLanguage;
let lang = userLang.split("-")[0];

ngapp.value("Settings", { language: lang });

ngapp.config(["$mdThemingProvider", "$translateProvider", ($thp, $trp) => {
  $thp.theme("default")
    .primaryPalette("grey", { default: "50" })
    .accentPalette("indigo")
    .warnPalette("amber")
    .backgroundPalette("grey", { default: "50" });

  $trp.translations("en", {
    COPYRIGHT: "© Copyright 2017 One Feature",
  });

  $trp.translations("es", {
    COPYRIGHT: "© Copyright 2017 One Feature. Todos los derechos reservados.",
  });

  $trp.preferredLanguage(lang);
}]);
