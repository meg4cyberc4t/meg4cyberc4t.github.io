window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};
window.gtag("js", new Date());
window.gtag("config", "G-P76YQ00W05");

(function initYandexMetrika(windowObject, documentObject, elementName, source, functionName) {
  windowObject[functionName] = windowObject[functionName] || function metrikaQueue() {
    (windowObject[functionName].a = windowObject[functionName].a || []).push(arguments);
  };
  windowObject[functionName].l = Date.now();

  for (const script of documentObject.scripts) {
    if (script.src === source) return;
  }

  const script = documentObject.createElement(elementName);
  const firstScript = documentObject.getElementsByTagName(elementName)[0];
  script.async = true;
  script.src = source;
  firstScript.parentNode.insertBefore(script, firstScript);
})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

window.ym(97046883, "init", {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
});
