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

$(function () {
  $.get('/data', function (data) {
    var traders = Object.keys(data);
    var items = traders.map(function (trader) {
      return {
        title: trader,
        template: function () {
          // Call the function to create the monthly graph
          var $chart = createMonthlyGraph(data, trader);
          return $chart;
        },
      };
    });

    $('#tab-panel').dxTabPanel({
      items: items,
      selectedIndex: 0,
      onSelectionChanged: function (e) {
        e.addedItems[0].template().dxChart('render');
      },
    });
  });
});
