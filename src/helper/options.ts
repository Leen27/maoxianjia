import { getColor } from '../utils/color'
import { IMPORTANT } from '../constant'
import { calculateMA } from '../utils/ma'
import { resData } from '../assets/res.js'

const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';

export const getOption = (data0: any) => ({
    title: {
      text: '比特币',
      left: 0
    },
    legend: {
      data: ['日K', 'MA5', 'MA10', 'MA20', 'MA200']
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data0.categoryData,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: '日K',
        type: 'candlestick',
        data: data0.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upBorderColor,
          borderColor0: downBorderColor
        },
        markPoint: {
          label: {
            formatter: function (param: any) {
              return param?.data?.value + '';
            }
          },
          data: [
            {
              name: 'highest value',
              type: 'max',
              valueDim: 'highest'
            },
            {
              name: 'lowest value',
              type: 'min',
              valueDim: 'lowest'
            },
            {
              name: 'average value on close',
              type: 'average',
              valueDim: 'close'
            }
          ],
        },
        markLine: {
          symbol: ['none', 'none'],
          data: [
            ...resData.supplyZones.filter((data: any) => +data.strength > IMPORTANT).map((data: any) => {
              return {
                yAxis: +data.price,
                lineStyle: {
                  color: 'blue',
                },
                data: [+data.strength, +data.price]
              }
            }),
            ...resData.demandZones.filter((data: any) => +data.strength > IMPORTANT).map((data: any) => {
                return {
                    yAxis: +data.price,
                    lineStyle: {
                    color: 'red',
                    },
                    data: [+data.strength, +data.price]
                }
            }),
            [
              {
                name: 'from lowest to highest',
                type: 'min',
                valueDim: 'lowest',
                symbol: 'circle',
                symbolSize: 10,
                label: {
                  show: false
                },
                emphasis: {
                  label: {
                    show: false
                  }
                }
              },
              {
                type: 'max',
                valueDim: 'highest',
                symbol: 'circle',
                symbolSize: 10,
                label: {
                  show: false
                },
                emphasis: {
                  label: {
                    show: false
                  }
                }
              }
            ],
            {
              name: 'min line on close',
              type: 'min',
              valueDim: 'close'
            },
            {
              name: 'max line on close',
              type: 'max',
              valueDim: 'close'
            }
          ]
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: calculateMA(data0, 5),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: calculateMA(data0, 10),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: calculateMA(data0, 20),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA200',
        type: 'line',
        data: calculateMA(data0, 200),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
    ]
  });