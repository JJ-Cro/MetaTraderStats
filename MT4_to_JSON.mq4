//+------------------------------------------------------------------+
//|                                                      ReportEA.mq4 |
//|                        Copyright 2021, MetaQuotes Software Corp. |
//|                                             https://www.mql4.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2021, MetaQuotes Software Corp."
#property link      "https://www.mql4.com"
#property version   "1.00"
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
string OrderTypeToString(int orderType) {
    switch(orderType) {
        case OP_BUY: return "BUY";
        case OP_SELL: return "SELL";
        case OP_BUYLIMIT: return "BUY LIMIT";
        case OP_SELLLIMIT: return "SELL LIMIT";
        case OP_BUYSTOP: return "BUY STOP";
        case OP_SELLSTOP: return "SELL STOP";
        default: return "UNKNOWN";
    }
}

extern string FileName = "TradingHistory.json"; // Input variable for the file name
extern datetime StartDate = D'2022.01.01'; // Input variable for the date
extern string LicenseKey = ""; // User will enter their license key here
bool isLicenseValid = false;


int init() {
    if(!IsLicenseKeyValid(AccountNumber(), Symbol(), LicenseKey)) {
        MessageBox("Invalid license key for symbol " + Symbol(), "Error", MB_ICONERROR);
        Print("Invalid license key, algo stopping.");
        isLicenseValid = false;
        return INIT_FAILED;
    }
    isLicenseValid = true;
    Print("Licence key VALID!");
     return 0;
    // ... rest of your initialization logic
}

int start()
{
   if(!isLicenseValid){ 
   Print("Invalid license key, MTTOJSON will not log!");
   return 0;};


   datetime current_time = TimeCurrent();
   MqlDateTime time_structure;
   TimeToStruct(current_time, time_structure);
   
   static int last_minute = -1; // This will store the minute of the last tick
   if(time_structure.min != last_minute) // Check if a new minute has started
   {
      last_minute = time_structure.min;
      ExportTradingHistory();
      ExportOpenPositions();
   }
   
   return 0;
}

void ExportTradingHistory()
{
   int handle = FileOpen(FileName, FILE_WRITE|FILE_TXT|FILE_ANSI);
   if(handle != INVALID_HANDLE)
   {
      // Write start of JSON array
      FileWrite(handle, "[");

      // Export orders and balance changes
      int orders_total = OrdersHistoryTotal();
      double balance = 0; // Initial balance

      // Check if there are any open orders
      int open_orders_total = OrdersTotal();

      for(int i = 0; i < orders_total; i++)
      {
         if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         {
            datetime open_time = OrderOpenTime();
            if(open_time < StartDate) continue;
            // Export order
            string symbol = OrderSymbol();
            double volume = OrderLots();
            int order_type = OrderType();
            string type = OrderTypeToString(order_type);
            double price_open = OrderOpenPrice();
            double price_current = OrderClosePrice();
            
            // Get additional properties
            string comment = OrderComment();
            long magic = OrderMagicNumber();
            
            double profit = OrderProfit();
            double swap = OrderSwap();
            double commission = OrderCommission();
            balance += profit + swap + commission; // Update balance

            string transaction_type = "ORDER"; // Default transaction type

            // Check if order is a deposit or withdrawal
            if(symbol == "") {
                if(profit > 0) {
                    transaction_type = "DEPOSIT";
                } else if(profit < 0) {
                    transaction_type = "WITHDRAWAL";
                }
            }

            // Get order open and close times
            
            datetime close_time = OrderCloseTime();

            // Write order as JSON object
            string serverName = AccountServer();
            string json = StringFormat("{\"Server\":\"%s\",\"Platform\":\"MT4\",\"Transaction_Type\":\"%s\",\"Type\":\"%s\",\"Order_ID\":%d,\"Symbol\":\"%s\",\"Volume\":%.2f,\"Time\":%d,\"Close_Time\":%d,\"Order_Type\":\"%s\",\"Open_Price\":%.6f,\"Current_Price\":%.6f,\"Profit\":%.2f,\"Swap\":%.2f,\"Commission\":%.2f,\"Balance\":%.2f,\"Comment\":\"%s\",\"Magic\":%lld}", serverName, transaction_type, type, OrderTicket(), symbol, volume, open_time, close_time, type, price_open, price_current, profit, swap, commission, balance, comment, magic);
            
            // Check if it's the last order and if there are any open orders
            if(i < orders_total - 1 || open_orders_total > 0) {
                FileWrite(handle, json + ",");
            } else {
                FileWrite(handle, json);
            }
         }
      }

      FileClose(handle);
   }
   else
   {
      Print("Failed to open file: ", GetLastError());
   }
}

void ExportOpenPositions()

{
   int handle = FileOpen(FileName, FILE_READ|FILE_WRITE|FILE_TXT|FILE_ANSI);
   if(handle != INVALID_HANDLE)
   {
      // Move file pointer to the end
      FileSeek(handle, 0, SEEK_END);

      // Export open orders
      int open_orders_total = OrdersTotal();
      for(int i = 0; i < open_orders_total; i++)
      {
         if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
         {
            datetime open_time = OrderOpenTime();
            if(open_time < StartDate) continue;
            // Export order
            string symbol = OrderSymbol();
            double volume = OrderLots();
            int order_type = OrderType();
            string type = OrderTypeToString(order_type);
            double price_open = OrderOpenPrice();
            double price_current = MarketInfo(symbol, MODE_ASK); // Current price for open order
            
            // Get additional properties
            string comment = OrderComment();
            long magic = OrderMagicNumber();
            
            double profit = OrderProfit();
            double swap = OrderSwap();
            double commission = OrderCommission();

            string transaction_type = "OPEN_ORDER"; // Transaction type for open orders

           

            // Write order as JSON object
            string serverName = AccountServer();
string json = StringFormat("{\"Server\":\"%s\",\"Platform\":\"MT4\",\"Transaction_Type\":\"%s\",\"Type\":\"%s\",\"Order_ID\":%d,\"Symbol\":\"%s\",\"Volume\":%.2f,\"Time\":%d,\"Order_Type\":\"%s\",\"Open_Price\":%.6f,\"Current_Price\":%.6f,\"Profit\":%.2f,\"Swap\":%.2f,\"Commission\":%.2f,\"Comment\":\"%s\",\"Magic\":%lld}", serverName, transaction_type, type, OrderTicket(), symbol, volume, open_time, type, price_open, price_current, profit, swap, commission, comment, magic);
            // Check if it's the last order
            if(i < open_orders_total - 1) {
                FileWrite(handle, json + ",");
            } else {
                FileWrite(handle, json);
            }
         }
      }
      // Write end of JSON array
      FileWrite(handle, "]");
      FileClose(handle);
   }
   else
   {
      Print("Failed to open file: ", GetLastError());
   }
}

bool IsLicenseKeyValid(int accountNumber, string symbol, string licenseKey) {
    string expectedElements = IntegerToString(accountNumber) + symbol;
    for(int i = 0; i < StringLen(expectedElements); i++) {
        if(StringFind(licenseKey, StringSubstr(expectedElements, i, 1)) == -1) {
            return false;
        }
    }
    return true;
}