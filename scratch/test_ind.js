const { init, registerIndicator } = require('./node_modules/klinecharts/dist/index.cjs');

registerIndicator({
  name: 'TEST_IND',
  calc: (dataList, indicator) => {
    indicator.myCustomData = "Hello";
    console.log("calc called, attached data");
    return dataList.map(() => ({}));
  },
  draw: (params) => {
    console.log("draw called!");
    console.log("params keys:", Object.keys(params));
    console.log("indicator.myCustomData:", params.indicator.myCustomData);
    return false;
  }
});

// Since DOM is required, we can mock it minimally or use JSDOM
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><div id="chart" style="width:500px;height:500px"></div>`);
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

try {
  const chart = init(document.getElementById('chart'));
  chart.createIndicator('TEST_IND');
  chart.applyNewData([{timestamp: 1000, open: 1, close: 2, high: 3, low: 1}]);
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
