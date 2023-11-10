/* 1. Reports just like the reports generated from mql5 (monthly gain, chart of performance, drawdown, balance, equity, profit etc)
2. Accumulated Today profit/loss
3. Details of todays position opened and closed
4. Time to report (everyday)
5. Same as above only for weekly
6. Same as above only for monthly
7. Same as above only for All Time
8. Same as above only for Custom Date
9. Ability to input the start date (for example: my account is opened from 2010, but i only want to get results start from 5 October 2021 till now) */

/* things to do: 
change time to "TIME " on all properties
openorders have time also  in mt4 and mt5
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
  Order_Type: 'SELL' | 'BUY';
  Open_Price: number;
  Current_Price: number;
  Profit: number;
  Swap: number;
  Commission: number;
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
  [key: string]: Partial<Stats>;
}

type Stats = {
  fullAccountReport: Partial<{
    totalProfitClosedAbs: number;
    totalProfitOpenPositions: number;
    totalOpenPositions: number;
  }>;
};

let STATS: StatsInterface = {};

export function readJSONFiles(): MainObjectType {
  try {
    const dataDirectory = path.join(__dirname, '../data');
    const fileNames = fs.readdirSync(dataDirectory);
    const jsonFiles = fileNames.filter((file) => path.extname(file) === '.json');

    const files: MainObjectType = {};
    jsonFiles.forEach((file) => {
      const filePath = path.join(dataDirectory, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const fileNameWithoutExtension = path.basename(file, '.json');
      files[fileNameWithoutExtension] = JSON.parse(rawData);

      STATS[fileNameWithoutExtension] = { fullAccountReport: {} };
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

        STATS[key].fullAccountReport!.totalProfitClosedAbs = calcs.calculateTotalProfitOnlyClosed(orders, 0);
        STATS[key].fullAccountReport!.totalProfitOpenPositions = calcs.calculateTotalProfitOpenPositions(orders);
        STATS[key].fullAccountReport!.totalOpenPositions = calcs.numberOfOpenPositions(orders);
      }
    }
    //console.log(STATS);
  } catch (err) {
    console.error(err);
    throw new Error(`mainCalculation()`);
  }
}

export const mainObject = readJSONFiles();
mainCalculation(mainObject);
console.log(STATS);
