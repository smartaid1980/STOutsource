export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.loadingBtn.done()
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [4, 5, 6, 7, 8, 9, 10, 11],
        excel: {
          fileName: 'CostCount',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
          ],
        },
      })

      context.commons.initOrderSampleAutocomplete(
        context.$orderId,
        context.$manageId,
        context.preCon.getProductList,
        context.preCon.getSampleList
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        try {
          context.loadingBtn.doing()
          context.getData(context)
        } catch (e) {
          console.debug(e)
          context.loadingBtn.done()
        }
      })
    },
    util: {
      $orderId: $('#order_id'),
      $manageId: $('#manage_id'),
      manageId: '',
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      getData: async (ctx) => {
        var orderId = ctx.$orderId.val()
        var manageId = ctx.$manageId.val()
        var orderOrSampleObj = ctx.commons.getMacro523ByOrderIdOrSampleId(
          orderId,
          manageId,
          ctx.preCon.getProductList,
          ctx.preCon.getSampleList
        )
        const costCountMap = await ctx.commons.getDateData(
          _.pluck(orderOrSampleObj, 'macro523')
        )

        hippo
          .newSimpleExhaler()
          .space('HUL_cost_count')
          .index('order_id', _.uniq(_.pluck(costCountMap, 'order_id')))
          .index('machine_id', _.uniq(_.pluck(costCountMap, 'machine_id')))
          .index('dates', _.uniq(_.pluck(costCountMap, 'date')).sort()) // 不排時序會亂掉
          .columns(
            'order_id',
            'machine_id',
            'date',
            'start_time',
            'end_time',
            'duration',
            'm522'
          )
          .exhale(function (data) {
            //管編alert
            if (data.exhalable.length && manageId) {
              ctx.commons.addAlertHtml(`【管編：${manageId}】`)
            } else if (data.exhalable.length && orderId) {
              var standard_id = _.find(ctx.preCon.getProductList, function (
                elem
              ) {
                return elem.order_id == orderId
              })
              standard_id = standard_id ? standard_id.standard_id : ''
              ctx.commons.addAlertHtml(`【管編：${standard_id}】`)
            }

            let result = []
            let format = 'YYYY/MM/DD HH:mm:ss'
            let hippoDateFormat = 'YYYYMMDDHHmmss'
            // 該單在該機台加工的紀錄
            let orderMachineMap = _.groupBy(
              data.exhalable,
              (elem) => `${elem.order_id}@@${elem.machine_id}`
            )
            _.each(orderMachineMap, (records) => {
              let orderId = records[0].order_id
              var orderObj = _.find(
                orderOrSampleObj,
                (obj) => obj.macro523 == orderId
              )
              let first300,
                last103,
                first100,
                isRegulate = false,
                isProducing = false,
                isWaiting = false,
                isOrderStart = false
              let [regulate_time, produce_time, maintain_time, waiting_time] = [
                0,
                0,
                0,
              ]
              let [orderTotalTime, waitTillEight, cncCostTotalTime] = [0, 0, 0] //訂單花費總時間, 機台下線待機時間, CNC成本總時間
              _.each(records, (obj) => {
                let m522 = obj.m522
                if (!first300 && m522 === '300') {
                  // find first
                  first300 = moment(obj.start_time, hippoDateFormat)
                  isRegulate = true
                  isWaiting = false
                  isOrderStart = true
                } else if (m522 === '103') {
                  // find last
                  last103 = moment(obj.start_time, hippoDateFormat)
                  isProducing = false
                  isWaiting = true
                  isOrderStart = false
                } else if (!first100 && m522 === '100') {
                  first100 = moment(obj.start_time, hippoDateFormat)
                  isProducing = true
                  isWaiting = false
                  isRegulate = false // 因為不一定會有 304 停止校車，所以當開始生產時也結束校車階段
                } else if (m522 === '304') {
                  // 結束校車
                  isRegulate = false
                }

                if (m522.startsWith('2') && m522 !== '206') {
                  // 維修: 只要有MACRO 522=2xx都要計算，同時扣掉macro=206的數據
                  maintain_time += parseInt(obj.duration)
                } else if (isRegulate) {
                  // 校車
                  regulate_time += parseInt(obj.duration)
                } else if (isProducing && m522 !== '104') {
                  //量產: 量產時間是100=>103的累計並要扣除維修(2xx)、校車(3xx)和待料(104)時間
                  produce_time += parseInt(obj.duration)
                } else if (isWaiting) {
                  // 待機: 103~300或103~100
                  waiting_time += parseInt(obj.duration)
                } else {
                  console.warn(`${obj} does not belongs to any status.`)
                  console.warn(obj)
                }

                if (isOrderStart) {
                  // 300~103
                  orderTotalTime += parseInt(obj.duration)
                }
              })

              cncCostTotalTime = orderTotalTime
              if (last103) {
                // 103~隔天早上八點
                let eight = moment(last103.format('YYYY/MM/DD') + ' 08:00:00')
                waitTillEight = eight - last103
                waitTillEight =
                  waitTillEight < 0
                    ? waitTillEight + 24 * 60 * 60 * 1000
                    : waitTillEight
                cncCostTotalTime += parseInt(waitTillEight) // 300~103~隔天早上八點
              }
              let prefix = last103 ? '' : '*' //若訂單尚未結束，訂單花費總時間、CNC成本總時間、量產時間前墜加上'*'表示還會增加

              result.push([
                /*訂單編號*/ orderObj && orderObj.order_id
                  ? orderObj.order_id
                  : '',
                /*機台名稱*/ servkit.getMachineName(records[0].machine_id),
                /*校車開始時間*/ first300 ? first300.format(format) : '---',
                /*訂單下線時間*/ last103 ? last103.format(format) : '---',
                /*訂單花費總時間*/ orderTotalTime !== 0
                  ? prefix + orderTotalTime.millisecondToDHMS()
                  : '---',
                /*機台下線待機時間*/ waitTillEight !== 0
                  ? waitTillEight.millisecondToDHMS()
                  : '---',
                /*CNC成本總時*/ cncCostTotalTime !== 0
                  ? prefix + cncCostTotalTime.millisecondToDHMS()
                  : '---',
                /*校車時間*/ regulate_time
                  ? regulate_time.millisecondToDHMS()
                  : '---',
                /*維修時間*/ maintain_time
                  ? maintain_time.millisecondToDHMS()
                  : '---',
                /*量產時間*/ produce_time
                  ? prefix + produce_time.millisecondToDHMS()
                  : '---',
                /*待機時間*/ waiting_time
                  ? waiting_time.millisecondToDHMS()
                  : '---',
                /*總天數*/ (
                  moment(_.last(records).end_time, 'YYYYMMDDHHmmss') -
                  moment(records[0].start_time, 'YYYYMMDDHHmmss')
                ).millisecondToDHMS('H'),
              ])
            })
            ctx.reportTable.drawTable(result)
            ctx.loadingBtn.done()
          })
      },
    },
    preCondition: {
      getProductList: function (done) {
        this.commons.getProductList(done)
      },
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/dataTables.sum.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
