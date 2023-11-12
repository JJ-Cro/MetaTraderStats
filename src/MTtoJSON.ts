/* things to do: 
add timestamp for custom date - In EA
drawdown data, and performance matrix here yet
fix all % calculations 


So I need to:

- add metrics that are missing ( Average holding time and annual forecast)

- add licencing
 */

import fs from 'fs';
import path from 'path';
import * as calcs from './Calculations';

export interface OrderMT5 {
  Platform: 'MT5';
  Type: 'ORDER';
  Order_ID: number;
  Symbol: string;
  Volume: number;
  Time: number;
  Order_Type: 'ORDER_TYPE_BUY' | 'ORDER_TYPE_SELL';
  Open_Price: number;
  Current_Price: number;
  Profit: number;
  Swap: number;
  Commission: number;
  Balance: number;
}
export interface OpenOrderMT5 {
  Platform: 'MT5';
  Type: 'OPEN_ORDER';
  Time: number;
  Symbol: string;
  Volume: number;
  Order_Type: 'ORDER_TYPE_BUY' | 'ORDER_TYPE_SELL';
  Open_Price: number;
  Current_Price: number;
  Profit: number;
  Swap: number;
  Commission: number;
}
export interface BalanceChangeMT5 {
  Platform: 'MT5';
  Type: 'BALANCECHANGE';
  Order_ID: 0;
  Time: number;
  Amount: number;
  Balance: number;
}
export interface OrderMT4 {
  Platform: 'MT4';
  Transaction_Type: 'ORDER' | 'OPEN_ORDER' | 'WITHDRAWAL' | 'DEPOSIT';
  Type: string;
  Order_ID: number;
  Symbol: string;
  Volume: number;
  Time: number;
  Close_Time: number;
  Order_Type: 'SELL' | 'BUY';
  Open_Price: number;
  Current_Price: number;
  Profit: number;
  Swap: number;
  Commission: number;
  Balance: number;
  Comment: string;
  Magic: number;
}

export type MT5 = OrderMT5 | OpenOrderMT5 | BalanceChangeMT5;
export type MT4 = OrderMT4;
export type JSONHistory = MT5[] | MT4[];
export type MainObjectType = {
  [key: string]: JSONHistory;
};
export interface StatsInterface {
  [key: string]: Stats;
}

type Stats = {
  resultsStart: string;
  performanceTable: Partial<{
    balance: number;
    equity: number;
    totalProfit: number;
    initialBalance: number;
    totalWithdrawalDeposit: { totalDeposits: number; totalWithdrawals: number };
    profitFactor: number;
  }>;
  fullAccountReport: Partial<{
    totalRealisedPNLClosedAbs: number;
    totalProfitOpenPositions: number;
    totalOpenPositions: number;
    last24HoursProfit: number;
    recoveryFactor: number;
    sharpeRatio: number;
    totalWinRate: { winPercentage: number; lossPercentage: number };
    longShortRatio: { buyCount: number; sellCount: number; buyPercentage: number; sellPercentage: number };
    totalDrawdown: { maxDrawdownDollars: number; maxDrawdownPercent: number };
    Averages: {
      averageWin: number;
      averageLoss: number;
      totalProfit: number;
      totalLosses: number;
      averageWinReturnPct: number;
      averageLossReturnPct: number;
      averageTradesPerWeek: number;
      expectedPayoff: number;
    };
    gainsPerMonthAbs: { [key: string]: number };
    gainsPerMonthPct: { [key: string]: number };
    gainsPerWeekAbs: { [key: string]: number };
    gainsPerWeekPct: { [key: string]: number };
    WinLossStreaks: {
      longestWinningStreak: number;
      longestLosingStreak: number;
      winningStreakAmount: number;
      losingStreakAmount: number;
    };
    BiggestWinLoss: {
      biggestProfitAbs: number;
      biggestProfitPct: number;
      biggestLossAbs: number;
      biggestLossPct: number;
    };
    perSymbolStatistics: {
      [symbol: string]: { totalProfit: number; tradeCount: number; winCount: number; lossCount: number };
    };
    openPositionsDetails: { [key: string]: object };
  }>;
};

let STATS: StatsInterface = {};

// Recursive function to scan directories
const sourceDir = 'C:\\Users\\Jerko\\AppData\\Roaming\\MetaQuotes\\Terminal'; // Replace with your source directory
const targetDir = 'C:\\MTJsonData'; // Replace with your target directory

function scanDir(dir: string) {
  let counter = 0;
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDir(filePath); // Recurse into subdirectories
    } else if (path.extname(file) === '.json') {
      const targetPath = path.join(targetDir, file);
      fs.copyFileSync(filePath, targetPath); // Copy JSON file
      counter += 1;
    }
  });
}

export function writeStatsToFile(stats: StatsInterface): void {
  try {
    const dataDirectory = path.join(__dirname, '../data-output');
    const filePath = path.join(dataDirectory, 'statsOutput.json');
    const data = JSON.stringify(stats, null, 2);
    fs.writeFileSync(filePath, data);
  } catch (err) {
    console.error(err);
    throw new Error(`writeStatsToFile()`);
  }
}

export function readJSONFiles(): MainObjectType {
  try {
    const dataDirectory = targetDir;
    const fileNames = fs.readdirSync(dataDirectory);
    const jsonFiles = fileNames.filter((file) => path.extname(file) === '.json');

    const files: MainObjectType = {};
    jsonFiles.forEach((file) => {
      const filePath = path.join(dataDirectory, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const fileNameWithoutExtension = path.basename(file, '.json');
      files[fileNameWithoutExtension] = JSON.parse(rawData);

      STATS[fileNameWithoutExtension] = { resultsStart: '', performanceTable: {}, fullAccountReport: {} };
    });

    console.log(Object.keys(files));

    return files;
  } catch (err) {
    console.error(err);
    throw new Error(`readJSONFiles()`);
  }
}

export function mainCalculation(mainObject: MainObjectType) {
  try {
    // Loop through each key-value pair in the mainObject
    for (const key in mainObject) {
      if (mainObject.hasOwnProperty(key)) {
        const orders: JSONHistory = mainObject[key];

        // Use the calculation functions on the array of orders
        STATS[key].resultsStart = calcs.findEarliestEvent(orders);
        STATS[key].performanceTable = calcs.getPerformanceTable(orders);
        STATS[key].fullAccountReport!.totalRealisedPNLClosedAbs = calcs.calculateTotalProfitOnlyClosed(orders);
        STATS[key].fullAccountReport!.totalProfitOpenPositions = calcs.calculateTotalProfitOpenPositions(orders);
        STATS[key].fullAccountReport!.totalOpenPositions = calcs.numberOfOpenPositions(orders);
        const date = new Date();
        date.setHours(date.getHours() - 24);
        const timestamp24hAgo = date.getTime();
        STATS[key].fullAccountReport!.last24HoursProfit = calcs.calculateTotalProfitOnlyClosed(orders, timestamp24hAgo);
        STATS[key].fullAccountReport!.totalWinRate = calcs.calculateWinLossPercentage(orders);
        STATS[key].fullAccountReport!.longShortRatio = calcs.calculateBuySellPercentage(orders);
        STATS[key].fullAccountReport!.totalDrawdown = calcs.calculateDrawdown(orders);
        STATS[key].fullAccountReport!.Averages = calcs.calculateAverageWinLoss(orders);
        STATS[key].fullAccountReport!.recoveryFactor = calcs.calculateRecoveryFactor(orders);
        STATS[key].fullAccountReport!.sharpeRatio = calcs.calculateSharpeRatio(orders);
        STATS[key].fullAccountReport!.gainsPerMonthAbs = calcs.calculateMonthlyGainsABS(orders);
        STATS[key].fullAccountReport!.gainsPerMonthPct = calcs.calculateMonthlyGainsPCT(orders);
        STATS[key].fullAccountReport!.gainsPerWeekAbs = calcs.calculateWeeklyGainsABS(orders);
        STATS[key].fullAccountReport!.gainsPerWeekPct = calcs.calculateWeeklyGainsPCT(orders);
        STATS[key].fullAccountReport!.WinLossStreaks = calcs.findLongestStreaks(orders);
        STATS[key].fullAccountReport!.BiggestWinLoss = calcs.findBiggestProfitAndLoss(orders);
        STATS[key].fullAccountReport!.perSymbolStatistics = calcs.calculateProfitAndTradesPerSymbol(orders);
        STATS[key].fullAccountReport!.openPositionsDetails = calcs.findOpenOrders(orders);
      }
    }
    //console.log(STATS);
    return STATS;
  } catch (err) {
    console.error(err);
    throw new Error(`mainCalculation()`);
  }
}

// MAIN EXECUTION
//setInterval(() => {
const mainObject = readJSONFiles();
STATS = mainCalculation(mainObject);
//console.log(STATS);
console.dir(STATS, { depth: null });
writeStatsToFile(STATS);
//}, 60000);

setInterval(() => {
  scanDir(sourceDir);
}, 10000);
