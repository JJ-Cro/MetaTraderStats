// Function to create the monthly graph
function createMonthlyGraph(data, trader) {
  var monthlyGraph = Object.keys(data[trader].monthlyGraph).map(function (month) {
    return {
      month: month,
      startBalance: data[trader].monthlyGraph[month].startBalance,
      endBalance: data[trader].monthlyGraph[month].endBalance,
      totalDeposits: data[trader].monthlyGraph[month].totalDeposits,
      totalWithdrawals: data[trader].monthlyGraph[month].totalWithdrawals,
      monthlyPNL: data[trader].monthlyGraph[month].monthlyPNL,
    };
  });

  var $chart = $('<div>').dxChart({
    dataSource: monthlyGraph,
    commonSeriesSettings: {
      argumentField: 'month',
    },
    series: [
      {
        valueField: 'startBalance',
        name: 'Start Balance',
        type: 'line',
      },
      {
        valueField: 'endBalance',
        name: 'End Balance',
        type: 'line',
      },
      {
        valueField: 'totalDeposits',
        name: 'Total Deposits',
        type: 'bar',
      },
      {
        valueField: 'totalWithdrawals',
        name: 'Total Withdrawals',
        type: 'bar',
      },
      {
        valueField: 'monthlyPNL',
        name: 'Monthly PNL',
        type: 'bar',
      },
    ],
    legend: {
      visible: true,
      verticalAlignment: 'bottom',
      horizontalAlignment: 'center',
    },
    title: 'Monthly Data',
    tooltip: {
      enabled: true,
      customizeTooltip: function (arg) {
        return {
          text: arg.seriesName + ': ' + arg.valueText,
        };
      },
    },
  });

  return $chart;
}

// Function to create the performance table
function createPerformanceData(data, trader) {
  var performanceData = data[trader].performanceTable;
  var fullAccountReport = data[trader].fullAccountReport;
  var $performanceData = $('<table>').css({
    width: '100%',
    borderCollapse: 'collapse',
  });

  // Existing performance data
  Object.keys(performanceData).forEach(function (key) {
    var value = performanceData[key];
    appendData($performanceData, key, value);
  });

  // Additional data
  var additionalDataKeys = [
    'totalRealisedPNLClosedAbs',
    'totalProfitOpenPositions',
    'totalOpenPositions',
    'last24HoursProfit',
    'totalWinRate',
    'longShortRatio',
    'totalDrawdown',
    'Averages',
    'recoveryFactor',
    'sharpeRatio',
    'WinLossStreaks',
    'BiggestWinLoss',
  ];
  additionalDataKeys.forEach(function (key) {
    var value = fullAccountReport[key];
    appendData($performanceData, key, value);
  });

  return $performanceData;
}

function appendData($container, key, value) {
  var $row = $('<tr>');
  var $keyCell = $('<td>').text(key).css({ padding: '10px', fontWeight: 'bold' });
  $row.append($keyCell);

  if (typeof value === 'object' && value !== null) {
    // If the value is an object, create a cell for each property
    Object.keys(value).forEach(function (subKey) {
      var $valueCell = $('<td>')
        .text(subKey + ': ' + value[subKey])
        .css({ padding: '10px' });
      $row.append($valueCell);
    });
  } else {
    var $valueCell = $('<td>').text(value).css({ padding: '10px' });
    $row.append($valueCell);
  }

  $container.append($row);
}
// Function to create the gains per month chart
function createGainsPerMonthChart(data, trader) {
  var gainsPerMonth = Object.keys(data[trader].fullAccountReport.gainsPerMonthAbs).map(function (month) {
    return {
      month: month,
      gains: data[trader].fullAccountReport.gainsPerMonthAbs[month],
    };
  });

  var $chart = $('<div>').dxChart({
    dataSource: gainsPerMonth,
    commonSeriesSettings: {
      argumentField: 'month',
    },
    series: [
      {
        valueField: 'gains',
        name: 'Gains',
        type: 'bar',
      },
    ],
    legend: {
      visible: false,
    },
    title: 'Gains Per Month in $',
    tooltip: {
      enabled: true,
      customizeTooltip: function (arg) {
        return {
          text: arg.seriesName + ': ' + arg.valueText,
        };
      },
    },
  });

  return $chart;
}

// Function to create the gains per month percentage chart
function createGainsPerMonthPctChart(data, trader) {
  var gainsPerMonthPct = Object.keys(data[trader].fullAccountReport.gainsPerMonthPct).map(function (month) {
    return {
      month: month,
      gainsPct: data[trader].fullAccountReport.gainsPerMonthPct[month],
    };
  });

  var $chart = $('<div>').dxChart({
    dataSource: gainsPerMonthPct,
    commonSeriesSettings: {
      argumentField: 'month',
    },
    series: [
      {
        valueField: 'gainsPct',
        name: 'Gains %',
        type: 'bar',
      },
    ],
    legend: {
      visible: false,
    },
    title: 'Gains Per Month (%)',
    tooltip: {
      enabled: true,
      customizeTooltip: function (arg) {
        return {
          text: arg.seriesName + ': ' + arg.valueText + '%',
        };
      },
    },
  });

  return $chart;
}

// Function to create the results start date
function createResultsStartDate(data, trader) {
  var resultsStartDate = data[trader].resultsStart;
  var $date = $('<p>').text('Results Start Date: ' + resultsStartDate);
  return $date;
}

// Function to create the win rate pie chart
// Function to create the win rate and long short ratio pie charts
function createWinRateAndLongShortRatioPieCharts(data, trader) {
  try {
    const winRateData = data[trader].fullAccountReport.totalWinRate;
    const longShortRatioData = data[trader].fullAccountReport.longShortRatio;

    // Win Rate Pie Chart
    const $winRateChart = $('<div>').dxPieChart({
      dataSource: [
        { category: 'Win Percentage', value: winRateData.winPercentage },
        { category: 'Loss Percentage', value: winRateData.lossPercentage },
      ],
      legend: {
        visible: true,
        verticalAlignment: 'bottom',
        horizontalAlignment: 'center',
      },
      series: [
        {
          argumentField: 'category',
          valueField: 'value',
          label: {
            visible: true,
            connector: {
              visible: true,
            },
            format: 'fixedPoint',
          },
        },
      ],
      title: 'Win Rate',
    });

    // Long Short Ratio Count Pie Chart
    const $longShortRatioCountChart = $('<div>').dxPieChart({
      dataSource: [
        { category: 'Buy Count', value: longShortRatioData.buyCount },
        { category: 'Sell Count', value: longShortRatioData.sellCount },
      ],
      legend: {
        visible: true,
        verticalAlignment: 'bottom',
        horizontalAlignment: 'center',
      },
      series: [
        {
          argumentField: 'category',
          valueField: 'value',
          label: {
            visible: true,
            connector: {
              visible: true,
            },
            format: 'fixedPoint',
          },
        },
      ],
      title: 'Long Short Ratio Count',
    });

    // Long Short Ratio Percentage Pie Chart
    const $longShortRatioPercentageChart = $('<div>').dxPieChart({
      dataSource: [
        { category: 'Buy Percentage', value: longShortRatioData.buyPercentage },
        { category: 'Sell Percentage', value: longShortRatioData.sellPercentage },
      ],
      legend: {
        visible: true,
        verticalAlignment: 'bottom',
        horizontalAlignment: 'center',
      },
      series: [
        {
          argumentField: 'category',
          valueField: 'value',
          label: {
            visible: true,
            connector: {
              visible: true,
            },
            format: 'fixedPoint',
          },
        },
      ],
      title: 'Long Short Ratio Percentage',
    });

    return [$winRateChart, $longShortRatioCountChart, $longShortRatioPercentageChart];
  } catch (err) {
    console.error(err);
    ErrorLogger(err, `createWinRateAndLongShortRatioPieCharts()`);
  }
}

// Function to create the gains per week chart
function createGainsPerWeekChart(data, trader) {
  try {
    const gainsPerWeekAbs = Object.keys(data[trader].fullAccountReport.gainsPerWeekAbs).map(function (week) {
      return {
        week: week,
        gains: data[trader].fullAccountReport.gainsPerWeekAbs[week],
      };
    });

    const $chart = $('<div>').dxChart({
      dataSource: gainsPerWeekAbs,
      commonSeriesSettings: {
        argumentField: 'week',
      },
      series: [
        {
          valueField: 'gains',
          name: 'Gains',
          type: 'bar',
        },
      ],
      legend: {
        visible: false,
      },
      title: 'Gains Per Week in $',
      tooltip: {
        enabled: true,
        customizeTooltip: function (arg) {
          return {
            text: arg.seriesName + ': ' + arg.valueText,
          };
        },
      },
    });

    return $chart;
  } catch (err) {
    console.error(err);
    ErrorLogger(err, `createGainsPerWeekChart()`);
  }
}

// Function to create the gains per week percentage chart
function createGainsPerWeekPctChart(data, trader) {
  try {
    const gainsPerWeekPct = Object.keys(data[trader].fullAccountReport.gainsPerWeekPct).map(function (week) {
      return {
        week: week,
        gainsPct: data[trader].fullAccountReport.gainsPerWeekPct[week],
      };
    });

    const $chart = $('<div>').dxChart({
      dataSource: gainsPerWeekPct,
      commonSeriesSettings: {
        argumentField: 'week',
      },
      series: [
        {
          valueField: 'gainsPct',
          name: 'Gains %',
          type: 'bar',
        },
      ],
      legend: {
        visible: false,
      },
      title: 'Gains Per Week (%)',
      tooltip: {
        enabled: true,
        customizeTooltip: function (arg) {
          return {
            text: arg.seriesName + ': ' + arg.valueText + '%',
          };
        },
      },
    });

    return $chart;
  } catch (err) {
    console.error(err);
    ErrorLogger(err, `createGainsPerWeekPctChart()`);
  }
}

// Function to create the per symbol statistics charts
function createPerSymbolStatisticsCharts(data, trader) {
  try {
    const perSymbolStatistics = data[trader].fullAccountReport.perSymbolStatistics;
    const symbols = Object.keys(perSymbolStatistics);

    // Prepare data for the charts
    const totalProfitData = symbols.map((symbol) => ({
      symbol: symbol,
      totalProfit: perSymbolStatistics[symbol].totalProfit,
    }));

    const tradeCountData = symbols.map((symbol) => ({
      symbol: symbol,
      tradeCount: perSymbolStatistics[symbol].tradeCount,
    }));

    const winCountData = symbols.map((symbol) => ({
      symbol: symbol,
      winCount: perSymbolStatistics[symbol].winCount,
    }));

    const lossCountData = symbols.map((symbol) => ({
      symbol: symbol,
      lossCount: perSymbolStatistics[symbol].lossCount,
    }));

    // Create the charts
    const $totalProfitChart = createBarChart('Total Profit Per Symbol', 'symbol', 'totalProfit', totalProfitData);
    const $tradeCountChart = createBarChart('Trade Count Per Symbol', 'symbol', 'tradeCount', tradeCountData);
    const $winCountChart = createBarChart('Win Count Per Symbol', 'symbol', 'winCount', winCountData);
    const $lossCountChart = createBarChart('Loss Count Per Symbol', 'symbol', 'lossCount', lossCountData);

    return [$totalProfitChart, $tradeCountChart, $winCountChart, $lossCountChart];
  } catch (err) {
    console.error(err);
    ErrorLogger(err, `createPerSymbolStatisticsCharts()`);
  }
}

// Function to create a bar chart
function createBarChart(title, argumentField, valueField, dataSource) {
  const $chart = $('<div>').dxChart({
    dataSource: dataSource,
    commonSeriesSettings: {
      argumentField: argumentField,
    },
    series: [
      {
        valueField: valueField,
        name: title,
        type: 'bar',
      },
    ],
    legend: {
      visible: false,
    },
    title: title,
    tooltip: {
      enabled: true,
      customizeTooltip: function (arg) {
        return {
          text: arg.seriesName + ': ' + arg.valueText,
        };
      },
    },
  });

  return $chart;
}

// Function to create the open positions table
function createOpenPositionsTable(data, trader) {
  try {
    const openPositionsDetails = data[trader].fullAccountReport.openPositionsDetails;
    const $openPositionsTable = $('<table>').css({
      width: '100%',
      borderCollapse: 'collapse',
    });

    // Create the table header
    const $headerRow = $('<tr>');
    ['Symbol', 'Time Open', 'Side', 'Volume', 'Open Price', 'Current Price', 'Profit', 'Swap', 'Commission'].forEach(
      (header) => {
        const $headerCell = $('<th>').text(header).css({ padding: '10px', fontWeight: 'bold', textAlign: 'center' });
        $headerRow.append($headerCell);
      },
    );
    $openPositionsTable.append($headerRow);

    // Create the table body
    Object.keys(openPositionsDetails).forEach((order) => {
      const details = openPositionsDetails[order];
      const $row = $('<tr>');
      ['Symbol', 'Time', 'Order_Type', 'Volume', 'Open_Price', 'Current_Price', 'Profit', 'Swap', 'Commission'].forEach(
        (key) => {
          let value = details[key];
          // Convert the timestamp to a date string if the key is 'Time'
          if (key === 'Time') {
            const date = new Date(value * 1000);
            value =
              date.getFullYear() +
              '-' +
              (date.getMonth() + 1).toString().padStart(2, '0') +
              '-' +
              date.getDate().toString().padStart(2, '0') +
              ' ' +
              date.getHours().toString().padStart(2, '0') +
              ':' +
              date.getMinutes().toString().padStart(2, '0');
          }
          const $cell = $('<td>').text(value).css({ padding: '10px', textAlign: 'center' });
          $row.append($cell);
        },
      );
      $openPositionsTable.append($row);
    });

    return $openPositionsTable;
  } catch (err) {
    console.error(err);
  }
}
// In your template function
$(function () {
  $.get('/data', function (data) {
    var traders = Object.keys(data);
    var items = traders.map(function (trader) {
      return {
        title: trader,
        template: function () {
          // Create a container for the charts, the table, and the date
          var $container = $('<div>');

          // Call the function to create the results start date
          var $date = createResultsStartDate(data, trader);
          $container.append($date);

          // Call the function to create the performance data
          var $performanceData = createPerformanceData(data, trader);
          $container.append($performanceData);

          // Call the function to create the monthly graph
          var $monthlyGraph = createMonthlyGraph(data, trader);
          $container.append($monthlyGraph);

          // Call the function to create the gains per month chart
          var $gainsChart = createGainsPerMonthChart(data, trader);
          $container.append($gainsChart);

          // Call the function to create the gains per month percentage chart
          var $gainsPctChart = createGainsPerMonthPctChart(data, trader);
          $container.append($gainsPctChart);

          // Call the function to create the gains per week chart
          var $gainsWeekChart = createGainsPerWeekChart(data, trader);
          $container.append($gainsWeekChart);

          // Call the function to create the gains per week percentage chart
          var $gainsWeekPctChart = createGainsPerWeekPctChart(data, trader);
          $container.append($gainsWeekPctChart);

          // Create a container for the pie charts
          var $pieChartsContainer = $('<div>').css({
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
          });
          $container.append($pieChartsContainer);

          // Call the function to create the win rate and long short ratio pie charts
          var [$winRateChart, $longShortRatioCountChart, $longShortRatioPercentageChart] =
            createWinRateAndLongShortRatioPieCharts(data, trader);
          $pieChartsContainer.append($winRateChart, $longShortRatioCountChart, $longShortRatioPercentageChart);

          // Call the function to create the per symbol statistics charts
          var [$totalProfitChart, $tradeCountChart, $winCountChart, $lossCountChart] = createPerSymbolStatisticsCharts(
            data,
            trader,
          );
          $container.append($totalProfitChart, $tradeCountChart, $winCountChart, $lossCountChart);

          // Call the function to create the open positions table
          var $openPositionsTable = createOpenPositionsTable(data, trader);
          $container.append($openPositionsTable);

          return $container;
        },
      };
    });

    $('#tab-panel').dxTabPanel({
      items: items,
      selectedIndex: 0,
      onSelectionChanged: function (e) {
        var $container = e.addedItems[0].template();
        var $charts = $container.find('div.dx-chart');
        $charts.each(function () {
          $(this).dxChart('render');
        });
      },
    });
  });
});
