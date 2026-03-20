module.exports = (async () => {
  const esmModule = await import('./index.mjs');
  return esmModule.PDFExtract;
})();
