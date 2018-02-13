/* globals angular io socket Highcharts*/
angular
  .module('graphData')
  .component('graphData', {
    templateUrl: "/graph/graph.tempelate.html",
    controller: function graphDataController($scope, $rootScope, $http) {
      var self = this;
      self.error = '';
      self.drawData = [];
      self.checkAddCode = function() {
        if (self.code !== undefined) {
          socket.emit('code', {
            code: self.code.toUpperCase()
          });
          self.code = "";
        } else {
          self.error = "Please enter a code."
        }               
      }
      self.delete = function() {
        socket.emit('delete', $(event.target.id).selector);
      }
      socket.on("err", function(data) {
        $scope.$apply(function() {
          self.error = data.error
        })
      })
      socket.on("test", function(data) {
        console.log(data)
      })
      socket.on("draw", function(data) {
        $scope.$apply(function() {
          self.error = data.error
        })
        if (data === "getOld") {
          socket.emit('get', 'getOld')
        } else {
          socket.emit('get', 'getNew')
        }
      })
      socket.on("data", function(data) {
        $scope.$apply(function() {
          self.drawData = data
          if (self.drawData.length >= 10) {
            self.dataLength = "Maximum of 10 stock codes can be added."
          } else {
            self.dataLength = "";
          }
          if (self.drawData.length < 10) {
            self.drawData.push({
              input: true
            })
          }
        })
        var d = new Date()
        var seriesOptions = []
        var colors = ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4', '#ffffff']
        function createChart() {
          Highcharts.createElement('link', {
            href: 'https://fonts.googleapis.com/css?family=Unica+One',
            rel: 'stylesheet',
            type: 'text/css'
          }, null, document.getElementsByTagName('head')[0]);
          Highcharts.theme = {
            chart: {
              backgroundColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 1,
                  y2: 1
                },
                stops: [
                  [0, '#2a2a2b'],
                  [1, '#3e3e40']
                ]
              },
              style: {
                fontFamily: '\'Unica One\', sans-serif'
              },
              plotBorderColor: '#606063'
            },
            title: {
              style: {
                color: '#E0E0E3',
                textTransform: 'uppercase',
                fontSize: '20px'
              }
            },
            subtitle: {
              style: {
                color: '#E0E0E3',
                textTransform: 'uppercase'
              }
            },
            xAxis: {
              gridLineColor: '#707073',
              labels: {
                style: {
                  color: '#E0E0E3'
                }
              },
              lineColor: '#707073',
              minorGridLineColor: '#505053',
              tickColor: '#707073',
              title: {
                style: {
                  color: '#A0A0A3'

                }
              }
            },
            yAxis: {
              gridLineColor: '#707073',
              labels: {
                style: {
                  color: '#E0E0E3'
                }
              },
              lineColor: '#707073',
              minorGridLineColor: '#505053',
              tickColor: '#707073',
              tickWidth: 1,
              title: {
                style: {
                  color: '#A0A0A3'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              style: {
                color: '#F0F0F0'
              }
            },
            plotOptions: {
              series: {
                dataLabels: {
                  color: '#B0B0B3'
                },
                marker: {
                  lineColor: '#333'
                }
              },
              boxplot: {
                fillColor: '#505053'
              },
              candlestick: {
                lineColor: 'white'
              },
              errorbar: {
                color: 'white'
              }
            },
            legend: {
              itemStyle: {
                color: '#E0E0E3'
              },
              itemHoverStyle: {
                color: '#FFF'
              },
              itemHiddenStyle: {
                color: '#606063'
              }
            },
            credits: {
              style: {
                color: '#666'
              }
            },
            labels: {
              style: {
                color: '#707073'
              }
            },

            drilldown: {
              activeAxisLabelStyle: {
                color: '#F0F0F3'
              },
              activeDataLabelStyle: {
                color: '#F0F0F3'
              }
            },
            navigation: {
              buttonOptions: {
                symbolStroke: '#DDDDDD',
                theme: {
                  fill: '#505053'
                }
              }
            },
            rangeSelector: {
              buttonTheme: {
                fill: '#505053',
                stroke: '#000000',
                style: {
                  color: '#CCC'
                },
                states: {
                  hover: {
                    fill: '#707073',
                    stroke: '#000000',
                    style: {
                      color: 'white'
                    }
                  },
                  select: {
                    fill: '#000003',
                    stroke: '#000000',
                    style: {
                      color: 'white'
                    }
                  }
                }
              },
              inputBoxBorderColor: '#505053',
              inputStyle: {
                backgroundColor: '#333',
                color: 'silver'
              },
              labelStyle: {
                color: 'silver'
              }
            },
            navigator: {
              handles: {
                backgroundColor: '#666',
                borderColor: '#AAA'
              },
              outlineColor: '#CCC',
              maskFill: 'rgba(255,255,255,0.1)',
              series: {
                color: '#7798BF',
                lineColor: '#A6C7ED'
              },
              xAxis: {
                gridLineColor: '#505053'
              }
            },
            scrollbar: {
              barBackgroundColor: '#808083',
              barBorderColor: '#808083',
              buttonArrowColor: '#CCC',
              buttonBackgroundColor: '#606063',
              buttonBorderColor: '#606063',
              rifleColor: '#FFF',
              trackBackgroundColor: '#404043',
              trackBorderColor: '#404043'
            },
            legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
            background2: '#505053',
            dataLabelsColor: '#B0B0B3',
            textColor: '#C0C0C0',
            contrastTextColor: '#F0F0F3',
            maskColor: 'rgba(255,255,255,0.3)'
          };
          Highcharts.setOptions(Highcharts.theme);
          Highcharts.stockChart('chart', {
            rangeSelector: {
              selected: 4
            },
            chart: {
              height: 600
            },
            xAxis: {

              type: 'datetime',
              dateTimeLabelFormats: {
                day: "%b-%y"
              },
            },
            yAxis: {
              labels: {
                formatter: function() {
                  return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
              },
              plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
              }]
            },
            plotOptions: {
              series: {
                compare: 'percent',
                showInNavigator: true
              }
            },
            tooltip: {
              pointFormat: '<span style="color:{series.color}>{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
              valueDecimals: 2,
              split: true
            },
            series: seriesOptions
          });
        }
        createChart();
        $.each(data, function(i) {
          var parsedData = []
          if (data[i].input === false) {
            data[i].data.reverse().forEach(function(a) {
              parsedData.push([Date.UTC(a[0].split("-")[0], a[0].split("-")[1] - 1, a[0].split("-")[2]), a[1]])
            })
          }
          if (parsedData !== []) {
            seriesOptions[i] = {
              name: data[i].code,
              data: parsedData,
              color: colors[i]
            }
          };
          createChart();
        });
      })
    }
  })