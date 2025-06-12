(() => {
  const loader = document.currentScript;
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const getTheme = () => colorScheme.matches ? 'noborder_dark' : 'noborder_light';

  const giscus = document.createElement('script');
  giscus.src = 'https://giscus.app/client.js';
  giscus.async = true;
  giscus.crossOrigin = 'anonymous';

  for (const [key, value] of Object.entries(loader.dataset)) {
    giscus.dataset[key] = value;
  }

  giscus.dataset.theme = getTheme();
  loader.after(giscus);

  colorScheme.addEventListener('change', () => {
    const frame = document.querySelector('iframe.giscus-frame');
    frame?.contentWindow.postMessage({
      giscus: {
        setConfig: {
          theme: getTheme(),
        },
      },
    }, 'https://giscus.app');
  });
})();
