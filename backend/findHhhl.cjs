const myData = require('../src/assets/data.json');
function getHHLL(data) {
    const hhll = [];
    let recentHigh = -Infinity;
    let recentLow = Infinity;
  
    for (let i = 0; i < data.length; i++) {
      const currentPrice = +data[i][2];
      const currentLow = +data[i][3];
  
      const previousHighs = data.slice(0, i).map(item => +item[2]);
      const previousLows = data.slice(0, i).map(item => +item[3]);
  
      const previousHigh = Math.max(...previousHighs);
      const previousLow = Math.min(...previousLows);
  
      console.log('currentPrice', currentPrice, 'previousHigh', previousHigh, 'currentLow', 'recentHigh', recentHigh, currentLow, 'previousLow')
      if (currentPrice > previousHigh && currentLow > previousLow) {
        hhll.push({ index: i, type: 'HHHL', currentPrice, previousHigh, recentHigh, currentLow, previousLow, recentLow });
        recentHigh = currentPrice;
        recentLow = currentLow;
      } else if (currentPrice < previousHigh && currentLow < previousLow) {
        hhll.push({ index: i, type: 'LHLL',  currentPrice, previousHigh, recentHigh, currentLow, previousLow, recentLow });
        recentHigh = currentPrice;
        recentLow = currentLow;
      } else if (currentPrice > recentHigh && currentLow > recentLow) {
        hhll.push({ index: i, type: 'HHHL',  currentPrice, previousHigh, recentHigh, currentLow, previousLow, recentLow });
        recentHigh = currentPrice;
        recentLow = currentLow;
      } else if (currentPrice < recentHigh && currentLow < recentLow) {
        hhll.push({ index: i, type: 'LHLL',  currentPrice, previousHigh, recentHigh, currentLow, previousLow, recentLow });
        recentHigh = currentPrice;
        recentLow = currentLow;
      }
    }
  
    return hhll;
  }
  
const points = getHHLL(myData)
console.log(points, 'testdata');