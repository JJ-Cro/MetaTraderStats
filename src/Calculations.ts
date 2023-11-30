import { JSONHistory, MT4, MainObjectType, OrderMT4, OrderMT5 } from './MTtoJSON';
import * as math from 'mathjs';

export function calculateTotalProfitOnlyClosed(JSON: JSONHistory, timestamp: number = 0): number {
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

export function calculateMonthlyGainsABS(orders: JSONHistory): { [key: string]: number } {
  const monthlyGains: { [key: string]: number } = {};

  orders.forEach((order) => {
    if (
      (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
      (order.Platform === 'MT5' && order.Type === 'ORDER')
    ) {
      // Convert the order's timestamp to a Date object
      const date = new Date(order.Time * 1000);

      // Format the date as 'MonthYear', e.g. 'August22'
      const monthYear = date.toLocaleString('en-US', { month: 'long' }) + date.getFullYear().toString().slice(-2);

      // If this monthYear hasn't been seen before, initialize it with 0
      if (!monthlyGains[monthYear]) {
        monthlyGains[monthYear] = 0;
      }

      // Add the order's profit to the total for this monthYear
      monthlyGains[monthYear] += order.Profit + order.Swap + order.Commission;
    }
  });
  // Convert all values to two decimal places
  for (const monthYear in monthlyGains) {
    monthlyGains[monthYear] = +monthlyGains[monthYear].toFixed(2);
  }
  return monthlyGains;
}

export function calculateMonthlyGainsPCT(orders: JSONHistory): { [key: string]: number } {
  const monthlyGains: { [key: string]: number } = {};
  const monthlyStartingBalances: { [key: string]: number } = {};

  orders.forEach((order) => {
    if (
      (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
      (order.Platform === 'MT5' && order.Type === 'ORDER')
    ) {
      // Convert the order's timestamp to a Date object
      const date = new Date(order.Time * 1000);

      // Format the date as 'MonthYear', e.g. 'August22'
      const monthYear = date.toLocaleString('en-US', { month: 'long' }) + date.getFullYear().toString().slice(-2);

      // If this monthYear hasn't been seen before, initialize it with 0
      if (!monthlyGains[monthYear]) {
        monthlyGains[monthYear] = 0;
        monthlyStartingBalances[monthYear] = order.Balance;
      }

      // Add the order's profit to the total for this monthYear
      monthlyGains[monthYear] += order.Profit + order.Swap + order.Commission;
    }
  });

  // Convert all values to percentage gain
  for (const monthYear in monthlyGains) {
    const gain = monthlyGains[monthYear];
    const startingBalance = monthlyStartingBalances[monthYear];
    const percentageGain = (gain / startingBalance) * 100;
    monthlyGains[monthYear] = +percentageGain.toFixed(2);
  }

  return monthlyGains;
}

export function calculateWeeklyGainsABS(orders: JSONHistory): { [key: string]: number } {
  const weeklyGains: { [key: string]: number } = {};

  orders.forEach((order) => {
    if (
      (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
      (order.Platform === 'MT5' && order.Type === 'ORDER')
    ) {
      // Convert the order's timestamp to a Date object
      const date = new Date(order.Time * 1000);

      // Format the date as 'WeekYear', e.g. 'Week32-22'
      const weekYear = 'Week' + getWeek(date) + '-' + date.getFullYear().toString().slice(-2);

      // If this weekYear hasn't been seen before, initialize it with 0
      if (!weeklyGains[weekYear]) {
        weeklyGains[weekYear] = 0;
      }

      // Add the order's profit to the total for this weekYear
      weeklyGains[weekYear] += order.Profit + order.Swap + order.Commission;
    }
  });

  // Convert all values to two decimal places
  for (const weekYear in weeklyGains) {
    weeklyGains[weekYear] = +weeklyGains[weekYear].toFixed(2);
  }

  return weeklyGains;
}

export function calculateWeeklyGainsPCT(orders: JSONHistory): { [key: string]: number } {
  const weeklyGains: { [key: string]: number } = {};
  const weeklyStartingBalances: { [key: string]: number } = {};

  orders.forEach((order) => {
    if (
      (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
      (order.Platform === 'MT5' && order.Type === 'ORDER')
    ) {
      // Convert the order's timestamp to a Date object
      const date = new Date(order.Time * 1000);

      // Format the date as 'WeekYear', e.g. 'Week32-22'
      const weekYear = 'Week' + getWeek(date) + '-' + date.getFullYear().toString().slice(-2);

      // If this weekYear hasn't been seen before, initialize it with 0
      if (!weeklyGains[weekYear]) {
        weeklyGains[weekYear] = 0;
        weeklyStartingBalances[weekYear] = order.Balance;
      }

      // Add the order's profit to the total for this weekYear
      weeklyGains[weekYear] += order.Profit + order.Swap + order.Commission;
    }
  });

  // Convert all values to percentage gain
  for (const weekYear in weeklyGains) {
    const gain = weeklyGains[weekYear];
    const startingBalance = weeklyStartingBalances[weekYear];
    const percentageGain = (gain / startingBalance) * 100;
    weeklyGains[weekYear] = +percentageGain.toFixed(2);
  }

  return weeklyGains;
}

export function calculateDailyGainsABS(orders: JSONHistory): { [key: string]: { profit: number; balance: number } } {
  const dailyGains: { [key: string]: { profit: number; balance: number } } = {};

  orders.forEach((order) => {
    if (
      (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
      (order.Platform === 'MT5' && order.Type === 'ORDER')
    ) {
      // Convert the order's timestamp to a Date object
      const date = new Date(order.Time * 1000);

      // Format the date as 'DD-MM-YYYY'
      const dayMonthYear =
        date.getDate().toString().padStart(2, '0') +
        '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        date.getFullYear();

      // If this dayMonthYear hasn't been seen before, initialize it with 0
      if (!dailyGains[dayMonthYear]) {
        dailyGains[dayMonthYear] = { profit: 0, balance: 0 };
      }

      // Add the order's profit to the total for this dayMonthYear
      dailyGains[dayMonthYear].profit += order.Profit + order.Swap + order.Commission;

      // Update the balance if it exists in the order
      if ('Balance' in order) {
        dailyGains[dayMonthYear].balance = order.Balance;
      }
    }
  });

  // Convert all profit values to two decimal places
  for (const dayMonthYear in dailyGains) {
    dailyGains[dayMonthYear].profit = +dailyGains[dayMonthYear].profit.toFixed(2);
  }

  return dailyGains;
}

// Helper function to get the week number
function getWeek(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
export function calculateDrawdown(orders: JSONHistory): { maxDrawdownDollars: number } {
  try {
    let highestBalance = 0;
    let drawdownDollars = 0;
    let drawdownPercent = 0;
    let totalPNL = 0;
    let highestPNL = 0;
    let lastBalance = 0;

    orders.forEach((order) => {
      if (highestBalance === 0 && 'Balance' in order) {
        highestBalance = order.Balance;
      }
      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        totalPNL = totalPNL + order.Profit + order.Swap + order.Commission;

        if (totalPNL > highestPNL) {
          highestPNL = totalPNL;
          highestBalance = order.Balance;
        }
      }

      const currentDrawdownDollars = Math.abs(highestPNL - totalPNL);
      if (currentDrawdownDollars > drawdownDollars) {
        drawdownDollars = currentDrawdownDollars;
      }

      if ((currentDrawdownDollars / highestBalance) * 100 > drawdownPercent) {
        drawdownPercent = (currentDrawdownDollars / highestBalance) * 100;
        // console.log(drawdownPercent, currentDrawdownDollars, lastBalance);
      }

      if ('Balance' in order) {
        lastBalance = order.Balance;
      }
    });

    return { maxDrawdownDollars: +drawdownDollars.toFixed(2) };
  } catch (err) {
    console.error(err);
    throw new Error(`calculateNewDrawdown()`);
  }
}

export function calculateTotalDepositsAndWithdrawals(orders: JSONHistory): {
  totalDeposits: number;
  totalWithdrawals: number;
} {
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  orders.forEach((order) => {
    if (order.Platform === 'MT5' && order.Type === 'BALANCECHANGE') {
      if (order.Amount > 0) {
        totalDeposits += order.Amount;
      } else {
        totalWithdrawals += order.Amount;
      }
    } else if (
      order.Platform === 'MT4' &&
      (order.Transaction_Type === 'DEPOSIT' || order.Transaction_Type === 'WITHDRAWAL')
    ) {
      if (order.Transaction_Type === 'DEPOSIT') {
        totalDeposits += order.Profit;
      } else {
        totalWithdrawals += order.Profit;
      }
    }
  });

  return { totalDeposits: +totalDeposits.toFixed(2), totalWithdrawals: +totalWithdrawals.toFixed(2) };
}

export function findOpenOrders(orders: JSONHistory): { [key: string]: object } {
  const openOrders: { [key: string]: object } = {};

  orders.forEach((order, index) => {
    if (
      (order.Platform === 'MT4' && order.Transaction_Type === 'OPEN_ORDER') ||
      (order.Platform === 'MT5' && order.Type === 'OPEN_ORDER')
    ) {
      openOrders[`Order_${index}`] = order;
    }
  });

  return openOrders;
}

export function findEarliestEvent(orders: JSONHistory): string {
  try {
    // Assume the first order is the earliest
    let earliestOrder = orders[0];

    // Iterate over the orders to find the earliest one
    orders.forEach((order) => {
      if (order.Time < earliestOrder.Time) {
        earliestOrder = order;
      }
    });

    // Convert the timestamp of the earliest order to a Date object
    const earliestDate = new Date(earliestOrder.Time * 1000);

    // Format the date as 'YYYY-MM-DD'
    const formattedDate = earliestDate.toISOString().split('T')[0];

    return formattedDate;
  } catch (err) {
    console.error(err);
    throw new Error(`findEarliestEvent()`);
  }
}

export function findLongestStreaks(orders: JSONHistory): {
  longestWinningStreak: number;
  longestLosingStreak: number;
  winningStreakAmount: number;
  losingStreakAmount: number;
} {
  try {
    let longestWinningStreak = 0;
    let longestLosingStreak = 0;
    let winningStreakAmount = 0;
    let losingStreakAmount = 0;
    let currentStreak = 0;
    let currentAmount = 0;
    let isWinningStreak = false;

    orders.forEach((order) => {
      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        const total = order.Profit + order.Swap + order.Commission;
        const isWin = total > 0;

        if (isWin !== isWinningStreak || currentStreak === 0) {
          if (currentStreak > 0) {
            if (isWinningStreak && currentStreak > longestWinningStreak) {
              longestWinningStreak = currentStreak;
              winningStreakAmount = currentAmount;
            } else if (!isWinningStreak && currentStreak > longestLosingStreak) {
              longestLosingStreak = currentStreak;
              losingStreakAmount = currentAmount;
            }
          }

          currentStreak = 1;
          currentAmount = total;
          isWinningStreak = isWin;
        } else {
          currentStreak++;
          currentAmount += total;
        }
      }
    });

    // Check the last streak
    if (isWinningStreak && currentStreak > longestWinningStreak) {
      longestWinningStreak = currentStreak;
      winningStreakAmount = currentAmount;
    } else if (!isWinningStreak && currentStreak > longestLosingStreak) {
      longestLosingStreak = currentStreak;
      losingStreakAmount = currentAmount;
    }

    return {
      longestWinningStreak: longestWinningStreak,
      winningStreakAmount: +winningStreakAmount.toFixed(2),
      longestLosingStreak: longestLosingStreak,
      losingStreakAmount: +losingStreakAmount.toFixed(2),
    };
  } catch (err) {
    console.error(err);
    throw new Error(`findLongestStreaks()`);
  }
}

export function findBiggestProfitAndLoss(orders: JSONHistory): {
  biggestProfitAbs: number;
  biggestProfitPct: number;
  biggestLossAbs: number;
  biggestLossPct: number;
} {
  try {
    let biggestProfit = 0;
    let biggestLoss = 0;
    let balanceBeforeBiggestProfit = 0;
    let balanceBeforeBiggestLoss = 0;
    let currentBalance = 0;

    orders.forEach((order) => {
      if (order.Platform === 'MT4') {
        if (order.Transaction_Type === 'ORDER') {
          const total = order.Profit + order.Swap + order.Commission;

          if (total > biggestProfit) {
            biggestProfit = total;
            balanceBeforeBiggestProfit = currentBalance;
          } else if (total < biggestLoss) {
            biggestLoss = total;
            balanceBeforeBiggestLoss = currentBalance;
          }

          // Update the current balance
          currentBalance += total;
        } else if (order.Transaction_Type === 'DEPOSIT' || order.Transaction_Type === 'WITHDRAWAL') {
          // Update the current balance for deposit or withdrawal
          currentBalance += order.Profit;
        }
      } else if (order.Platform === 'MT5') {
        if (order.Type === 'ORDER') {
          const total = order.Profit + order.Swap + order.Commission;

          if (total > biggestProfit) {
            biggestProfit = total;
            balanceBeforeBiggestProfit = currentBalance;
          } else if (total < biggestLoss) {
            biggestLoss = total;
            balanceBeforeBiggestLoss = currentBalance;
          }

          // Update the current balance
          currentBalance += total;
        } else if (order.Type === 'BALANCECHANGE') {
          // Update the current balance for balance change
          currentBalance += order.Amount;
        }
      }
    });

    const biggestProfitPct = (biggestProfit / balanceBeforeBiggestProfit) * 100;
    const biggestLossPct = (biggestLoss / balanceBeforeBiggestLoss) * 100;

    return {
      biggestProfitAbs: biggestProfit,
      biggestProfitPct: Number(biggestProfitPct.toFixed(2)),
      biggestLossAbs: biggestLoss,
      biggestLossPct: Number(biggestLossPct.toFixed(2)),
    };
  } catch (err) {
    console.error(err);
    throw new Error(`findBiggestProfitAndLoss()`);
  }
}

export function calculateWinLossPercentage(orders: JSONHistory): { winPercentage: number; lossPercentage: number } {
  try {
    let winCount = 0;
    let lossCount = 0;

    orders.forEach((order) => {
      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        const total = order.Profit + order.Swap + order.Commission;
        total > 0 ? winCount++ : lossCount++;
      }
    });

    const totalTrades = winCount + lossCount;
    const winPercentage = (winCount / totalTrades) * 100;
    const lossPercentage = (lossCount / totalTrades) * 100;

    return {
      winPercentage: Number(winPercentage.toFixed(2)),
      lossPercentage: Number(lossPercentage.toFixed(2)),
    };
  } catch (err) {
    console.error(err);
    throw new Error(`calculateWinLossPercentage()`);
  }
}

export function getPerformanceTable(orders: JSONHistory): {
  balance: number;
  equity: number;
  initialBalance: number;
  totalWithdrawalDeposit: { totalDeposits: number; totalWithdrawals: number };
  profitFactor: number;
} {
  try {
    let balance = 0;
    let unrealisedProfit = 0;
    let initialBalance = 0;
    let firstOrderFound = false;
    let totalProfit = 0;
    let totalLoss = 0;

    orders.forEach((order) => {
      if (!firstOrderFound) {
        if (
          order.Platform === 'MT4' &&
          (order.Transaction_Type === 'DEPOSIT' || order.Transaction_Type === 'WITHDRAWAL')
        ) {
          initialBalance += order.Profit;
        } else if (order.Platform === 'MT5' && order.Type === 'BALANCECHANGE') {
          initialBalance += order.Amount;
        } else if (
          (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
          (order.Platform === 'MT5' && order.Type === 'ORDER')
        ) {
          firstOrderFound = true;
        }
      }

      if ('Balance' in order) {
        balance = order.Balance;
      }

      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'OPEN_ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'OPEN_ORDER')
      ) {
        unrealisedProfit += order.Profit + order.Swap + order.Commission;
      }

      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        const total = order.Profit + order.Swap + order.Commission;

        if (total > 0) {
          totalProfit += total;
        } else {
          totalLoss += total;
        }
      }
    });

    const equity = Number((balance + unrealisedProfit).toFixed(2));
    const totalWithdrawalDeposit = calculateTotalDepositsAndWithdrawals(orders);
    const profitFactor = +Math.abs(totalProfit / totalLoss).toFixed(2);

    return {
      balance,
      equity,
      initialBalance,
      totalWithdrawalDeposit,
      profitFactor,
    };
  } catch (err) {
    console.error(err);
    throw new Error(`getPerformanceTable()`);
  }
}

export function calculateAverageWinLoss(orders: JSONHistory): {
  averageWin: number;
  averageLoss: number;
  totalProfit: number;
  totalLosses: number;
  averageWinReturnPct: number;
  averageLossReturnPct: number;
  averageTradesPerWeek: number;
  expectedPayoff: number;
} {
  try {
    let winCount = 0;
    let lossCount = 0;
    let totalProfit = 0;
    let totalLosses = 0;
    let winPercentages: number[] = [];
    let lossPercentages: number[] = [];
    let previousBalance = 0;
    let firstOrderTimestamp: number | null = null;
    let lastOrderTimestamp: number | null = null;

    orders.forEach((order) => {
      if ('Balance' in order) {
        previousBalance = order.Balance;
      }

      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        const total = order.Profit + order.Swap + order.Commission;
        const percentage = (total / previousBalance) * 100;

        if (total > 0) {
          winCount++;
          totalProfit += total;
          winPercentages.push(percentage);
        } else if (total < 0) {
          lossCount++;
          totalLosses += total;
          lossPercentages.push(percentage);
        }

        if (firstOrderTimestamp === null) {
          firstOrderTimestamp = order.Time;
        }
        lastOrderTimestamp = order.Time;
      }
    });

    const averageWin = totalProfit / winCount;
    const averageLoss = totalLosses / lossCount;
    const averageWinPercentage = winPercentages.reduce((a, b) => a + b, 0) / winPercentages.length;
    const averageLossPercentage = lossPercentages.reduce((a, b) => a + b, 0) / lossPercentages.length;

    const totalTrades = winCount + lossCount;
    const expectedPayoff = totalProfit / totalTrades;

    const weeks = (lastOrderTimestamp! - firstOrderTimestamp!) / (60 * 60 * 24 * 7);
    const tradesPerWeek = totalTrades / weeks;

    return {
      averageWin: Number(averageWin.toFixed(2)),
      averageLoss: Number(averageLoss.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      totalLosses: Number(totalLosses.toFixed(2)),
      averageWinReturnPct: Number(averageWinPercentage.toFixed(2)),
      averageLossReturnPct: Number(averageLossPercentage.toFixed(2)),
      averageTradesPerWeek: Number(tradesPerWeek.toFixed(2)),
      expectedPayoff: Number(expectedPayoff.toFixed(2)),
    };
  } catch (err) {
    console.error(err);
    throw new Error(`calculateAverageWinLoss()`);
  }
}
export function calculateProfitAndTradesPerSymbol(orders: JSONHistory): {
  [symbol: string]: { totalProfit: number; tradeCount: number; winCount: number; lossCount: number };
} {
  try {
    const symbolStats: {
      [symbol: string]: { totalProfit: number; tradeCount: number; winCount: number; lossCount: number };
    } = {};

    orders.forEach((order) => {
      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        const total = order.Profit + order.Swap + order.Commission;
        const symbol = order.Symbol;

        if (!(symbol in symbolStats)) {
          symbolStats[symbol] = { totalProfit: 0, tradeCount: 0, winCount: 0, lossCount: 0 };
        }

        symbolStats[symbol].totalProfit += total;
        symbolStats[symbol].tradeCount++;

        if (total > 0) {
          symbolStats[symbol].winCount++;
        } else {
          symbolStats[symbol].lossCount++;
        }
      }
    });
    for (const symbol in symbolStats) {
      symbolStats[symbol].totalProfit = Number(symbolStats[symbol].totalProfit.toFixed(2));
    }

    return symbolStats;
  } catch (err) {
    console.error(err);
    throw new Error(`calculateProfitAndTradesPerSymbol()`);
  }
}

export function calculateBuySellPercentage(orders: JSONHistory): {
  buyCount: number;
  sellCount: number;
  buyPercentage: number;
  sellPercentage: number;
} {
  try {
    let buyCount = 0;
    let sellCount = 0;

    orders.forEach((order) => {
      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        if (order.Order_Type === 'BUY' || order.Order_Type === 'ORDER_TYPE_BUY') {
          buyCount++;
        } else if (order.Order_Type === 'SELL' || order.Order_Type === 'ORDER_TYPE_SELL') {
          sellCount++;
        }
      }
    });

    const totalOrders = buyCount + sellCount;
    const buyPercentage = (buyCount / totalOrders) * 100;
    const sellPercentage = (sellCount / totalOrders) * 100;

    return {
      buyCount,
      sellCount,
      buyPercentage: Number(buyPercentage.toFixed(2)),
      sellPercentage: Number(sellPercentage.toFixed(2)),
    };
  } catch (err) {
    console.error(err);
    throw new Error(`calculateBuySellPercentage()`);
  }
}

export function calculateRecoveryFactor(orders: JSONHistory): number {
  try {
    const drawdownData = calculateDrawdown(orders);
    const avgWinLoss = calculateAverageWinLoss(orders);

    const totalProfit = avgWinLoss.totalProfit;
    const maxDrawdown = drawdownData.maxDrawdownDollars;

    const recoveryFactor = totalProfit / maxDrawdown;

    return Number(recoveryFactor.toFixed(2));
  } catch (err) {
    console.error(err);
    throw new Error(`calculateRecoveryFactor()`);
  }
}

export function calculateSharpeRatio(orders: JSONHistory): number {
  try {
    let previousBalance = 0;
    const returns: number[] = [];

    orders.forEach((order) => {
      if ('Balance' in order) {
        previousBalance = order.Balance;
      }

      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        const total = order.Profit + order.Swap + order.Commission;
        const returnForOrder = total / previousBalance;
        returns.push(returnForOrder);
      }
    });

    const meanReturn = Number(math.mean(returns));
    const stdDevReturn = Number(math.std(returns));

    const sharpeRatio = meanReturn / stdDevReturn;

    return +sharpeRatio.toFixed(2);
  } catch (err) {
    console.error(err);
    throw new Error(`calculateSharpeRatio()`);
  }
}

interface OpenOrder {
  order: OrderMT5;
  remainingVolume: number;
}
export function calculateAverageHoldingTime(orders: JSONHistory): number {
  try {
    let totalHoldingTime = 0;
    let orderCount = 0;

    const openOrders: OpenOrder[] = [];

    orders.forEach((order) => {
      if (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') {
        const mt4Order = order as OrderMT4;
        const holdingTime = mt4Order.Close_Time - mt4Order.Time;
        totalHoldingTime += holdingTime;
        orderCount++;
      } else if (order.Platform === 'MT5' && order.Type === 'ORDER') {
        const mt5Order = order as OrderMT5;

        if (mt5Order.Order_Type === 'ORDER_TYPE_BUY' || mt5Order.Order_Type === 'ORDER_TYPE_SELL') {
          openOrders.push({ order: mt5Order, remainingVolume: mt5Order.Volume });
        }

        for (const openOrder of openOrders) {
          if (
            openOrder.order.Symbol === mt5Order.Symbol &&
            openOrder.remainingVolume > 0 &&
            openOrder.order.Order_Type !== mt5Order.Order_Type
          ) {
            const volumeToClose = Math.min(openOrder.remainingVolume, mt5Order.Volume);
            const holdingTime = mt5Order.Time - openOrder.order.Time;

            totalHoldingTime += holdingTime * volumeToClose;
            orderCount += volumeToClose;

            openOrder.remainingVolume -= volumeToClose;
            if (openOrder.remainingVolume <= 0) {
              break;
            }
          }
        }
      }
    });

    const averageHoldingTime = totalHoldingTime / orderCount / 60;

    return averageHoldingTime;
  } catch (err) {
    console.error(err);
    throw new Error(`calculateAverageHoldingTime()`);
  }
}

export function calculateMonthlyGraph(orders: JSONHistory): {
  [key: string]: {
    startBalance: number;
    endBalance: number;
    monthlyPNL: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
} {
  try {
    const monthlyResults: {
      [key: string]: {
        startBalance: number;
        endBalance: number;
        monthlyPNL: number;
        totalDeposits: number;
        totalWithdrawals: number;
      };
    } = {};

    orders.forEach((order) => {
      // Convert the order's timestamp to a Date object
      const date = new Date(order.Time * 1000);

      // Format the date as 'MonthYear', e.g. 'August22'
      const monthYear = date.toLocaleString('en-US', { month: 'long' }) + date.getFullYear().toString().slice(-2);

      // Initialize the monthYear in the results if it hasn't been seen before
      if (!monthlyResults[monthYear] && 'Balance' in order) {
        monthlyResults[monthYear] = {
          startBalance: order.Balance,
          endBalance: 0,
          monthlyPNL: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
        };
      }

      // Update the end balance and monthly PNL
      if (
        (order.Platform === 'MT4' && order.Transaction_Type === 'ORDER') ||
        (order.Platform === 'MT5' && order.Type === 'ORDER')
      ) {
        monthlyResults[monthYear].endBalance = order.Balance;
        monthlyResults[monthYear].monthlyPNL += order.Profit + order.Swap + order.Commission;
      }

      // Update the total deposits and withdrawals
      if (order.Platform === 'MT4') {
        if (order.Transaction_Type === 'DEPOSIT') {
          monthlyResults[monthYear].totalDeposits += order.Profit;
        } else if (order.Transaction_Type === 'WITHDRAWAL') {
          monthlyResults[monthYear].totalWithdrawals += order.Profit;
        }
      } else if (order.Platform === 'MT5' && order.Type === 'BALANCECHANGE') {
        if (order.Amount > 0) {
          monthlyResults[monthYear].totalDeposits += order.Amount;
        } else {
          monthlyResults[monthYear].totalWithdrawals += Math.abs(order.Amount);
        }
      }
    });

    return monthlyResults;
  } catch (err) {
    console.error(err);
    throw new Error(`calculateMonthlyResults()`);
  }
}
