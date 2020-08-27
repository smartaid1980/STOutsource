import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
      $('#machineId').select2()
      context.createMachineSelect()

      context.graphByDay = new Dygraph(
        document.getElementById('minChart'),
        context.file, // path to CSV file
        {
          showRangeSelector: true,
          labels: [
            'time',
            `${i18n('Absolute_Distance')}`,
            `${i18n('Current')}`,
          ],
          colors: ['#45739b', '#967d66'],
          legend: 'always',
          ylabel: `${i18n('Absolute_Distance')}(mm)`,
          y2label: `${i18n('Current')}`,
          digitsAfterDecimal: '3',
          series: {
            [`${i18n('Absolute_Distance')}`]: {
              axis: 'y',
            },
            [`${i18n('Current')}`]: {
              axis: 'y2',
            },
          },
          axes: {
            y: {},
            y2: {
              axisLabelFormatter: function (d) {
                var data = String(d)
                if (data.length > 4) {
                  if (data.search(/\./) === 1) {
                    return Math.floor(d * 100) / 100
                  } else if (data.search(/\./) === 2) {
                    return Math.floor(d * 10) / 10
                  }
                  return Math.floor(d)
                }
                return d
              },
            },
          },
        }
      )

      servkit.validateForm($('#selectForm'), $('#selectBtn'))
      $('#selectBtn').on('click', function () {
        context.hourData = {}
        context.loadBtn.doing()
        $('#minChart').children().addClass('hide')
        context.drawChart()
      })

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2018/06/20',
          endDate: '2018/06/28',
          machineId: '_FOXCONNP01D01M031',
        }
      }

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        $('#startDate').val(showdemoConfig.startDate)
        $('#endDate').val(showdemoConfig.endDate)
        $('#machineId').val(showdemoConfig.machine)
        $('#machineId').trigger('change')
        $('#selectBtn').trigger('click')
      })
    },
    util: {
      graphByDay: null,
      hourData: {},
      loadBtn: servkit.loadingButton(document.getElementById('selectBtn')),
      createMachineSelect: function () {
        var that = this
        servkit.initFuncBindMachineSelect(
          $('#machineId'),
          that.appId,
          that.funId
        )
      },
      drawChart: function () {
        var ctx = this
        var startDate = $('#startDate').val()
        var endDate = $('#endDate').val()
        var machineId = $('#machineId').val()
        var days = 0,
          thisDay = 0
        var dayData = []
        for (
          var d = new Date(startDate);
          d <= new Date(endDate);
          d.setDate(d.getDate() + 1)
        ) {
          var day = moment(d).format('YYYYMMDD')
          days++
          ctx.hourData[day] = []
          hippo
            .newSimpleExhaler()
            .space('position_current_hour')
            .index('machine_id', [machineId])
            .index('year', [day.slice(0, 4)])
            .index('month', [day.slice(4, 6)])
            .index('day', [day.slice(6, 8)])
            .index('hour', [
              '08',
              '09',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '16',
              '17',
              '18',
              '19',
              '20',
              '21',
              '22',
              '23',
              '00',
              '01',
              '02',
              '03',
              '04',
              '05',
              '06',
              '07',
            ])
            .columns('timestamp', 'status', 'y_position', 'current')
            .exhale(function (data) {
              thisDay++
              if (data.exhalable.length) {
                _.each(data.exhalable, (val) => {
                  if (!ctx.hourData[val.timestamp.slice(0, 8)]) {
                    ctx.hourData[val.timestamp.slice(0, 8)] = []
                  }
                  if (
                    !ctx.hourData[val.timestamp.slice(0, 8)][
                      val.timestamp.slice(8, 10)
                    ]
                  ) {
                    ctx.hourData[val.timestamp.slice(0, 8)][
                      val.timestamp.slice(8, 10)
                    ] = []
                  }
                  ctx.hourData[val.timestamp.slice(0, 8)][
                    val.timestamp.slice(8, 10)
                  ].push([
                    new Date(
                      moment(
                        val.timestamp.slice(0, 14),
                        'YYYYMMDDHHmmss'
                      ).format('YYYY/MM/DD HH:mm:ss')
                    ),
                    Number(val.y_position),
                    Number(val.current),
                  ])
                })
              }
              if (days === thisDay) {
                if (dayData.length > 1) {
                  new Dygraph(
                    document.getElementById('houeChart'),
                    dayData, // path to CSV file
                    {
                      showRangeSelector: true,
                      labels: [
                        'time',
                        `${i18n('Absolute_Distance')}`,
                        `${i18n('Current')}`,
                      ],
                      colors: ['#45739b', '#967d66'],
                      legend: 'always',
                      ylabel: `${i18n('Absolute_Distance')}(mm)`,
                      y2label: `${i18n('Current')}`,
                      title:
                        $('#machineId :selected').text() + `(${i18n('Day')})`,
                      digitsAfterDecimal: '3',
                      series: {
                        [`${i18n('Absolute_Distance')}`]: {
                          axis: 'y',
                        },
                        [`${i18n('Current')}`]: {
                          axis: 'y2',
                        },
                      },
                      axes: {
                        y: {},
                        y2: {
                          axisLabelFormatter: function (d) {
                            var data = String(d)
                            if (data.length > 4) {
                              if (data.search(/\./) === 1) {
                                return Math.floor(d * 100) / 100
                              } else if (data.search(/\./) === 2) {
                                return Math.floor(d * 10) / 10
                              }
                              return Math.floor(d)
                            }
                            return d
                          },
                        },
                      },
                      drawCallback: function (g) {
                        if (g.xAxisRange()[0]) {
                          var startDate = moment(g.xAxisRange()[0])
                          var endDate = moment(g.xAxisRange()[1])
                          if (endDate.diff(startDate, 'days') < 1) {
                            var dataByHour = []
                            if (startDate.isSame(endDate, 'day')) {
                              for (
                                var hour = parseInt(startDate.format('HH'));
                                hour <= parseInt(endDate.format('HH'));
                                hour++
                              ) {
                                dataByHour.push.apply(
                                  dataByHour,
                                  ctx.hourData[startDate.format('YYYYMMDD')][
                                    hour < 10 ? '0' + hour : String(hour)
                                  ]
                                )
                              }
                            } else {
                              for (
                                var startHour = parseInt(
                                  startDate.format('HH')
                                );
                                startHour <= 23;
                                startHour++
                              ) {
                                dataByHour.push.apply(
                                  dataByHour,
                                  ctx.hourData[startDate.format('YYYYMMDD')][
                                    startHour < 10
                                      ? '0' + startHour
                                      : String(startHour)
                                  ]
                                )
                              }
                              for (
                                var endHour = 0;
                                endHour <= parseInt(endDate.format('HH'));
                                endHour++
                              ) {
                                dataByHour.push.apply(
                                  dataByHour,
                                  ctx.hourData[endDate.format('YYYYMMDD')][
                                    endHour < 10
                                      ? '0' + endHour
                                      : String(endHour)
                                  ]
                                )
                              }
                            }
                            if (dataByHour.length > 1) {
                              $('#minChart').children().removeClass('hide')
                              ctx.graphByDay.updateOptions({
                                file: dataByHour,
                                title:
                                  $('#machineId :selected').text() +
                                  `(${i18n('Hour')})`,
                              })
                            }
                          } else {
                            $('#minChart').children().addClass('hide')
                          }
                        } else {
                          $('#minChart').children().addClass('hide')
                        }
                      },
                    } // options
                  )
                  $('#houeChart').children().removeClass('hide')
                } else {
                  $('#houeChart').children().addClass('hide')
                }
                ctx.loadBtn.done()
              }
            })
        }
        hippo
          .newSimpleExhaler()
          .space('position_current_day')
          .index('machine_id', [machineId])
          .indexRange('date', startDate, endDate)
          .columns('timestamp', 'status', 'y_position', 'current')
          .exhale(function (data) {
            dayData = _.map(data.exhalable, (val) => {
              return [
                new Date(
                  moment(val.timestamp.slice(0, 14), 'YYYYMMDDHHmmss').format(
                    'YYYY/MM/DD HH:mm:ss'
                  )
                ),
                Number(val.y_position),
                Number(val.current),
              ]
            })
          })
      },
    },
    preCondition: {},
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
      ['/js/plugin/dygraphs/dygraph-combined.min.js'],
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
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
