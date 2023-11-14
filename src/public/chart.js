$(function () {
  $.get('/data', function (data) {
    var traders = Object.keys(data);
    var items = traders.map(function (trader) {
      return {
        title: trader,
        template: function () {
          return function() {
            // Create a table for the performance data
            var $table = $('<table>').addClass('performance-table');
            var performanceData = data[trader].performanceTable;
            Object.keys(performanceData).forEach(function (key) {
              var value = performanceData[key];
              if (typeof value === 'object' && value !== null) {
                // If the value is an object, create additional rows for its properties
                Object.keys(value).forEach(function (subKey) {
                  var $row = $('<tr>');
                  $row.append($('<td>').text(subKey)); // Only use the subKey for the name
                  $row.append($('<td>').text(value[subKey]));
                  $table.append($row);
                });
              } else {
                var $row = $('<tr>');
                $row.append($('<td>').text(key));
                $row.append($('<td>').text(value));
                $table.append($row);
              }
            });

            // Transform the data into an array of objects
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

            // Create the chart
            var $chart = $('<div>').dxChart({
              dataSource: monthlyGraph,
              commonSeriesSettings: {
                argumentField: 'month'
              },
              series: [
                {
                  valueField: 'startBalance',
                  name: 'Start Balance',
                  type: 'line'
                },
                {
                  valueField: 'endBalance',
                  name: 'End Balance',
                  type: 'line'
                },
                {
                  valueField: 'totalDeposits',
                  name: 'Total Deposits',
                  type: 'bar'
                },
                {
                  valueField: 'totalWithdrawals',
                  name: 'Total Withdrawals',
                  type: 'bar'
                },
                {
                  valueField: 'monthlyPNL',
                  name: 'Monthly PNL',
                  type: 'bar'
                }
              ],
              legend: {
                visible: true,
                verticalAlignment: 'bottom',
                horizontalAlignment: 'center'
              },
              title: 'Monthly Data',
              tooltip: {
                enabled: true,
                customizeTooltip: function(arg) {
                  return {
                    text: arg.seriesName + ": " + arg.valueText
                  };
                }
              }
            });

            // Create a container for the table and the chart
            var $container = $('<div>');
            $container.append($table);
            $container.append($chart);

            return $container;
          };
        },
      };
    });

    $('#tab-panel').dxTabPanel({
      items: items,
      selectedIndex: 0,
      onSelectionChanged: function (e) {
        // Get the newly selected item's template
        var $newTemplate = e.addedItems[0].template();

        // Render the chart and repaint it to ensure it updates
        $newTemplate.dxChart('render');
        $newTemplate.dxChart('repaint');
      },
    });
  });
});