import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  fetchDbData,
  ajax,
} from '../../../../js/servtech/module/servkit/ajax.js'
import {
  colors as servkitColors,
  fonts,
} from '../../../../js/servtech/module/servkit/var.js'
import {
  loadingButton,
  initDatePicker,
  validateForm,
  initSelect2WithData,
} from '../../../../js/servtech/module/servkit/form.js'
import servkit from '../../../../js/servtech/module/servkit/servkit.js'
import lotPurposeMap from '../lotPurposeMap.js'

export default async function () {
  const employeeMap = await fetchDbData('a_yihcheng_employee')
    .then((data) =>
      Object.fromEntries(data.map(({ emp_id, emp_name }) => [emp_id, emp_name]))
    )
    .catch((err) => {
      console.warn('fetch employee data error', err)
      return {}
    })

  const productMap = await fetchDbData('a_servtrack_product', {
    columns: ['product_id', 'product_name'],
  }).then((data) =>
    Object.fromEntries(
      data.map(({ product_id, product_name }) => [product_id, product_name])
    )
  )

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      lotPurposeMap,
      employeeMap,
      productMap,
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $selectProduct: $('#productName'),
      $submitBtn: $('#submit-btn'),
      submitLoadingBtn: loadingButton(document.getElementById('submit-btn')),
      $barChartTitle: $('#bar-chart-title'),
      $barChartStatus: $('#bar-chart-status'),
      $barChart: $('#bar-chart'),
      $queryInfo: $('.queryInfo'),
      $modalInfo: $('.modalInfo'),
      $modal: $('#modal'),
      $modalChartTitle: $('#modal-chart-title'),
      $modalBarChart: $('#modal-bar-chart'),
      queryInfoTemplate: _.template(
        '<span>' +
          ` ${i18n('ServTrack_000015')}:<%= startDate %>~<%= endDate %><br>` +
          ` ${i18n('ServTrack_000012')}:<%= productName %><br>` +
          ` ${i18n(
            'ServTrack_000019'
          )}:<%- moment().format("YYYY/MM/DD HH:mm:ss") %><br>` +
          '</span>'
      ),
      modalInfoTemplate: _.template(
        '    <dl>' +
          ' <dd><%= productName %></dd>' +
          ' <dd><%= startDate %> ~ <%= endDate %></dd>' +
          '</dl>'
      ),
      main() {
        const context = this

        // init
        context.initSumTable()
        context.initDetailTable()
        context.initQueryForm()
        context.initDemoData()

        const barChartStatus = `<div class="chart-legend">
          <div class="btn" style="background:${servkitColors.green}"></div>
          <div>${i18n('ServTrack_000135')}</div>
        </div>
        <div class="chart-legend">
          <div class="btn" style="background:none; border: 2px solid${
            servkitColors.red
          }"></div>
          <div>${i18n('ServTrack_000146')}</div>
        </div>`
        context.$barChartStatus.html(barChartStatus)

        context.$barChart.on('plotclick', function (event, pos, item) {
          if (item) {
            var key = item.series.xaxis.ticks[item.datapoint[0]].label
            context.$modalChartTitle.text(key)
            context.drawPlatoChart(context.modalData[key])
            context.$modal.modal('toggle')
          }
        })
      },
      initSumTable() {
        const context = this
        context.sumTable = createReportTable({
          $tableElement: $('#sum-table'),
          rightColumn: [3, 4, 5, 6, 7],
          onRow(row, data) {
            // 若 良率 低於 產品製程目標值 ，則以紅字顯示
            if (Number(data[7]) < Number(data[6])) {
              $(row)
                .find('td')
                .eq(7)
                .html(
                  '<font style="color:' +
                    servkitColors.red +
                    ';">' +
                    data[7] +
                    '</font>'
                )
            }
          },
          onDraw(tableData, pageData) {
            context.drawChart(pageData)
          },
          excel: {
            fileName: '10_product_process_quality',
            format: [
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
      },
      initDetailTable() {
        const context = this
        context.detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          rightColumn: [13, 14, 15, 16, 17],
          onRow(row, data) {
            const yieldValue = Number(data[17])
            const targetValue = Number(data[16])
            // 若 良率 低於 產品製程目標值 ，則以紅字顯示
            if (yieldValue < targetValue) {
              $(row)
                .find('td')
                .eq(17)
                .html(
                  `<font style="color:${servkitColors.red};">${yieldValue}</font>`
                )
            }
          },
          excel: {
            fileName: '10_tracking_detail',
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
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        })
      },
      initQueryForm() {
        const context = this

        initDatePicker(context.$startDate, context.$endDate, true)
        initSelect2WithData(context.$selectProduct, context.productMap, true, {
          minimumInputLength: 0,
        })
        validateForm($('#main-form'), context.$submitBtn)

        context.$submitBtn.on('click', function (evt) {
          context.submitHandler(evt)
        })
      },
      submitHandler(evt) {
        const context = this

        evt.preventDefault()
        context.submitLoadingBtn.doing()

        const startDate = context.$startDate.val()
        const endDate = context.$endDate.val()
        const productId = context.$selectProduct.val()
        const escapedProductId = context.commons.checkEscapeSymbol(productId)
        const productName = context.productMap[productId]

        context.sumData = null
        context.detailData = null
        context.modalData = null
        context.$queryInfo.html(
          context.queryInfoTemplate({
            startDate,
            endDate,
            productName,
          })
        )
        context.$modalInfo.html(
          context.modalInfoTemplate({
            startDate,
            endDate,
            productName,
          })
        )

        Promise.all([
          context.fetchProcessQuality(startDate, endDate, escapedProductId),
          context.fetchTrackingData(startDate, endDate, escapedProductId),
          context.fetchTrackingNG(startDate, endDate, escapedProductId),
        ])
          .then(([sumData, detailData, modalData]) => {
            context.sumData = sumData
            context.detailData = detailData
            context.modalData = _.groupBy(modalData, function (elem) {
              return elem.op + ',' + elem.process_name
            })
            context.drawSumTable()
            context.drawDetailTable()
          })
          .then(() => {
            context.submitLoadingBtn.done()

            context.$barChartTitle.html(
              `${i18n('ServTrack_000012')} : ${productName}`
            )
          })
      },
      initDemoData() {
        const context = this

        context.commons.dynamicDemo(context)
        servkit.fetchDemoConfigPromise.then((config) => {
          const showdemoConfig = config?.[context.appId]?.[context.funId] || {
            startDate: '2017/09/01',
            endDate: '2017/09/30',
            product: 'and630_1m',
          }

          $('#demo-btn').on('click', function (evt) {
            evt.preventDefault()
            context.$startDate.val(showdemoConfig.startDate)
            context.$endDate.val(showdemoConfig.endDate)
            context.$selectProduct
              .val(showdemoConfig.product)
              .trigger('change.select2') // only for select2 plugin
            context.$submitBtn.click()
          })
        })
      },
      fetchProcessQuality(startDate, endDate, productId) {
        return new Promise((res, rej) =>
          ajax(
            {
              url: 'api/servtrack/productprocessquality/readprocessquality',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                startDate,
                endDate,
                productId,
              }),
            },
            {
              success(data) {
                res(data)
              },
              fail(data) {
                rej(data)
              },
            }
          )
        )
      },
      drawSumTable() {
        this.sumTable.drawTable(
          _.map(this.sumData, function (elem) {
            return [
              /*產品*/
              elem.product_name,
              /*工序*/
              elem.op,
              /*製程*/
              elem.process_name,
              /*總產量*/
              elem.output,
              /*良品數*/
              elem.go_quantity,
              /*不良數*/
              elem.ng_quantity,
              /*目標值*/
              elem.op_quality_sp
                ? parseFloat(elem.op_quality_sp).toFixed(2)
                : parseFloat(90).toFixed(2),
              /*製程良率*/
              parseFloat((elem.go_quantity / elem.output) * 100).toFixed(2),
            ]
          })
        )
      },
      fetchTrackingData(startDate, endDate, productId) {
        return new Promise((res, rej) =>
          ajax(
            {
              url: 'api/yihcheng/productprocessquality/readtracking',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                startDate: startDate,
                endDate: endDate,
                productId: productId,
              }),
            },
            {
              success(data) {
                res(data)
              },
              fail(data) {
                rej(data)
              },
            }
          )
        )
      },
      drawDetailTable() {
        const context = this
        context.detailTable.drawTable(
          _.map(context.detailData, function (elem) {
            return [
              /*工序*/
              elem.op,
              /*製程*/
              elem.process_name,
              /*班次日期*/
              elem.shift_day.replace(/-/g, '/'),
              /*班次*/
              elem.shift || '',
              /*線別*/
              elem.line_name,
              /*派工單號*/
              elem.work_id,
              /*產品*/
              elem.product_name,
              /*進站時間*/
              moment(elem.move_in).format('YYYY/MM/DD HH:mm:ss'),
              /*出站時間*/
              moment(elem.move_out).format('YYYY/MM/DD HH:mm:ss'),
              /*模號*/
              elem.mold_id || '',
              /*刀號*/
              elem.tool_id || '',
              /*人員*/
              employeeMap[elem.employee_id] || elem.employee_id || '',
              /*拆單目的*/
              context.lotPurposeMap[elem.lot_purpose] || '',
              /*產量*/
              elem.output,
              /*良品數*/
              elem.go_quantity,
              /*不良數*/
              elem.ng_quantity,
              /*目標值*/
              elem.op_quality_sp
                ? parseFloat(elem.op_quality_sp).toFixed(2)
                : parseFloat(90).toFixed(2),
              /*良率*/
              elem.quality,
            ]
          })
        )
      },
      fetchTrackingNG(startDate, endDate, productId) {
        return new Promise((res, rej) =>
          ajax(
            {
              url: 'api/servtrack/productprocessquality/readtrackingng',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                startDate,
                endDate,
                productId,
              }),
            },
            {
              success(data) {
                res(data)
              },
              fail(data) {
                rej(data)
              },
            }
          )
        )
      },
      drawChart(pageData) {
        const chartData = []
        const colors = []
        const ticks = []
        let key
        let isAchieved
        let color
        pageData.forEach((data, index) => {
          key = data[1] + ',' + data[2]
          isAchieved = Number(data[7]) >= Number(data[6])
          color = isAchieved ? servkitColors.green : servkitColors.red

          //bar
          chartData.push({
            label: index,
            bars: {
              fillColor: color,
            },
            valueLabels: {
              show: true,
              labelFormatter(v) {
                return parseFloat(v).toFixed(2) + '%'
              },
              font: '12pt ' + fonts,
              valign: 'above', // above, below, middle, bottom
            },
            data: [[index, parseFloat(data[7])]],
          })
          colors.push(color)
          ticks.push([index, key])

          //stack
          if (!isAchieved) {
            //bar
            chartData.push({
              label: index,
              bars: {
                fill: false,
              },
              data: [[index, parseFloat(data[6] - data[7])]],
            })
            colors.push(color)
          }
        })

        var options = {
          colors: colors,
          series: {
            stack: true,
            bars: {
              show: true,
              align: 'center',
              barWidth: 0.2,
            },
          },
          tooltip: true,
          tooltipOpts: {
            content: "<div class='hide'>%x</div><span>%y.2(%)</span>", // 爛 plugin, 竟然一定要有%x
            defaultTheme: false,
          },
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          xaxis: {
            ticks: ticks,
          },
          yaxis: {
            max: 125,
            tickFormatter(v) {
              return v + '.00%'
            },
          },
        }

        $.plot(this.$barChart, chartData, options)
      },
      drawPlatoChart(processNgData) {
        const processNgDataSortByQty = _.sortBy(
          processNgData,
          ({ ng_quantity }) => {
            return Number(ng_quantity)
          }
        ).reverse()

        const ticks = []
        const barData = []
        const lineData = []
        const ngQtySum = processNgDataSortByQty.reduce(
          (acc, { ng_quantity }) => {
            return acc + Number(ng_quantity)
          },
          0
        )
        let accumulatedNgQty = 0
        let ngQty

        processNgDataSortByQty.forEach((data, index) => {
          ngQty = Number(data.ng_quantity)
          ticks.push([index, data.ng_name])
          barData.push([index, ngQty])

          accumulatedNgQty += ngQty
          lineData.push([index, (accumulatedNgQty / ngQtySum) * 100])
        })

        const chartDatas = [
          {
            data: barData,
            color: servkitColors.blue,
            bars: {
              align: 'center',
              show: true,
              barWidth: 1,
            },
            valueLabels: {
              show: true,
              font: '12pt ' + fonts,
              valign: 'above', // above, below, middle, bottom
            },
          },
          {
            data: lineData,
            yaxis: 2,
            color: servkitColors.orange,
            points: {
              show: true,
              symbol: 'circle',
              fillColor: servkitColors.orange,
            },
            lines: {
              show: true,
            },
          },
        ]

        const font = {
          size: 14,
          color: 'black',
        }
        const options = {
          tooltip: true,
          tooltipOpts: {
            content: "<b class='hide'>%x</b><span>%y</span>",
            defaultTheme: false,
          },
          grid: {
            hoverable: true,
            clickable: true,
            labelMargin: 30, // prevent bar from overlapped by yaxis tick
            margin: 20,
          },
          xaxis: {
            ticks,
            font,
          },
          yaxes: [
            {
              position: 'left',
              font,
              minTickSize: 1,
              max: ngQtySum,
              tickFormatter(v) {
                return v.toFixed(0)
              },
            },
            {
              position: 'right',
              font,
              min: 0,
              max: 100,
              minTickSize: 20,
              tickFormatter(v) {
                return v + '%'
              },
            },
          ],
        }

        $.plot(this.$modalBarChart, chartDatas, options)
        this.$modalBarChart.find('.xAxis>div').css({
          'transform': 'translateX(-50%)',
          'word-break': 'break-all',
        })
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/servtech/cosmos/jquery.flot.valuelabels-2.2.0.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
      ['/js/plugin/bootstrapvalidator/bootstrapValidator.min.js'],
    ],
  })
}
