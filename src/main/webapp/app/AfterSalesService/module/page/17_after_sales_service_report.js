export default function () {
  ;(function () {
    GoGoAppFun({
      gogo: function (context) {
        pageSetUp()
        context.init(context)

        var alarmClearTableByDate = createReportTable({
          $tableElement: $('#table'),
          $tableWidget: $('#date-table-widget'),
          rightColumn: [1, 2, 3, 4],
          onDraw: function (tableData, pageData) {
            //context.drawChart(tableData);
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [4], //排除率欄位
              xAxisLabelValueIndex: [0],
              yAxisLabel: '完成率',
            }
            context.commons.drawChart(context.$barChart, chartConfig)
          },
          excel: {
            fileName: 'RepairReport',
            format: ['text', '0', '0', '0', 'text'],
          },
        })
        // var alarmClearTableByAlarm = createReportTable({
        //     $tableElement: $("#alarm-table"),
        //     $tableWidget: $('#alarm-table-widget'),
        //     rightColumn: [3, 4, 5, 6],
        //     onDraw: function (tableData, pageData) {
        //     //context.drawChart(tableData);
        //     var chartConfig = {
        //       dataList: pageData,
        //       barValueIndex: [6],//排除率欄位
        //       xAxisLabelValueIndex: [0, 1, 2],
        //       yAxisLabel: '完成率'
        //     };
        //     context.commons.drawChart(context.$barChart, chartConfig);
        //     },
        //     excel: {
        //               fileName: 'ClearAlarmStatisticsByAlarm',
        //               format: ['text', '0', '0', '0', 'text']
        //             }
        //   });

        context.$submitBtn.on('click', function (e) {
          e.preventDefault()
          context.loadingBtn.doing()
          // var reportType = $('input[name="checkRadio"]:checked').val();
          var reportType = 'by-date'
          console.log('reportType:', reportType)
          switch (reportType) {
            case 'by-date': //依日期
              alarmClearTableByDate.showWidget()
              // alarmClearTableByAlarm.hideWidget();
              switch (context.currentFormType) {
                case 'range':
                  context.getAlarmClearResult(
                    context.$startDate.val(),
                    context.$endDate.val(),
                    alarmClearTableByDate
                  )
                  break
                case 'month':
                  context.getAlarmClearResultMonth(
                    context.$month.val(),
                    alarmClearTableByDate
                  )
                  break
                case 'year':
                  context.getAlarmClearResultYear(
                    context.$year.val(),
                    alarmClearTableByDate
                  )
                  break
                default:
                  console.info(
                    'not find this form type:',
                    context.currentFormType
                  )
              }
              break
            // case "by-alarm"://依警報
            //   alarmClearTableByDate.hideWidget();
            //   // alarmClearTableByAlarm.showWidget();
            //   var params = [];
            //   switch(context.currentFormType){
            //   case "range":
            //     params = [context.$startDate.val(), context.$endDate.val()];
            //     break;
            //   case "month":
            //     params = [context.$month.val()];
            //     break;
            //   case "year":
            //     params = [context.$year.val()];
            //     break;
            //   default:
            //     console.info("not find this form type:", context.currentFormType);
            //   }
            //   context.getAlarmClearResultByAlarmRange(context.currentFormType, params, alarmClearTableByAlarm);
            //   break;
            default:
              console.info('not find this form reportType:', reportType)
          }
        })

        /*$('#showDemo').on('click', function (e) {
      e.preventDefault();
      context.$startDate.val('2016/04/01');
      context.$endDate.val('2016/04/30');
      context.$submitBtn.click();
    });*/
      },
      util: {
        currentFormType: 'range',
        $tabHeaderRange: $('#tab-header-range'),
        $tabHeaderMonth: $('#tab-header-month'),
        $tabHeaderYear: $('#tab-header-year'),
        $rangeSection: $('#range-section'),
        $monthSection: $('#month-section'),
        $month: $('#month'),
        $yearSection: $('#year-section'),
        $year: $('#year'),
        $startDate: $('#start-date'),
        $endDate: $('#end-date'),
        $submitBtn: $('#submit-btn'),
        $barChart: $('#bar-chart'),
        $table: $('#table'),
        $alarmTable: $('#alarm-table'),
        loadingBtn: servkit.loadingButton(
          document.querySelector('#submit-btn')
        ),
        init: function (context) {
          var datepickerConfig = {
            dateFormat: 'yy/mm/dd',
            prevText: '<i class="fa fa-chevron-left"></i>',
            nextText: '<i class="fa fa-chevron-right"></i>',
          }

          this.$startDate
            .datepicker(datepickerConfig)
            .val(moment(new Date()).format('YYYY/MM/DD'))
          this.$endDate
            .datepicker(datepickerConfig)
            .val(moment(new Date()).format('YYYY/MM/DD'))
          this.$month
            .datepicker(datepickerConfig)
            .val(moment(new Date()).format('YYYY/MM'))
          this.$year
            .datepicker(datepickerConfig)
            .val(moment(new Date()).format('YYYY'))

          this.$barChart.on('plotclick', function (event, pos, item) {
            if (item) {
              var dataIndex = item.series.xaxis.ticks[item.dataIndex].label
              var btnId = '#' + dataIndex.replace('<br>', '__')
              $(btnId).click()
            }
          })

          context.currentFormType = 'range'
          context.$rangeSection.show()
          context.$monthSection.hide()
          context.$yearSection.hide()

          //  this.$tabHeaderRange.on("click", function(){
          // context.currentFormType = "range";
          // context.$rangeSection.show();
          // context.$monthSection.hide();
          // context.$yearSection.hide();
          //  });
          //  this.$tabHeaderMonth.on("click", function(){
          // context.currentFormType = "month";
          // context.$rangeSection.hide();
          // context.$monthSection.show();
          // context.$yearSection.hide();
          //  });
          //  this.$tabHeaderYear.on("click", function(){
          // context.currentFormType = "year";
          // context.$rangeSection.hide();
          // context.$monthSection.hide();
          // context.$yearSection.show();
          //  });
        },
        getAlarmClearResult: function (startDate, endDate, table) {
          var context = this
          console.log(startDate, endDate, table)
          servkit.ajax(
            {
              url: 'api/aftersalesservice/repair/repairReportByDateRange',
              type: 'GET',
              contentType: 'application/json',
              data: {
                startDate: startDate.toString(),
                endDate: endDate.toString(),
              },
            },
            {
              success: function (data) {
                console.log('data: ', data)
                var tableData = []
                _.each(data, function (ele) {
                  tableData.push([
                    ele['date'],
                    ele['total'],
                    ele['close_count'],
                    ele['no_close_count'],
                    ele['clear_probability'].floatToPercentage(),
                  ])
                })
                console.log(tableData)
                table.drawTable(tableData)
                context.loadingBtn.done()
                context.commons.smallBox({
                  selectColor: 'green',
                  title: '資料讀取成功',
                  icon: 'fa fa-check',
                  timeout: 2000,
                })
              },
              fail: function (data) {
                context.loadingBtn.done()
                context.commons.smallBox({
                  selectColor: 'red',
                  title: 'Query失敗',
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                })
              },
            }
          )
        },
        // getAlarmClearResultMonth: function (month, table) {
        //   var context = this;
        //   console.log(month, table);
        //   servkit.ajax({
        //     url: 'api/machinealarm/alarmClearProbabilityByMonth',
        //     type: 'GET',
        //     contentType: 'application/json',
        //     data: {"month": month.toString()}
        //   }, {
        //     success: function(data) {
        //      console.log("data: ", data);
        //      var tableData = [];
        //      _.each(data, function(ele){
        //       tableData.push([
        //         ele["date"],
        //         ele["total"],
        //         ele["clear_count"],
        //         ele["no_clear_count"],
        //         (ele["clear_probability"]).floatToPercentage()
        //       ]);
        //      });
        //      console.log(tableData);
        //      table.drawTable(tableData);
        //      context.loadingBtn.done();
        //      context.commons.smallBox({selectColor:"green", title:"資料讀取成功", icon:"fa fa-check", timeout:2000});
        //     },
        //     fail: function(data) {
        //       context.loadingBtn.done();
        //       context.commons.smallBox({selectColor:"red", title:"Query失敗", icon:"fa fa-sign-out", timeout:2000});
        //     }
        //   });
        // },
        // getAlarmClearResultYear: function (year, table) {
        //   var context = this;
        //   console.log(year, table);
        //   servkit.ajax({
        //     url: 'api/machinealarm/alarmClearProbabilityByYear',
        //     type: 'GET',
        //     contentType: 'application/json',
        //     data: {"year": year}
        //   }, {
        //     success: function(data) {
        //      console.log("data: ", data);
        //      var tableData = [];
        //      _.each(data, function(ele){
        //       tableData.push([
        //         ele["date"],
        //         ele["total"],
        //         ele["clear_count"],
        //         ele["no_clear_count"],
        //         (ele["clear_probability"]).floatToPercentage()
        //       ]);
        //      });
        //      console.log(tableData);
        //      table.drawTable(tableData);
        //      context.loadingBtn.done();
        //      context.commons.smallBox({selectColor:"green", title:"資料讀取成功", icon:"fa fa-check", timeout:2000});
        //     },
        //     fail: function(data) {
        //       context.loadingBtn.done();
        //       context.commons.smallBox({selectColor:"red", title:"Query失敗", icon:"fa fa-sign-out", timeout:2000});
        //     }
        //   });
        // },
        getAlarmClearResultByAlarmRange: function (type, params, table) {
          var context = this
          console.log(type, params)
          servkit.ajax(
            {
              url: 'api/machinealarm/alarmClearProbabilityByAlarmRange',
              type: 'GET',
              contentType: 'application/json',
              data: { type: type, params: params },
            },
            {
              success: function (data) {
                console.log('data: ', data)
                var tableData = []
                _.each(data, function (ele) {
                  tableData.push([
                    ele['machine_type_id'],
                    ele['cnc_id'],
                    ele['alarm_id'],
                    ele['total'],
                    ele['clear_count'],
                    ele['no_clear_count'],
                    ele['clear_probability'].floatToPercentage(),
                  ])
                })
                console.log(tableData)
                table.drawTable(tableData)
                context.loadingBtn.done()
                context.commons.smallBox({
                  selectColor: 'green',
                  title: '資料讀取成功',
                  icon: 'fa fa-check',
                  timeout: 2000,
                })
              },
              fail: function (data) {
                context.loadingBtn.done()
                context.commons.smallBox({
                  selectColor: 'red',
                  title: 'Query失敗',
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                })
              },
            }
          )
        },
      },
      delayCondition: ['machineList'],
      dependencies: [
        [
          '/js/plugin/flot/jquery.flot.cust.min.js',
          '/js/plugin/flot/jquery.flot.resize.min.js',
          '/js/plugin/flot/jquery.flot.fillbetween.min.js',
          '/js/plugin/flot/jquery.flot.pie.min.js',
          '/js/plugin/flot/jquery.flot.tooltip.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
        ],
        [
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        ],
      ],
    })
  })()
}
