import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import { fetchDbData } from '../../../../js/servtech/module/servkit/ajax.js'
import {
  initSelect2WithData,
  initSelectWithList,
} from '../../../../js/servtech/module/servkit/form.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
import { hasOwnProperty } from '../../../../js/servtech/module/servkit/util.js'

export default async function () {
  const [divisionData, processData, productData] = await Promise.all([
    fetchDbData('a_yihcheng_division', {
      columns: ['division_id', 'division_name', 'is_open'],
    }).catch((err) => {
      console.warn('fetch division error', err)
      return []
    }),
    fetchDbData('a_servtrack_process', {
      columns: ['process_code', 'process_name', 'is_open', 'division_id'],
      whereClause: "is_open='Y' and process_code!='common_process'",
    }).catch((err) => {
      console.warn('fetch process error', err)
      return []
    }),
    fetchDbData('a_servtrack_product', {
      columns: ['product_id', 'product_name', 'is_open'],
    }).catch((err) => {
      console.warn('fetch product error', err)
      return []
    }),
  ])
  const divisionMap = divisionData.reduce((acc, data) => {
    if (data.is_open === 'Y') {
      acc[data.division_id] = data
    }
    return acc
  }, {})
  const processMap = processData.reduce((acc, data) => {
    if (data.is_open === 'Y') {
      acc[data.process_code] = data
    }
    return acc
  }, {})
  const divisionProcessMap = Object.values(processMap).reduce((acc, data) => {
    if (!hasOwnProperty(divisionMap, data.division_id)) {
      return acc
    }
    if (hasOwnProperty(acc, data.division_id)) {
      acc[data.division_id].push(data.process_code)
    } else {
      acc[data.division_id] = [data.process_code]
    }
    return acc
  }, {})
  const productMap = productData.reduce((acc, data) => {
    if (data.is_open === 'Y') {
      acc[data.product_id] = data
    }
    return acc
  }, {})
  GoGoAppFun({
    gogo: function gogo(context) {
      // 初始
      servkit.initDatePicker($('#start'), $('#end'))
      // servkit.initSelectWithList(context.preCon.getProcessData, $('#op'))
      const productOptionMap = _.mapObject(
        productMap,
        ({ product_name }) => product_name
      )
      const divisionOptionMap = _.mapObject(
        divisionMap,
        ({ division_name }) => division_name
      )
      initSelect2WithData(
        document.getElementById('product-select'),
        productOptionMap,
        true,
        {
          minimumInputLength: 0,
          multiple: true,
        }
      )
      select2AllowClearHelper(document.getElementById('product-select'))
      initSelectWithList(divisionOptionMap, $('#division-select'))
      $('#op').select2({
        minimumInputLength: 0,
        multiple: true,
        data() {
          return {
            results: context.processCodeList.map((process_code) => ({
              id: process_code,
              text: processMap[process_code].process_name,
            })),
          }
        },
      })
      $('#division-select').on('change', function () {
        const divisionList = $(this).val()
        const processCodeList =
          divisionList && divisionList.length
            ? _.chain(divisionProcessMap)
                .pick(divisionList)
                .values()
                .flatten(true)
                .value()
            : []
        const processCodeVal = $('#op').select2('val')
        // 製程清單改變，已選中的製程要拿掉不存在清單中的
        if (processCodeVal && processCodeVal.length) {
          $('#op').select2(
            'val',
            processCodeVal.filter((code) => processCodeList.includes(code))
          )
        }
        context.processCodeList = processCodeList
      })
      var rowData = [
        {
          key: 'defective',
          name: `${i18n('Defective_Quantity')}`,
        },
        {
          key: 'output',
          name: `${i18n('Total_Process_Production')}`,
        },
        {
          key: 'defective_rate',
          name: `${i18n('Defective_Rate')}(%)`,
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
        const op = $('#op').select2('val')
        const opText = op
          .map((val) => {
            return processMap[val].process_name
          })
          .join('，')
        const division_id = $('#division-select').val()
        const product_id = $('#product-select').select2('val')
        const requestData = {
          startDate: $('#start').val(),
          endDate: $('#end').val(),
          processCodes: op,
          division_id,
        }
        $('#op-text').text(opText)
        $('#info').removeClass('hide')
        $('#chart').toggle('hide', false)
        if (product_id && product_id.length) {
          requestData.product_id = product_id
        }

        servkit.ajax(
          {
            url: 'api/strongled/kpi-view-table/ng-quality',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
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
        `${i18n('Defective_Reason')}`,
        rowData,
        context.getData,
        10
      )
      context.reason.custData = context.getCustData

      rowData[1].name = `${i18n('Production_Number')}` // 只有第一個要顯示「製程生產總數」，其他顯示「生產數」

      context.product = context.commons.defectiveResultAnalysis(
        1,
        6,
        `${i18n('Product')}`,
        rowData,
        context.getData
      )
      context.product.custData = context.getCustData
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
      context.line.custData = context.getCustData
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
      processCodeList: [],
      divisionMap,
      processMap,
      divisionProcessMap,
      productMap,
      getData: function (chartData, processData) {
        return _.map(chartData, (val) => {
          var rateResult = ((val.ngQuantity / val.output) * 100).toFixed(2)
          var data = {
            name: [],
            defective: val.ngQuantity,
            output: val.output,
            child: val.products,
            defective_rate: isFinite(rateResult) ? rateResult : 0,
          }
          _.each(val, (v, k) => {
            var value = v
            if (processData) {
              if (k === 'processCode') value = processData[value]
              if (!_.isArray(v) && k !== 'ngQuantity' && k !== 'output')
                data.name.push(value)
            } else {
              if (_.isArray(v)) data.child = v
              else if (k !== 'ngQuantity' && k !== 'output') data.name.push(v)
            }
          })
          return data
        })
      },
      draw: function (chartData) {
        var ctx = this
        // 繪製
        ctx.reason.data = ctx.getData(chartData, ctx.preCon.getProcessData)
        ctx.reason.refresh()
        ctx.loadingBtn.done()
      },
      getCustData: function (all, value, key) {
        if (key === 'defective_rate') {
          var result = ((all.defective / all.output) * 100).toFixed(2)
          return isFinite(result) ? result : 0
        } else return value
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
