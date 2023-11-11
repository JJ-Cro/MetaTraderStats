import { JSONHistory, MT4, MainObjectType } from './MTtoJSON';

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

// Helper function to get the week number
function getWeek(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
export function calculateDrawdown(orders: JSONHistory): { maxDrawdownDollars: number; maxDrawdownPercent: number } {
  let highestBalance = 0;
  let drawdownDollars = 0;
  let drawdownPercent = 0;

  orders.forEach((order) => {
    if ('Balance' in order) {
      if (order.Balance > highestBalance) {
        highestBalance = order.Balance;
        return;
      }

      const currentDrawdownDollars = highestBalance - order.Balance;
      if (currentDrawdownDollars > drawdownDollars) {
        drawdownDollars = currentDrawdownDollars;
      }

      if (currentDrawdownDollars / highestBalance > drawdownPercent) {
        drawdownPercent = (drawdownDollars / highestBalance) * 100; // 1 - ovo
      }
    }
  });

  return { maxDrawdownDollars: +drawdownDollars.toFixed(2), maxDrawdownPercent: +drawdownPercent.toFixed(2) };
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
