import { JSONHistory, MT4, MainObjectType } from './MTtoJSON';

export function calculateTotalProfitOnlyClosed(JSON: JSONHistory, timestamp: number): number {
  let totalProfit = 0;

  JSON.forEach((order) => {
    if (order.Platform === 'MT4') {
      if (order.Time * 1000 > timestamp) {
        if ('Profit' in order && order.Transaction_Type === 'ORDER') {
          totalProfit = totalProfit + order.Profit + order.Swap + order.Commission;
        }
      }
    }

    if (order.Platform === 'MT5') {
      if (order.Time * 1000 > timestamp) {
        if ('Profit' in order && order.Type === 'ORDER') {
          totalProfit = totalProfit + order.Profit + order.Swap + order.Commission;
        }
      }
    }
  });

  return Number(totalProfit.toFixed(2));
}

export function calculateTotalProfitOpenPositions(JSON: JSONHistory): number {
  let totalProfit = 0;

  JSON.forEach((order) => {
    if (order.Platform === 'MT4') {
      if ('Profit' in order && order.Transaction_Type === 'OPEN_ORDER') {
        totalProfit = totalProfit + order.Profit + order.Swap + order.Commission;
      }
    } else if (order.Platform === 'MT5')
      if ('Profit' in order && order.Type === 'OPEN_ORDER') {
        totalProfit = totalProfit + order.Profit + order.Swap + order.Commission;
      }
  });

  return Number(totalProfit.toFixed(2));
}

export function numberOfOpenPositions(JSON: JSONHistory): number {
  let number = 0;

  JSON.forEach((order) => {
    if (order.Platform === 'MT4') {
      if (order.Transaction_Type === 'OPEN_ORDER') {
        number += 1;
      }
    } else if (order.Platform === 'MT5')
      if (order.Type === 'OPEN_ORDER') {
        number += 1;
      }
  });

  return number;
}
