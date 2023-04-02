export function parseData(data) {
    return data.map(([ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]) => ({
      time: new Date(parseInt(ts)),
      open: parseFloat(o),
      high: parseFloat(h),
      low: parseFloat(l),
      close: parseFloat(c),
      volume: parseFloat(vol),
      volCcy: parseFloat(volCcy),
      volCcyQuote: parseFloat(volCcyQuote),
      confirm: parseInt(confirm),
    }));
}