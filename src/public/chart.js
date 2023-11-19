// Function to create the monthly graph
function createMonthlyGraph(data, trader) {
  try {
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
          color: '#2980b9', // Strong blue
        },
        {
          valueField: 'endBalance',
          name: 'End Balance',
          type: 'line',
          color: '#27ae60', // Green
        },
        {
          valueField: 'totalDeposits',
          name: 'Total Deposits',
          type: 'bar',
          color: '#f39c12', // Orange
        },
        {
          valueField: 'totalWithdrawals',
          name: 'Total Withdrawals',
          type: 'bar',
          color: '#c0392b', // Red
        },
        {
          valueField: 'monthlyPNL',
          name: 'Monthly PNL',
          type: 'bar',
          color: '#8e44ad', // Purple
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

    // Change the background color of the chart
    $chart.css('backgroundColor', '#ecf0f1'); // Light gray
    $chart.css({
      width: '100%', // Adjust the width here
      height: '100%', // Adjust the height here
    });
    return $chart;
  } catch (err) {
    console.error(err);
    ErrorLogger(err, `createMonthlyGraph()`);
  }
}

// Function to create the performance table
function createPerformanceData(data, trader) {
  const performanceData = data[trader].performanceTable;
  const fullAccountReport = data[trader].fullAccountReport;
  const $performanceData = $('<div>').css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    padding: '10px',
    alignItems: 'center',
    justifyContent: 'center',
  });

  // Existing performance data
  Object.keys(performanceData).forEach(function (key) {
    const value = performanceData[key];
    appendData($performanceData, key, value);
  });

  // Additional data
  const additionalDataKeys = [
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
    const value = fullAccountReport[key];
    appendData($performanceData, key, value);
  });

  return $performanceData;
}

function appendData($container, key, value) {
  const $dataContainer = $('<div>').css({
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    marginBottom: '10px',
  });
  const $keyElement = $('<h4>').text(key).css({ margin: '0', fontWeight: 'bold' });

  // Check if the value is an object
  if (typeof value === 'object' && value !== null) {
    // Convert the object to a string of key-value pairs
    value = Object.entries(value).map(([k, v]) => {
      const $propertyContainer = $('<div>');
      const $propertyKey = $('<span>').text(`${k}: `).css({ fontWeight: 'bold' });
      const $propertyValue = $('<span>').text(v).css({ fontStyle: 'italic' });
      $propertyContainer.append($propertyKey, $propertyValue);
      return $propertyContainer;
    });
  } else {
    value = $('<span>').text(value).css({ fontStyle: 'italic' });
  }

  $dataContainer.append($keyElement, ...value);
  $container.append($dataContainer);
}

// Function to create the gains per month chart
function createGainsPerMonthChart(data, trader) {
  try {
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
          color: '#6495ED', // Cornflower blue
          label: {
            visible: true,
            position: 'top',
            backgroundColor: 'transparent',
            customizeText: function (point) {
              return point.valueText;
            },
          },
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

    // Set the size of the chart
    $chart.addClass('chart-style');

    return $chart;
  } catch (err) {
    console.error(err);
    ErrorLogger(err, `createGainsPerMonthChart()`);
  }
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
        color: '#6495ED', // Cornflower blue
        label: {
          visible: true,
          position: 'top',
          backgroundColor: 'transparent',
          customizeText: function (point) {
            return point.valueText;
          },
        },
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

  $chart.addClass('chart-style');

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
          color: '#6495ED', // Cornflower blue
          label: {
            visible: true,
            position: 'top',
            backgroundColor: 'transparent',
            customizeText: function (point) {
              return point.valueText;
            },
          },
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

    $chart.addClass('chart-style');

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
          color: '#6495ED', // Cornflower blue
          label: {
            visible: true,
            position: 'top',
            backgroundColor: 'transparent',
            customizeText: function (point) {
              return point.valueText;
            },
          },
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

    $chart.addClass('chart-style');

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

          // Create a container for the bar charts
          var $barChartsContainer = $('<div>').css({
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
          });
          $container.append($barChartsContainer);

          // Call the function to create the gains per month chart
          var $gainsChart = createGainsPerMonthChart(data, trader);
          $barChartsContainer.append($gainsChart);

          // Call the function to create the gains per month percentage chart
          var $gainsPctChart = createGainsPerMonthPctChart(data, trader);
          $barChartsContainer.append($gainsPctChart);

          // Call the function to create the gains per week chart
          var $gainsWeekChart = createGainsPerWeekChart(data, trader);
          $barChartsContainer.append($gainsWeekChart);

          // Call the function to create the gains per week percentage chart
          var $gainsWeekPctChart = createGainsPerWeekPctChart(data, trader);
          $barChartsContainer.append($gainsWeekPctChart);

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
