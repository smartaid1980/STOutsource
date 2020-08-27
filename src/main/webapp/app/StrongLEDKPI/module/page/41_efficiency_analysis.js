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
          key: 'real_workhour',
          name: `${i18n('Operation')}`,
        },
        {
          key: 'invalidhour_eff',
          name: `${i18n('Invalid')}`,
        },
        {
          key: 'std_workhour',
          name: `${i18n('Standard')}`,
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
          startDate: moment($('#start').val()).format('YYYY-MM-DD'),
          endDate: moment($('#end').val()).format('YYYY-MM-DD'),
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
            url: 'api/strongled/kpi-view-table/kpiEffTable',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
          },
          {
            success: function (response) {
              context.draw(
                response.sort(function (a, b) {
                  return (
                    new Date(context.year + ' ' + a.range).getTime() -
                    new Date(context.year + ' ' + b.range).getTime()
                  )
                })
              )
            },
            fail: function () {
              context.draw()
            },
          }
        )
      })
      context.reason = context.commons.efficiencyAnalysis(
        0,
        12,
        `${i18n('Efficiency_Statistics')}`,
        rowData,
        context.getData,
        10
      )
      context.reason.dataShowType = ['line', 'line']

      context.product = context.commons.efficiencyAnalysis(
        1,
        6,
        `${i18n('Product')}`,
        rowData,
        context.getData
      )
      context.product.sortKey = 'emp_eff_avg'
      context.product.reverse = true
      context.product.dataShowType = ['bar', 'bar']
      context.product.filterCh = true
      context.reason.child = context.product

      context.line = context.commons.efficiencyAnalysis(
        2,
        6,
        `${i18n('Line')}`,
        rowData,
        context.getData
      )
      context.line.sortKey = 'emp_eff_avg'
      context.line.reverse = true
      context.line.dataShowType = ['bar', 'bar']
      context.product.child = context.line

      context.changeOption('chartKeys', ['emp_eff_avg', 'line_eff_avg'])
      context.changeOption('chartColors', [
        servkit.statusColors.online,
        servkit.colors.blue,
      ])
      context.changeOption('dataLabel', [
        `${i18n('Staff_Efficiency_Statistics')}`,
        `${i18n('Line_Efficiency_Statistics')}`,
      ])

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
      year: new Date().getFullYear(),
      processCodeList: [],
      divisionMap,
      processMap,
      divisionProcessMap,
      productMap,
      changeOption: function (name, data) {
        this.reason[name] = data
        this.line[name] = data
        this.product[name] = data
      },
      getData: function (chartData, processData) {
        return _.map(chartData, (val) => {
          var data = {
            name: [],
            real_workhour: val.real_workhour,
            invalidhour_eff: val.invalidhour_eff,
            std_workhour: val.std_workhour,
            line_eff_avg: val.line_eff_avg,
            emp_eff_avg: val.emp_eff_avg,
            child: val.productNameList,
          }
          _.each(val, (v, k) => {
            var value = v
            if (processData) {
              if (k === 'processCode') value = processData[value]
              if (
                !_.isArray(v) &&
                k !== 'real_workhour' &&
                k !== 'invalidhour_eff' &&
                k !== 'std_workhour' &&
                k !== 'line_eff_avg' &&
                k !== 'emp_eff_avg' &&
                k !== 'process_code'
              )
                data.name.push(value)
            } else {
              if (_.isArray(v)) data.child = v
              else if (
                k !== 'real_workhour' &&
                k !== 'invalidhour_eff' &&
                k !== 'std_workhour' &&
                k !== 'line_eff_avg' &&
                k !== 'emp_eff_avg' &&
                k !== 'process_code'
              )
                data.name.push(v)
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
