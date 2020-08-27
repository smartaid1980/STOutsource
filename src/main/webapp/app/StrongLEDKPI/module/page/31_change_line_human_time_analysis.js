import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      // 初始
      servkit.initDatePicker($('#start'), $('#end'))
      servkit.initSelectWithList(context.preCon.getProcessData, $('#op'))
      var rowData = [
        {
          key: 'defective',
          name: `${i18n('Change_Line_Human_Time')}`,
        },
      ]
      var demoData = [
        {
          processCode: '組裝',
          ngName: '偏移',
          ngQuantity: 24,
          output: 388,
          products: [
            {
              productName: 'AC1A',
              ngQuantity: 10,
              output: 300,
              lines: [
                {
                  lineName: 'ASSY3',
                  ngQuantity: 4,
                  output: 120,
                },
                {
                  lineName: 'ASSY1',
                  ngQuantity: 3,
                  output: 80,
                },
                {
                  lineName: 'ASSY2',
                  ngQuantity: 2,
                  output: 50,
                },
                {
                  lineName: 'ASSY4',
                  ngQuantity: 1,
                  output: 50,
                },
              ],
            },
            {
              productName: 'AP9D',
              ngQuantity: 5,
              output: 20,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
            {
              productName: 'CP1',
              ngQuantity: 4,
              output: 15,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
            {
              productName: 'LK2Q',
              ngQuantity: 3,
              output: 13,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
            {
              productName: 'CV4C',
              ngQuantity: 1,
              output: 10,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
            {
              productName: 'CV3E',
              ngQuantity: 1,
              output: 10,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
            {
              productName: 'p1',
              ngQuantity: 0,
              output: 10,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
            {
              productName: 'p2',
              ngQuantity: 0,
              output: 10,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '貼片',
          ngName: '虛焊',
          ngQuantity: 20,
          output: 78,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '灌膠',
          ngName: '空洞',
          ngQuantity: 18,
          output: 60,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '貼片',
          ngName: '性能不良',
          ngQuantity: 15,
          output: 40,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '灌膠',
          ngName: '異物',
          ngQuantity: 9,
          output: 20,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '貼片',
          ngName: '外觀不良',
          ngQuantity: 7,
          output: 10,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '灌膠',
          ngName: '氣泡',
          ngQuantity: 7,
          output: 10,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '灌膠',
          ngName: '高翹',
          ngQuantity: 4,
          output: 10,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '貼片',
          ngName: '原材料不良',
          ngQuantity: 2,
          output: 8,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: '組裝',
          ngName: '錯件',
          ngQuantity: 2,
          output: 5,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason1',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason2',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason3',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason4',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason5',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason6',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason7',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason8',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason9',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
        {
          processCode: 'reason10',
          ngQuantity: 2,
          output: 3,
          products: [
            {
              productName: 'ppp',
              ngQuantity: 20,
              output: 100,
              lines: [
                {
                  lineName: 'lll',
                  ngQuantity: 20,
                  output: 100,
                },
              ],
            },
          ],
        },
      ]

      // 查詢
      servkit.validateForm($('#form'), $('#query-btn'))
      $('#query-btn').on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()
        var text = (text = _.map($('#op').val(), (val) => {
          return context.preCon.getProcessData[val]
        }).join('，'))
        if (
          _.find($('#op').val(), (val) => {
            return val === 'ALL'
          })
        ) {
          if (
            $('#op').val().length ===
            Object.keys(context.preCon.getProcessData).length + 1
          )
            text = `ALL( ${i18n('Whole_Factory')} )`
          else text = text.slice(1, text.length)
        }
        $('#op-text').text(text)
        $('#info').removeClass('hide')
        if ($('#chart').hasClass('hide')) $('#chart').removeClass('hide')

        servkit.ajax(
          {
            url: 'api/strongled/kpi-view-table/changeOverTime',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              startDate: $('#start').val(),
              endDate: $('#end').val(),
              processCodes: $('#op').val(),
            }),
          },
          {
            success: function (response) {
              context.draw(response)
            },
            fail: function () {
              context.draw(demoData)
            },
          }
        )
      })
      context.reason = context.commons.defectiveResultAnalysis(
        0,
        12,
        `${i18n('Invalid_Person')}`,
        rowData,
        context.getData,
        10
      )

      context.product = context.commons.defectiveResultAnalysis(
        1,
        6,
        `${i18n('Product')}`,
        rowData,
        context.getData
      )
      context.product.changeTableColumn(true)
      context.product.filterCh = true
      context.reason.child = context.product

      context.line = context.commons.defectiveResultAnalysis(
        2,
        6,
        `${i18n('Line')}`,
        rowData,
        context.getData
      )
      context.line.changeTableColumn(true)
      context.product.child = context.line

      // 有帶預設值
      if (
        servkit.getURLParameter('start') &&
        servkit.getURLParameter('end') &&
        servkit.getURLParameter('op')
      ) {
        $('#start').val(
          moment(servkit.getURLParameter('start')).format('YYYY/MM/DD')
        )
        $('#end').val(
          moment(servkit.getURLParameter('end')).format('YYYY/MM/DD')
        )
        $('#op').val(servkit.getURLParameter('op').split(','))
        $('#query-btn').trigger('click')
      }
    },
    util: {
      reason: null,
      product: null,
      line: null,
      loadingBtn: servkit.loadingButton(document.querySelector('#query-btn')),
      getData: function (chartData, processData, invalidData) {
        return _.map(chartData, (val) => {
          var data = {
            name: [],
            defective: val.invalid_duration,
            child: val.productNameList,
          }
          _.each(val, (v, k) => {
            var value = v
            if (processData) {
              if (k === 'process_code') value = processData[value]
              if (k === 'invalid_id') value = invalidData[value]
              if (!_.isArray(v) && k !== 'invalid_duration' && k !== 'output')
                data.name.push(value)
            } else {
              if (_.isArray(v)) data.child = v
              else if (k !== 'invalid_duration' && k !== 'output')
                data.name.push(v)
            }
          })
          return data
        })
      },
      draw: function (chartData) {
        var ctx = this
        // 繪製
        ctx.reason.data = ctx.getData(
          chartData,
          ctx.preCon.getProcessData,
          ctx.preCon.getInvalidData
        )
        ctx.reason.refresh()
        ctx.loadingBtn.done()
      },
    },
    preCondition: {
      getProcessData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: `is_open='Y' and process_code!='common_process'`,
            }),
          },
          {
            success: function (data) {
              var processData = {}
              _.each(data, function (elem) {
                processData[elem.process_code] = elem.process_name
              })
              done(processData)
            },
          }
        )
      },
      getInvalidData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_invalid_reason',
              columns: ['invalid_id', 'invalid_name'],
            }),
          },
          {
            success: function (data) {
              var invalidData = {}
              _.each(data, function (elem) {
                invalidData[elem.invalid_id] = elem.invalid_name
              })
              done(invalidData)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.dashes.min.js',
      ],
    ],
  })
}
