export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')
      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initSelectWithList(
        context.preCon.getShiftList,
        context.$shiftSelect
      )
      servkit.initMachineSelect(context.$machineSelect)
      context.clearChartAndTable()

      var last_valid_selection = null
      context.$machineSelect.on('click', function (e) {
        if ($(this).val().length > 5) {
          alert('至多僅可選擇5台機台！')
          $(this).val(last_valid_selection)
        } else {
          last_valid_selection = $(this).val()
        }
      })

      context.$userTypeRadio.on('change', function (e) {
        var user_type = $(this).val()
        servkit.initSelectWithList(
          context.preCon.getUserListByGroup[user_type],
          context.$employeeSelect
        )
      })
      context.$userTypeRadio.eq(0).change()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.clearChartAndTable()
        context.getData()
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2018/09/11')
        context.$endDate.val('2018/09/19')
        context.$machineSelect.val([
          '_HULPLATFORM01D01M01',
          '_HULPLATFORM01D01M02',
        ])
        context.$submitBtn.click()
      })

      $('#download-excel').on('click', function (e) {
        e.preventDefault()
        var hiddenFormId
        hiddenFormId && $('#' + hiddenFormId).remove()
        hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')
        var $submitForm = $('<form id="' + hiddenFormId + '"></form>')
        var iframeHtml =
          '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
        const user_type = context.$userTypeRadio.val()
        const machineMap = {}
        _.each(servkit.getMachineMap(), (obj, key) => {
          machineMap[key] = obj.device_name
        })
        let config = JSON.stringify({
          start: context.$startDate.val(),
          end: context.$endDate.val(),
          machineList: _.keys(machineMap),
          workerMap: context.preCon.getUserListByGroup[user_type],
          workShift: context.$shiftSelect.val(),
          machineMap: machineMap,
          codeMap: context.preCon.getDowntimeCode,
        })
        $submitForm.append($('<input>').attr('name', 'data').val(config))
        $submitForm.attr({
          action: servkit.rootPath + '/api/huangliangExcel/download',
          method: 'post',
          target: 'download_target',
        })
        $(this).after($submitForm.hide())
        $submitForm.append(iframeHtml)

        document.querySelector('#' + hiddenFormId).submit()
      })

      context.commons.testMachineBtn()
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $shiftSelect: $('#shift'),
      $userRadio: $('[name=user]'),
      $userTypeRadio: $('[name=user_type]'),
      $userIdInput: $('#user_id'),
      $employeeSelect: $('#employee'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      chartWidgetHtml: $('[data-name=chart-widget]').clone(),
      tableWidgetHtml: $('[data-name=table-widget]').clone(),
      getData: function () {
        var shiftList = this.$shiftSelect.val() || [],
          machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        hippo
          .newSimpleExhaler()
          .space('downtime_analysis')
          .index('machine_id', machineList)
          .index('work_shift_name', shiftList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns('machine_id', 'm521', 'm522', 'duration')
          .exhale(function (exhalable) {
            try {
              var employeeFilter
              if ($('[name=user]:checked').val() == 'user_id') {
                employeeFilter = [context.$userIdInput.val()]
              } else {
                employeeFilter = context.$employeeSelect.val()
              }

              //其實如果計算程式都已經補成5碼了的話是不用 fillZeroTo5Digit 不過如果已經5碼了再補了也無妨
              //但是這支沒有補阿QQ
              _.each(exhalable.exhalable, function (elem) {
                elem.m521 = context.commons.fillZeroTo5Digit(elem.m521)
              })

              var groupedMachineData = _.chain(exhalable.exhalable)
                .filter(function (data) {
                  return _.contains(employeeFilter, data.m521)
                })
                .groupBy('machine_id')
                .value()

              if (groupedMachineData.length == 0) {
                $.smallBox({
                  sound: false, //不要音效
                  title: '人員與機台無對應資料，請更改查詢條件。',
                  content:
                    "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                  color: servkit.colors.red,
                  icon: 'fa fa-times',
                  timeout: 4000,
                })
                loadingBtn.done()
              } else {
                _.each(groupedMachineData, function (machineDatas, machineId) {
                  var machineDOM = context.addChartAndTable(machineId)

                  var downtimeSum = 0

                  var peopleCodeData = _.groupBy(machineDatas, function (elem) {
                    return elem.m521 + '@@' + elem.m522
                  })

                  var tableData = _.map(peopleCodeData, function (codeGroup) {
                    var codeDowntimeSum = _.reduce(
                      codeGroup,
                      function (memo, atom) {
                        return memo + parseFloat(atom.duration)
                      },
                      0
                    )
                    downtimeSum += codeDowntimeSum
                    return [
                      codeGroup[0].m521,
                      context.commons.getUserName(
                        context.preCon.getUserListByGroup.all,
                        codeGroup[0].m521
                      ),
                      codeGroup[0].m522,
                      context.preCon.getDowntimeCode[codeGroup[0].m522] ||
                        '---',
                      (codeDowntimeSum / 60000).toFixed(2), //ms to minute
                    ]
                  })

                  _.each(tableData, function (rowData) {
                    rowData.push(
                      (
                        rowData[4] / (downtimeSum / 60000).toFixed(2)
                      ).floatToPercentage()
                    )
                  })

                  var m521List = _.chain(machineDatas)
                    .pluck('m521')
                    .uniq()
                    .map(function (m521) {
                      return context.commons.fillZeroTo5Digit(m521)
                    })
                    .value()
                  var text =
                    '【人員別】：' +
                    $('[name=user_type]:checked').next().next().text() +
                    ' 【員工編號】：' +
                    m521List.join('/') +
                    ' 【人員姓名】：' +
                    _.map(m521List, function (userId) {
                      return context.commons.getUserName(
                        context.preCon.getUserListByGroup.all,
                        userId
                      )
                      //                    return (context.preCon.getUserListByGroup[$('[name=user_type]:checked').val()][userId] || '');
                    }).join('/') +
                    ' 【機台】：' +
                    servkit.getMachineName(machineId)
                  machineDOM.$tableWidget
                    .find('.widget-body')
                    .prepend(
                      '<div class="alert alert-warning font-lg">' +
                        text +
                        '</div>'
                    )
                  machineDOM.reportTable.drawTable(tableData)
                  context.drawPieChart(tableData, machineDOM.$chart)
                  loadingBtn.done()
                })
              }
            } catch (e) {
              console.log(e)
              loadingBtn.done()
            }
          })
        loadingBtn.done()
      },
      drawPieChart: function (tableData, $chart) {
        var pieData = _.map(tableData, function (data) {
          return {
            label: data[1] + ' - ' + data[2], //code
            data: data[4], //codeDowntimeSum
          }
        })
        var context = this

        console.log(pieData)

        $.plot($chart, pieData, {
          series: {
            pie: {
              show: true,
              innerRadius: 0.5,
              radius: 1,
              label: {
                show: true,
                radius: 2 / 3,
                formatter: function (label, series) {
                  console.log(label)
                  console.log(series)
                  var minute = series.data[0][1]
                  if (Math.round(series.percent) < 2) {
                    return ''
                  } else {
                    return (
                      '<div style="font-size:0.8em;text-align:center;padding:4px;color:white;">' +
                      series.label +
                      '<br/>' +
                      Math.round(series.percent) +
                      '% (' +
                      minute +
                      ')' +
                      '</div>'
                    )
                  }
                },
                background: {
                  opacity: 0.5,
                  color: '#000',
                } /*,
               threshold : 0.1*/,
              },
            },
          },
          legend: {
            show: true,
            noColumns: 1, // number of colums in legend table
            labelFormatter: function (label, series) {
              // fn: string -> string
              var code = label.split(' - ')[1]
              return label + '　' + (context.preCon.getDowntimeCode[code] || '')
            },
            labelBoxBorderColor: '#000', // border color for the little label boxes
            container: null, // container (as jQuery object) to put legend in, null means default on top of graph
            position: 'ne', // position of default legend container within plot
            margin: [5, 10], // distance from grid edge to default legend container within plot
            backgroundColor: '#efefef', // null means auto-detect
            backgroundOpacity: 1, // set to 0 to avoid background
          },
          grid: {
            hoverable: true,
          },
          tooltip: true,
          tooltipOpts: {
            content: '%s: %p.0% ( %y.2 M )',
          },
        })
      },
      clearChartAndTable: function () {
        $('[data-name=chart-widget]').remove()
        $('[data-name=table-widget]').remove()
      },
      addChartAndTable: function (machineId) {
        var context = this
        var $chartWidget = $(context.chartWidgetHtml.clone())
        var $tableWidget = $(context.tableWidgetHtml.clone())
        $chartWidget
          .attr('id', 'chart-' + machineId)
          .find('h2')
          .text(servkit.getMachineName(machineId))
        $tableWidget
          .attr('id', 'table-' + machineId)
          .find('h2')
          .text(servkit.getMachineName(machineId))
        $('article').append($chartWidget).append($tableWidget)
        return {
          $chart: $chartWidget.find('[data-name=pie-chart]'),
          $tableWidget: $tableWidget,
          reportTable: createReportTable({
            $tableElement: $tableWidget.find('[data-name=table]'),
            $tableWidget: $tableWidget,
            rightColumn: [4, 5],
            excel: {
              fileName: 'DowntimeAnalysis_' + servkit.getMachineName(machineId),
              format: ['text', 'text', 'text', 'text', '0.00', '0.00%'],
            },
          }),
        }
      },
    },
    preCondition: {
      getShiftList: function (done) {
        this.commons.getShiftList(done)
      },
      getUserListByGroup: function (done) {
        this.commons.getUserListByGroup(done)
      },
      getDowntimeCode: function (done) {
        this.commons.getDowntimeCode(done)
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
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
}
