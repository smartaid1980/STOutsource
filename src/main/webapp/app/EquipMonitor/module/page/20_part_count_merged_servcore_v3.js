export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.initQueryParamForm()
      context.initReportTable()
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      $programNameSelect: $('#program_name'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      initQueryParamForm() {
        const context = this
        servkit.initDatePicker(context.$startDate, context.$endDate)
        servkit.initSelectWithList(
          context.preCon.getMachineByGroup,
          context.$machineSelect
        )

        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          context.table.hideWidget()
          context.detailTable.hideWidget()
          context.loadingBtn.doing()
          context.getSumData().then((data) => {
            const groupedData = context.groupSumData(data)
            context.drawTable(groupedData, context.sumTable)
            $('#sum-chart').show()
            context.drawChart(groupedData, $('#sum-chart'))
            $('html, body').animate(
              {
                scrollTop: context.sumTable.$tableWidget.offset().top,
              },
              500
            )
            context.loadingBtn.done()
          })
          // context.getData(context.$machineSelect.val(), context.$date.val(), function (exhalable) {
          //   context.reportTable.drawTable(_.map(exhalable.exhalable, function (elem) {
          //     return [
          //       servkit.getMachineName(elem.machine_id),
          //       //              elem.date,
          //       elem.work_shift,
          //       elem.program_name,
          //       // elem.op,
          //       elem.product_id,
          //       // (elem.std_minute ? elem.std_minute.toFixed(2) : elem.std_minute),
          //       elem.part_count,
          //       // elem.first_timestamp.date20BitsToFormatted(),
          //       elem.first_on_timestamp.date20BitsToFormatted(),
          //       context.getNextDataStartTimeAsEndTime(elem.last_on_timestamp.date20BitsToFormatted()),
          //       // elem.last_timestamp.date20BitsToFormatted(),
          //       elem.operate_millisecond.millisecondToXXmXXs()
          //     ];
          //   }));
          //   context.reporttable.showWidget();
          //   context.loadingBtn.done();
          // });
        })

        context.$machineSelect.on('change', function () {
          context.getProgramNameList().then((list) => {
            if (list.length) {
              servkit.initSelectWithList(list, context.$programNameSelect)
            } else {
              context.$programNameSelect.empty()
            }
          })
        })
        const getMachineId = function (machineName) {
          return (
            Object.values(servkit.getMachineMap()).find(
              (map) => map.device_name === machineName
            ).device_id || ''
          )
        }
        $('#showdemo').on('click', function (e) {
          e.preventDefault()
          context.$date.val('2016/04/15')
          context.$machineSelect.val(['Machine01', 'Machine02', 'Machine03'])
          context.$submitBtn.trigger('click')
        })

        $('#sum-chart').on('plotclick', function (e, position, item) {
          if (item) {
            const { datapoint, series } = item
            const tick = series.xaxis.ticks[datapoint[0]]
            const pkArray = tick.label.split('\n')
            pkArray[0] = getMachineId(pkArray[0])
            const data = context.groupedSumDataDetail[pkArray.join('@@')]
            context.table.showWidget()
            $('html, body').animate(
              {
                scrollTop: context.table.$tableWidget.offset().top,
              },
              500
            )
            context.table.drawTable(
              data.map((d) => [
                servkit.getMachineName(d.machine_id),
                d.date,
                d.program_name,
                d.partCount,
                d.sumOperateMillisecond,
                d.std_second,
              ])
            )
            $.plot(
              $('#chart'),
              [
                {
                  data: data.map((d, i) => [i, d.partCount]),
                  yaxis: 1,
                  label: '產出',
                  bars: {
                    show: true,
                  },
                  // color: "#6595B4"
                },
                {
                  data: data.map((d, i) => [i, d.std_second]),
                  yaxis: 2,
                  label: '工時',
                  // color: "#6595B4"
                },
              ],
              {
                // series: {
                //   bars: {
                //     show: true
                //   }
                // },
                bars: {
                  align: 'center',
                  barWidth: 0.7,
                  lineWidth: 1,
                },
                xaxes: [
                  {
                    // axisLabel: "{機台 / 加工程式}",
                    // axisLabelUseCanvas: true,
                    // axisLabelFontSizePixels: 12,
                    // axisLabelFontFamily: 'Verdana, Arial',
                    // axisLabelPadding: 10,
                    // min: 0
                    position: 'bottom',
                    ticks: _.map(data, function (elem, index) {
                      return [
                        index,
                        `${servkit.getMachineName(elem.machine_id)}\n${
                          elem.program_name
                        }\n${elem.date}`,
                      ]
                    }),
                  },
                ],
                yaxes: [
                  {
                    axisLabel: '顆數',
                    // min: 0,
                    position: 'left',
                  },
                  {
                    axisLabel: '標工',
                    // min: 0,
                    position: 'right',
                  },
                ],
                grid: {
                  clickable: true,
                  hoverable: true,
                },
                // tooltip: true,
                // tooltipOpts: {
                //   content: "%x.2 M "
                // }
              }
            )
          }
        })

        $('#chart').on('plotclick', function (e, position, item) {
          if (item) {
            const { datapoint, series } = item
            const tick = series.xaxis.ticks[datapoint[0]]
            const pkArray = tick.label.split('\n')
            let [machine_name, program_name, date] = pkArray
            const machine_id = getMachineId(machine_name)
            context.detailTable.showWidget()
            $('html, body').animate(
              {
                scrollTop: context.detailTable.$tableWidget.offset().top,
              },
              500
            )
            context.getData(machine_id, program_name, date).then((data) => {
              context.detailTable.drawTable(
                data.map((elem) => [
                  servkit.getMachineName(elem.machine_id),
                  elem.work_shift,
                  elem.program_name,
                  elem.product_id,
                  elem.part_count,
                  elem.first_on_timestamp.date20BitsToFormatted(),
                  context.getNextDataStartTimeAsEndTime(
                    elem.last_on_timestamp.date20BitsToFormatted()
                  ),
                  elem.operate_millisecond.millisecondToXXmXXs(),
                ])
              )
            })
          }
        })
      },
      initReportTable() {
        const context = this
        context.sumTable = createReportTable({
          $tableElement: $('#sum-table'),
          $tableWidget: $('#sum-table-widget'),
          rightColumn: [2, 3, 4],
          // excel: {
          //   fileName: 'PartCountMerged',
          //   format: ['text', 'text', 'text', 'text', '0', 'text', 'text', 'text']
          // }
        })
        context.table = createReportTable({
          $tableElement: $('#table'),
          $tableWidget: $('#table-widget'),
          rightColumn: [3, 4, 5],
          // excel: {
          //   fileName: 'PartCountMerged',
          //   format: ['text', 'text', 'text', 'text', '0', 'text', 'text', 'text']
          // }
        })
        context.detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: [4, 5, 6, 7],
          // excel: {
          //   fileName: 'PartCountMerged',
          //   format: ['text', 'text', 'text', 'text', '0', 'text', 'text', 'text']
          // }
        })
        $('#sum-chart').hide()
        context.table.hideWidget()
        context.detailTable.hideWidget()
      },
      getProgramNameList() {
        const context = this
        const { $machineSelect, $startDate, $endDate } = context
        const space = 'part_count_merged_summary'
        return new Promise((res) => {
          hippo
            .newSimpleExhaler()
            .space(space)
            .index('machine_id', $machineSelect.val())
            .indexRange('date', $startDate.val(), $endDate.val())
            .columns('program_name')
            .exhale((exhalable) =>
              res(
                _.chain(exhalable.exhalable)
                  .pluck('program_name')
                  .uniq()
                  .sort()
                  .value()
              )
            )
        })
      },
      // YYYY/MM/DD HH:mm:ss + 2s 以下一筆資料開始時間(2秒後)作為當前資料的結束時間
      getNextDataStartTimeAsEndTime(time) {
        var orgDate = new Date(time)
        var millisecond = 1000
        var newDate = new Date(orgDate.getTime() + 2 * millisecond)
        return moment(newDate).format('YYYY/MM/DD HH:mm:ss')
      },
      // initMachineSelect () {
      //   var machineSelectHtml = '';
      //   servkit.eachMachine(function (id, name) {
      //     machineSelectHtml += '<option style="padding:3px 0 3px 3px;" value="' + id + '" selected>' + name + '</option>';
      //   });
      //   this.$machineSelect.append(machineSelectHtml);
      //   servkit.multiselectHeightOptimization(this.$machineSelect[0]);
      //   this.$machineSelect.on("mousedown", servkit.multiselectWithoutCtrlMouseDown)
      //     .on("mousemove", servkit.multiselectWithoutCtrlMouseMove);
      // },
      getData(machine_id, program_name, date) {
        const context = this

        return new Promise((res) =>
          hippo
            .newSimpleExhaler()
            .space('part_count_merged')
            .index('machine_id', [machine_id])
            .indexRange('date', date, date)
            .columns(
              'machine_id',
              'date',
              'work_shift',
              'program_name',
              'op',
              'product_id',
              'std_minute',
              'part_count',
              'first_timestamp',
              'first_on_timestamp',
              'last_on_timestamp',
              'last_timestamp',
              'operate_millisecond'
            )
            .exhale(function (exhalable) {
              res(exhalable.exhalable)
            })
        )
      },
      getSumData() {
        const context = this
        const machineList = context.$machineSelect
          .val()
          .filter((v) => v !== 'ALL')
        const startDate = context.$startDate.val()
        const endDate = context.$endDate.val()
        const programNameList = context.$programNameSelect.val()
        const programNameSet = new Set(programNameList)
        return new Promise((res) =>
          hippo
            .newSimpleExhaler()
            .space('part_count_merged_summary')
            .index('machine_id', machineList)
            .indexRange('date', startDate, endDate)
            .columns(
              'date',
              'machine_id',
              'program_name',
              'sumOperateMillisecond',
              'partCount',
              'std_second'
            )
            .exhale(function (exhalable) {
              res(
                exhalable.exhalable.filter((data) =>
                  programNameSet.has(data.program_name)
                )
              )
            })
        )
      },
      groupSumData(data) {
        const context = this
        context.groupedSumDataDetail = _.groupBy(
          data,
          (d) => `${d.machine_id}@@${d.program_name}`
        )
        context.groupedSumData = _.mapObject(
          context.groupedSumDataDetail,
          (value, key) => {
            return value.reduce((a, x) => {
              if (_.isEmpty(a)) {
                a.machine_id = x.machine_id
                a.program_name = x.program_name
                a.sumOperateMillisecond = x.sumOperateMillisecond
                a.partCount = x.partCount
                a.std_second = x.std_second
              }
              a.sumOperateMillisecond += x.sumOperateMillisecond
              a.partCount += x.partCount
              a.std_second += x.std_second
              return a
            }, {})
          }
        )
        return Object.values(context.groupedSumData)
        // return Object.values(data.reduce((a, x) => {
        //   const {
        //     machine_id,
        //     program_name
        //   } = x;
        //   const key = `${machine_id}@@${program_name}`;
        //   if (a[key]) {
        //     a[key].sumOperateMillisecond += x.sumOperateMillisecond;
        //     a[key].partCount += x.partCount;
        //     a[key].std_second += x.std_second;
        //   } else {
        //     a[key] = _.omit(x, 'date');
        //   }
        //   return a;
        // }, {}));
      },
      drawChart(data, $container) {
        $.plot(
          $container,
          [
            {
              data: data.map((d, i) => [i, d.partCount]),
              yaxis: 1,
              label: '總產出',
              bars: {
                show: true,
              },
              // color: "#6595B4"
            },
            {
              data: data.map((d, i) => [i, d.std_second]),
              yaxis: 2,
              label: '平均工時',
              // color: "#6595B4"
            },
          ],
          {
            // series: {
            //   bars: {
            //     show: true
            //   }
            // },
            bars: {
              align: 'center',
              barWidth: 0.5,
              // lineWidth: 1
            },
            xaxes: [
              {
                // axisLabel: "{機台 / 加工程式}",
                // axisLabelUseCanvas: true,
                // axisLabelFontSizePixels: 12,
                // axisLabelFontFamily: 'Verdana, Arial',
                // axisLabelPadding: 10,
                // min: 0
                position: 'bottom',
                ticks: _.map(data, function (elem, index) {
                  return [
                    index,
                    `${servkit.getMachineName(elem.machine_id)}\n${
                      elem.program_name
                    }`,
                  ]
                }),
              },
            ],
            yaxes: [
              {
                axisLabel: '總顆數',
                // min: 0,
                position: 'left',
              },
              {
                axisLabel: '平均標工',
                // min: 0,
                position: 'right',
              },
            ],
            grid: {
              clickable: true,
            },
            // tooltip: true,
            // tooltipOpts: {
            //   content: "%x.2 M "
            // }
          }
        )
      },
      drawTable(data, table) {
        table.drawTable(
          data.map((d) => [
            servkit.getMachineName(d.machine_id),
            d.program_name,
            d.partCount,
            d.sumOperateMillisecond,
            d.std_second,
          ])
        )
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      getMachineByGroup(done) {
        this.commons.getMachineByGroup(done)
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip-0.9.0.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
    ],
  })
}
