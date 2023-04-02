const axios = require('axios');

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const url = 'https://www.okx.com/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=4H&after=&limit=460&t=1680432564489';

fetchData(url)
  .then(data => console.log(data))
  .catch(error => console.error(error));