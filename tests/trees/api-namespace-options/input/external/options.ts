// No options keys are allowed for api namespaces, so this file would fail
// validation if the parser ever tried to read it
export default {
  page: { authRequired: true },
};
