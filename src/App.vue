<template>
  <div id="container">
    <canvas id="chart" ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
/**
 * 数据格式
  [ts,o,h,l,c,vol,volCcy,volCcyQuote,confirm]
  每个数据的意思为下面的表格：

  参数名	类型	描述
  ts	String	开始时间，Unix时间戳的毫秒数格式，如 1597026383085
  o	String	开盘价格
  h	String	最高价格
  l	String	最低价格
  c	String	收盘价格
  vol	String	交易量，以张为单位
  如果是衍生品合约，数值为合约的张数。
  如果是币币/币币杠杆，数值为交易货币的数量。
  volCcy	String	交易量，以币为单位
  如果是衍生品合约，数值为交易货币的数量。
  如果是币币/币币杠杆，数值为计价货币的数量。
  volCcyQuote	String	交易量，以计价货币为单位
  如：BTC-USDT 和 BTC-USDT-SWAP, 单位均是 USDT；
  BTC-USD-SWAP 单位是 USD
  confirm	String	K线状态
  0 代表 K 线未完结，1 代表 K 线已完结。
 */
import mdata from './assets/data.json'
import * as echarts from 'echarts';
import { formatDate } from './utils/date'
import { getOption } from './helper/options'
const chartRef = ref(null)

function splitData(rawData) {
  const categoryData = [];
  const values = [];
  for (var i = 0; i < rawData.length; i++) {
    categoryData.push(formatDate(rawData[i].splice(0, 1)[0]));
    values.push([
      rawData[i][0], // o
      rawData[i][3], // c
      rawData[i][2], // l,
      rawData[i][1], // h
    ]);
  }
  return {
    categoryData: categoryData,
    values: values
  };
}

onMounted(() => {
  var myChart = echarts.init(chartRef.value, null, {
    width: 1400,
    height: 600
  });

  // Each item: open，close，lowest，highest
  const data0 = splitData(mdata.reverse());
  var option = getOption(data0);


option && myChart.setOption(option);
window.addEventListener('resize', function() {
    myChart.resize();
  });
});

</script>
<style>
#container {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100vh;
  background-color: white;
}
/* #chart {
  width: 1600px;
} */
</style>
