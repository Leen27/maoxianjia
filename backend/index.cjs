const { RSI, VWAP, SMA } = require('technicalindicators');
const myData = require('../src/assets/data.json');

function calculateFibonacciLevels(prices) {
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const diff = maxPrice - minPrice;
  const levels = [
    maxPrice - 0.236 * diff, // 0
    maxPrice - 0.382 * diff, // 1
    maxPrice - 0.5 * diff, // 2
    maxPrice - 0.618 * diff, // 3
    maxPrice - 0.786 * diff // 4
  ];
  return levels;
}

function findExtrema(prices) {
    const maxima = [];
    const minima = [];
  
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        maxima.push(i);
      } else if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        minima.push(i);
      }
    }
  
    return { maxima: maxima.map(index => prices[index]), minima: minima.map(index => prices[index]) };
}
async function calculateStrength({
  price,
  timestamp,
  isSupply,
  rsi,
  vwap,
  minPrice,
  maxPrice,
  fibonacciLevels
}) {
  const currentTime = new Date().getTime();
  const timeElapsed = currentTime - timestamp;
  const timeDecayFactor = Math.exp(-timeElapsed / (1000 * 60 * 60 * 24 * 30)); // 假设一个月的衰减

  const baseStrength = isSupply
    ? (price - minPrice) / (maxPrice - minPrice)
    : (maxPrice - price) / (maxPrice - minPrice);
  
  // 当价格在斐波那契回调 0.62 - 0.786 附近时，将斐波那契回调作为强度的计算因素
  let fibStrength = 1;
  const fib236 = fibonacciLevels[0];
  const fib382 = fibonacciLevels[1];
  const fib618 = fibonacciLevels[3];
  const fib786 = fibonacciLevels[4];

  console.log(price, fib236,fib382, fib618, fib786)

  if (price >= fib786 && price <= fib618) {
    fibStrength = 1 + Math.abs((price - fib786)) / Math.abs((fib618 - fib786));
  } else if (price >= fib382 && price <= fib236) {
    fibStrength = 1 + Math.abs((price - fib382)) / Math.abs((fib236 - fib382));
  }
  
  // 计算综合强度
  let strength = baseStrength * timeDecayFactor * (rsi / 100) * (price / vwap) * fibStrength;
  
  console.log(price, fib618, fib786, (price - fib618),  (fib786 - fib618),  fibStrength, 'strength')

  return strength;
}

async function findSupplyDemandZones(data) {
  const prices = data.map(item => item[4]);
  const timestamps = data.map(item => item[0]);
  const { maxima, minima } = findExtrema(prices);
  const ohlcv = data.map(item => ({
    open: +item[1],
    high: +item[2],
    low: +item[3],
    close: +item[4],
    volume: +item[7]
  }));

  // 计算 RSI
  const rsiPeriod = 14;
  const rsiInput = {
    values: ohlcv.map(item => item.close),
    period: rsiPeriod
  };
  const rsiValues = RSI.calculate(rsiInput);

  // 计算 VWAP
  const vwapInput = {
    high: ohlcv.map(item => item.high),
    low: ohlcv.map(item => item.low),
    close: ohlcv.map(item => item.close),
    volume: ohlcv.map(item => item.volume)
  };
  const vwapValues = VWAP.calculate(vwapInput);

  // 判断是否突破了 MA200
  const ma200Input = {
    values: ohlcv.map(item => item.close),
    period: 200
  };

  const ma200Values = SMA.calculate(ma200Input);

  const minPrice = Math.min(...ohlcv.map(d => +d.close));
  const maxPrice = Math.max(...ohlcv.map(d => +d.close));

  // 计算斐波那契回调值
  const fibonacciLevels = calculateFibonacciLevels(prices);

  const supplyZonesRaw = await Promise.all(
    maxima.map(async (price, index) => {  
      const timestamp = timestamps[index];
      const strength = await calculateStrength({
        price: +price,
        timestamp,
        isSupply: true,
        rsi: rsiValues[index],
        vwap: vwapValues[index],
        minPrice,
        maxPrice,
        fibonacciLevels
      });
      return {
        price: +price,
        timestamp,
        strength
      };
    })
  );
  const supplyZones = supplyZonesRaw.sort((a, b) => b.strength - a.strength);

  const demandZonesRaw = await Promise.all(
    minima.map(async (price, index) => {
      const timestamp = timestamps[index];
      const strength = await calculateStrength({
        price: +price,
        timestamp,
        isSupply: true,
        rsi: rsiValues[index],
        vwap: vwapValues[index],
        minPrice,
        maxPrice,
        fibonacciLevels
      });
      return {
        price,
        timestamp,
        strength,
      };
    })
  );
  const demandZones = demandZonesRaw.sort((a, b) => b.strength - a.strength);

  // 扩展部分
  const SUPPLY_THRESHOLD = 0.1; // 假设当前价格距离 supply zone 不超过 10%
  const DEMAND_THRESHOLD = 0.1; // 假设当前价格距离 demand zone 不超过 10%
  const SUPPLY_INCREMENT = 0.1; // 每次触及增加的 strength
  const DEMAND_INCREMENT = 0.1; // 每次触及增加的 strength

  const supplyZonePrices = supplyZones.map(zone => zone.price);
  const demandZonePrices = demandZones.map(zone => zone.price);

  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    const previousPrice = prices[i - 1];
    const delta = Math.abs(currentPrice - previousPrice);
    const distanceToSupplyZone = Math.min(...supplyZonePrices.map(price => Math.abs(currentPrice - price)));
    const distanceToDemandZone = Math.min(...demandZonePrices.map(price => Math.abs(currentPrice - price)));

    if (distanceToSupplyZone <= currentPrice * SUPPLY_THRESHOLD) {
      // 当前价格接近某个 supply zone
      supplyZones.forEach(zone => {
        if (Math.abs(currentPrice - zone.price) <= delta * SUPPLY_THRESHOLD) {
          zone.strength += SUPPLY_INCREMENT;
        }
      });
    }

    if (distanceToDemandZone <= currentPrice * DEMAND_THRESHOLD) {
      // 当前价格接近某个 demand zone
      demandZones.forEach(zone => {
        if (Math.abs(currentPrice - zone.price) <= delta * DEMAND_THRESHOLD) {
          zone.strength += DEMAND_INCREMENT;
        }
      });
    }
  }
  
  return { supplyZones, demandZones };
}


const res = findSupplyDemandZones(myData)

res.then((r) => {
  const fs = require("fs");
  
  const content = `export const resData = ${JSON.stringify(r, null, 2)};`;
  
  fs.writeFile("./src/assets/res.js", content, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("Data successfully written to data.js");
    }
  });
})
