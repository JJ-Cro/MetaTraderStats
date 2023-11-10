//+------------------------------------------------------------------+
//|                                                      ReportEA.mq5 |
//|                        Copyright 2021, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2021, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//---
   
//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//---

  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
input string FileName = "TradingHistory.json"; // Input variable for the file name

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
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
}

void ExportTradingHistory()
{
   int handle = FileOpen(FileName, FILE_WRITE|FILE_TXT|FILE_ANSI);
   if(handle != INVALID_HANDLE)
   {
      // Write start of JSON array
      FileWrite(handle, "[");

      // Select all history
      HistorySelect(0, TimeCurrent());
      int deals_total = HistoryDealsTotal();
      double balance = 0; // Initial balance

      // Export orders and balance changes
      int orders_total = HistoryOrdersTotal();
      int order_index = 0;
      int deal_index = 0;
      while(order_index < orders_total || deal_index < deals_total)
      {
         ulong order_ticket = order_index < orders_total ? HistoryOrderGetTicket(order_index) : 0;
         ulong deal_ticket = deal_index < deals_total ? HistoryDealGetTicket(deal_index) : 0;

         datetime order_time = order_ticket > 0 ? (datetime)HistoryOrderGetInteger(order_ticket, ORDER_TIME_SETUP) : 0;
         datetime deal_time = deal_ticket > 0 ? (datetime)HistoryDealGetInteger(deal_ticket, DEAL_TIME) : 0;

         if(order_ticket > 0 && (deal_ticket == 0 || order_time <= deal_time))
         {
            // Export order
            string symbol = HistoryOrderGetString(order_ticket, ORDER_SYMBOL);
            double volume = HistoryOrderGetDouble(order_ticket, ORDER_VOLUME_INITIAL);
            string type = EnumToString((ENUM_ORDER_TYPE)HistoryOrderGetInteger(order_ticket, ORDER_TYPE));
            double price_open = 0;
            double price_current = HistoryOrderGetDouble(order_ticket, ORDER_PRICE_CURRENT);
            
            double profit = 0;
            double swap = 0;
            double commission = 0;
            while(deal_index < deals_total)
            {
               deal_ticket = HistoryDealGetTicket(deal_index);
               if(HistoryDealGetInteger(deal_ticket, DEAL_ORDER) == order_ticket)
               {
                  ENUM_DEAL_ENTRY deal_entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
                  if(deal_entry == DEAL_ENTRY_IN || deal_entry == DEAL_ENTRY_OUT)
                  {
                     price_open = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
                  }
                  double deal_profit = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
                  profit += deal_profit;
                  swap += HistoryDealGetDouble(deal_ticket, DEAL_SWAP);
                  commission += HistoryDealGetDouble(deal_ticket, DEAL_COMMISSION);
                  balance += deal_profit + swap + commission; // Update balance
                  deal_index++;
               }
               else
               {
                  break;
               }
            }
            
            // Write order as JSON object
            string json = StringFormat("{\"Platform\":\"MT5\",\"Type\":\"ORDER\",\"Order_ID\":%d,\"Symbol\":\"%s\",\"Volume\":%.2f,\"Time\":%d,\"Order_Type\":\"%s\",\"Open_Price\":%.2f,\"Current_Price\":%.2f,\"Profit\":%.2f,\"Swap\":%.2f,\"Commission\":%.2f,\"Balance\":%.2f}", order_ticket, symbol, volume, order_time, type, price_open, price_current, profit, swap, commission, balance);
            FileWrite(handle, json + ",");
            order_index++;
         }
         else if(deal_ticket > 0)
         {
            // Export balance change
                        ENUM_DEAL_ENTRY deal_entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
            if(deal_entry == DEAL_ENTRY_IN || deal_entry == DEAL_ENTRY_OUT)
            {
               double amount = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
               balance += amount; // Update balance
               ulong order_ticket_for_deal = HistoryDealGetInteger(deal_ticket, DEAL_ORDER);

               // Write balance change as JSON object
               string json = StringFormat("{\"Platform\":\"MT5\",\"Type\":\"BALANCECHANGE\",\"Order_ID\":%d,\"Time\":%d,\"Amount\":%.2f,\"Balance\":%.2f}", order_ticket_for_deal, deal_time, amount, balance);
               FileWrite(handle, json + ",");
            }
            deal_index++;
         }
      }

      // Write end of JSON array
      
      
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
      FileSeek(handle, 0, SEEK_END); // Move the cursor to the end of the file

      int total = PositionsTotal();
      for(int i = 0; i < total; i++) {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0) {
            string symbol = PositionGetString(POSITION_SYMBOL);
            double volume = PositionGetDouble(POSITION_VOLUME);
            string type = EnumToString((ENUM_ORDER_TYPE)PositionGetInteger(POSITION_TYPE));
            double price_open = PositionGetDouble(POSITION_PRICE_OPEN);
            double price_current = PositionGetDouble(POSITION_PRICE_CURRENT);
            double profit = PositionGetDouble(POSITION_PROFIT);
            double swap = PositionGetDouble(POSITION_SWAP);
            double commission = PositionGetDouble(POSITION_COMMISSION);
            datetime time = TimeCurrent(); // Get the current server time
            
            // Write open order as JSON object
            string json = StringFormat("{\"Platform\":\"MT5\",\"Type\":\"OPEN_ORDER\",\"Order_ID\":%d,\"Symbol\":\"%s\",\"Volume\":%.2f,\"Order_Type\":\"%s\",\"Open_Price\":%.2f,\"Current_Price\":%.2f,\"Profit\":%.2f,\"Swap\":%.2f,\"Commission\":%.2f,\"Time\":%d}", ticket, symbol, volume, type, price_open, price_current, profit, swap, commission, time);
            FileWrite(handle, json + ",");
         }
      }
      FileWrite(handle, "\n]");
      FileClose(handle);
   }
   else
   {
      Print("Failed to open file: ", GetLastError());
   }
}