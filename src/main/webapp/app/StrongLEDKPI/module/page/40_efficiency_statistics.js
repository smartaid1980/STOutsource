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
      $('#target-value').val(context.targetValue)
      const localeMap = {
        en: 'en',
        zh: 'zh-tw',
        zh_tw: 'zh-tw',
      }
      const lang = localeMap[servkit.getCookie('lang')]
      $('#year').datetimepicker({
        defaultDate: moment().format('YYYY'),
        viewMode: 'years',
        format: 'YYYY',
        locale: lang,
        maxDate: 'now',
      })
      servkit.initSelectWithList(
        context.monthMap[servkit.getCookie('lang')],
        $('#month')
      )
      $('#month').val(String(new Date().getMonth() + 1))
      $('#year')
        .on('dp.change', function () {
          var hideAfter = false
          if (this.value === String(new Date().getFullYear())) hideAfter = true
          $('#month>option').each(function () {
            if (
              Number(this.value) > String(new Date().getMonth() + 1) &&
              hideAfter
            )
              $(this).addClass('hide')
            else $(this).removeClass('hide')
          })
        })
        .trigger('dp.change')
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
      var demoData = {
        quarter: [
          {
            timeSeries: '1',
            startDate: '2019-01-01',
            endDate: '2019-03-31',
            output: 100,
            goQuantity: 80,
          },
          {
            timeSeries: '2',
            startDate: '2019-04-01',
            endDate: '2019-06-30',
            output: 100,
            goQuantity: 70,
          },
          {
            timeSeries: '3',
            startDate: '2019-07-01',
            endDate: '2019-09-31',
            output: 100,
            goQuantity: 40,
            // }, {
            //   timeSeries: '4',
            //   startDate: '2019-10-01',
            //   endDate: '2019-12-30',
            //   output: 100,
            //   goQuantity: 80
          },
        ],
        month: [
          {
            //   timeSeries: '1',
            //   startDate: '2019-01-01',
            //   endDate: '2019-01-31',
            //   output: 100,
            //   goQuantity: 40
            // }, {
            timeSeries: '2',
            startDate: '2019-02-01',
            endDate: '2019-02-28',
            output: 100,
            goQuantity: 70,
          },
          {
            timeSeries: '3',
            startDate: '2019-03-01',
            endDate: '2019-03-31',
            output: 100,
            goQuantity: 40,
          },
          {
            timeSeries: '4',
            startDate: '2019-04-01',
            endDate: '2019-04-30',
            output: 100,
            goQuantity: 80,
          },
          {
            timeSeries: '5',
            startDate: '2019-05-01',
            endDate: '2019-05-31',
            output: 100,
            goQuantity: 41,
          },
          {
            timeSeries: '6',
            startDate: '2019-06-01',
            endDate: '2019-06-31',
            output: 100,
            goQuantity: 6,
          },
          {
            timeSeries: '7',
            startDate: '2019-07-01',
            endDate: '2019-07-30',
            output: 100,
            goQuantity: 70,
          },
          {
            timeSeries: '8',
            startDate: '2019-08-01',
            endDate: '2019-08-31',
            output: 100,
            goQuantity: 80,
          },
          {
            timeSeries: '9',
            startDate: '2019-09-01',
            endDate: '2019-09-30',
            output: 100,
            goQuantity: 82,
          },
          {
            timeSeries: '10',
            startDate: '2019-10-01',
            endDate: '2019-10-31',
            output: 100,
            goQuantity: 57,
          },
          {
            timeSeries: '11',
            startDate: '2019-11-01',
            endDate: '2019-11-30',
            output: 100,
            goQuantity: 78,
          },
          {
            timeSeries: '12',
            startDate: '2019-12-01',
            endDate: '2019-12-31',
            output: 100,
            goQuantity: 64,
          },
        ],
        week: [
          {
            timeSeries: '1',
            startDate: '2019-09-01',
            endDate: '2019-09-07',
            output: 100,
            goQuantity: 56,
          },
          {
            timeSeries: '2',
            startDate: '2019-09-08',
            endDate: '2019-09-14',
            output: 100,
            goQuantity: 47,
          },
          {
            timeSeries: '3',
            startDate: '2019-09-15',
            endDate: '2019-09-21',
            output: 100,
            goQuantity: 32,
          },
          {
            timeSeries: '4',
            startDate: '2019-09-22',
            endDate: '2019-09-28',
            output: 100,
            goQuantity: 31,
          },
          {
            timeSeries: '5',
            startDate: '2019-09-29',
            endDate: '2019-09-30',
            output: 100,
            goQuantity: 37,
          },
        ],
        day: [
          {
            timeSeries: '1',
            startDate: '2019-09-01',
            endDate: '2019-09-01',
            output: 100,
            goQuantity: 87,
          },
          {
            timeSeries: '2',
            startDate: '2019-09-02',
            endDate: '2019-09-02',
            output: 100,
            goQuantity: 34,
          },
          {
            timeSeries: '3',
            startDate: '2019-09-03',
            endDate: '2019-09-03',
            output: 100,
            goQuantity: 22,
          },
          {
            timeSeries: '4',
            startDate: '2019-09-04',
            endDate: '2019-09-04',
            output: 100,
            goQuantity: 21,
          },
          {
            timeSeries: '5',
            startDate: '2019-09-05',
            endDate: '2019-09-05',
            output: 100,
            goQuantity: 54,
          },
          {
            timeSeries: '6',
            startDate: '2019-09-06',
            endDate: '2019-09-06',
            output: 100,
            goQuantity: 31,
          },
          {
            timeSeries: '7',
            startDate: '2019-09-07',
            endDate: '2019-09-07',
            output: 100,
            goQuantity: 41,
          },
          {
            timeSeries: '8',
            startDate: '2019-09-08',
            endDate: '2019-09-08',
            output: 100,
            goQuantity: 21,
          },
          {
            timeSeries: '9',
            startDate: '2019-09-09',
            endDate: '2019-09-09',
            output: 100,
            goQuantity: 36,
          },
          {
            timeSeries: '10',
            startDate: '2019-09-10',
            endDate: '2019-09-10',
            output: 100,
            goQuantity: 45,
          },
          {
            timeSeries: '11',
            startDate: '2019-09-11',
            endDate: '2019-09-11',
            output: 100,
            goQuantity: 48,
          },
          {
            timeSeries: '12',
            startDate: '2019-09-12',
            endDate: '2019-09-12',
            output: 100,
            goQuantity: 32,
          },
          {
            timeSeries: '13',
            startDate: '2019-09-13',
            endDate: '2019-09-13',
            output: 100,
            goQuantity: 32,
          },
          {
            timeSeries: '14',
            startDate: '2019-09-14',
            endDate: '2019-09-14',
            output: 100,
            goQuantity: 45,
          },
          {
            timeSeries: '15',
            startDate: '2019-09-15',
            endDate: '2019-09-15',
            output: 100,
            goQuantity: 12,
          },
          {
            timeSeries: '16',
            startDate: '2019-09-16',
            endDate: '2019-09-16',
            output: 100,
            goQuantity: 65,
            // }, {
            //   timeSeries: '17',
            //   startDate: '2019-09-17',
            //   endDate: '2019-09-17',
            //   output: 100,
            //   goQuantity: 45
          },
          {
            timeSeries: '18',
            startDate: '2019-09-18',
            endDate: '2019-09-18',
            output: 100,
            goQuantity: 35,
          },
          {
            timeSeries: '19',
            startDate: '2019-09-19',
            endDate: '2019-09-19',
            output: 100,
            goQuantity: 38,
          },
          {
            timeSeries: '20',
            startDate: '2019-09-20',
            endDate: '2019-09-20',
            output: 100,
            goQuantity: 53,
          },
          {
            timeSeries: '21',
            startDate: '2019-09-21',
            endDate: '2019-09-21',
            output: 100,
            goQuantity: 23,
          },
          {
            timeSeries: '22',
            startDate: '2019-09-22',
            endDate: '2019-09-22',
            output: 100,
            goQuantity: 93,
          },
          {
            timeSeries: '23',
            startDate: '2019-09-23',
            endDate: '2019-09-23',
            output: 100,
            goQuantity: 23,
          },
          {
            timeSeries: '24',
            startDate: '2019-09-24',
            endDate: '2019-09-24',
            output: 100,
            goQuantity: 22,
          },
          {
            timeSeries: '25',
            startDate: '2019-09-25',
            endDate: '2019-09-25',
            output: 100,
            goQuantity: 12,
          },
          {
            timeSeries: '26',
            startDate: '2019-09-26',
            endDate: '2019-09-26',
            output: 100,
            goQuantity: 34,
          },
          {
            timeSeries: '27',
            startDate: '2019-09-27',
            endDate: '2019-09-27',
            output: 100,
            goQuantity: 23,
          },
          {
            timeSeries: '28',
            startDate: '2019-09-28',
            endDate: '2019-09-28',
            output: 100,
            goQuantity: 33,
          },
          {
            timeSeries: '29',
            startDate: '2019-09-29',
            endDate: '2019-09-29',
            output: 100,
            goQuantity: 43,
          },
          {
            timeSeries: '30',
            startDate: '2019-09-30',
            endDate: '2019-09-20',
            output: 100,
            goQuantity: 54,
          },
        ],
      }

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
          year: $('#year').val(),
          month: $('#month').val(),
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
            url: 'api/yihcheng/kpi-view-table/kpiEffFourTable',
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

      context.quarter = context.commons.timeIntervalStatistics(
        5,
        'quarter',
        `${i18n('Quarter_Statistics')}`,
        '',
        '41_efficiency_analysis'
      )
      context.month = context.commons.timeIntervalStatistics(
        7,
        'month',
        `${i18n('Month_Statistics')}`,
        '',
        '41_efficiency_analysis'
      )
      context.week = context.commons.timeIntervalStatistics(
        5,
        'week',
        `${i18n('Week_Statistics')}`,
        '',
        '41_efficiency_analysis'
      )
      context.day = context.commons.timeIntervalStatistics(
        7,
        'day',
        `${i18n('Day_Statistics')}`,
        '',
        '41_efficiency_analysis'
      )
      context.changeOption('haveAverage', false)

      context.getLayers()
      context.changeOption('layers', context.layers)

      // 自訂圖示
      var dataShowType = ['point-line', 'point-line', 'line']
      context.changeOption('dataShowType', dataShowType)

      // 自訂顏色(目標值跟銘均值的顏色都要訂)
      var dataColor = [
        this.servkit.statusColors.online,
        this.servkit.colors.blue,
        this.servkit.statusColors.alarm,
        '#d4d4d4',
      ]
      context.changeOption('dataColor', dataColor)

      // 自訂文字樣式
      var dataLabel = [
        `${i18n('Staff_Efficiency_Statistics')}`,
        `${i18n('Line_Efficiency_Statistics')}`,
        `${i18n('Target_Value')}`,
      ]
      context.changeOption('dataLabel', dataLabel)

      $('#target-btn')
        .on('click', function (evt) {
          evt.preventDefault()
          if (isNaN($('#target-value').val()))
            $('#target-alert').text(`${i18n('Target_Alert')}`)
          else {
            context.targetLoadingBtn.doing()
            $('#target-alert').text('')
            context.targetValue = $('#target-value').val()
            context.changeOption('target', context.targetValue)
            context.update()
            context.targetLoadingBtn.done()
          }
        })
        .trigger('click')

      $('[name=show-chart]').on('change', function () {
        context.getLayers()
        context.changeOption('layers', context.layers)
        context.update()
      })
    },
    util: {
      quarter: null,
      month: null,
      week: null,
      day: null,
      layers: [],
      targetValue: 80,
      loadingBtn: servkit.loadingButton(document.querySelector('#query-btn')),
      targetLoadingBtn: servkit.loadingButton(
        document.querySelector('#target-btn')
      ),
      monthMap: {
        en: {
          1: 'January',
          2: 'February',
          3: 'March',
          4: 'April',
          5: 'May',
          6: 'June',
          7: 'July',
          8: 'August',
          9: 'September',
          10: 'Ocotober',
          11: 'November',
          12: 'December',
        },
        zh: {
          1: '一月',
          2: '二月',
          3: '三月',
          4: '四月',
          5: '五月',
          6: '六月',
          7: '七月',
          8: '八月',
          9: '九月',
          10: '十月',
          11: '十一月',
          12: '十二月',
        },
        zh_tw: {
          1: '一月',
          2: '二月',
          3: '三月',
          4: '四月',
          5: '五月',
          6: '六月',
          7: '七月',
          8: '八月',
          9: '九月',
          10: '十月',
          11: '十一月',
          12: '十二月',
        },
        acronym: {
          1: 'Jan',
          2: 'Feb',
          3: 'Mar',
          4: 'Apr',
          5: 'May',
          6: 'Jun',
          7: 'Jul',
          8: 'Aug',
          9: 'Sep',
          10: 'Oco',
          11: 'Nov',
          12: 'Dec',
        },
      },
      processCodeList: [],
      divisionMap,
      processMap,
      divisionProcessMap,
      productMap,
      update: function () {
        this.quarter.drawChart()
        this.month.drawChart()
        this.week.drawChart()
        this.day.drawChart()
      },
      changeOption: function (name, data) {
        this.quarter[name] = data
        this.month[name] = data
        this.week[name] = data
        this.day[name] = data
      },
      getDataMap: function (data, keyName) {
        var dataMap = {}
        _.each(
          data,
          (val) =>
            (dataMap[val.timeSeries] = {
              value: Number(val[keyName]),
              primary: val,
            })
        )
        return dataMap
      },
      mapData: function (name, data) {
        var max, min
        this[name].datas = []
        this[name].data = this.getDataMap(data, 'empEff')
        this[name].datas.push(this[name].data)
        max = this[name].max
        min = this[name].min
        this[name].data = this.getDataMap(data, 'lineEff')
        this[name].datas.push(this[name].data)
        if (max > this[name].max) this[name].max = max
        if (min < this[name].min) this[name].min = min
      },
      getStartDate: function (dataList) {
        var data = dataList[Math.round(dataList.length / 2)]
        if (!data) data = dataList[0]
        return data.startDate
      },
      draw: function (chartData) {
        var ticks = []
        this.mapData('quarter', chartData.quarter)
        if (chartData.quarter && chartData.quarter.length)
          _.times(
            chartData.quarter[chartData.quarter.length - 1].timeSeries,
            (n) => ticks.push([n + 1, 'Q' + (n + 1)])
          )
        this.quarter.option = {
          xaxis: {
            tickSize: 5,
            ticks: ticks,
          },
        }
        this.quarter.drawChart(
          chartData.quarter && chartData.quarter.length
            ? moment(this.getStartDate(chartData.quarter)).format('YYYY')
            : null
        )

        this.mapData('month', chartData.month)
        ticks = []
        if (chartData.month && chartData.month.length)
          _.times(chartData.month[chartData.month.length - 1].timeSeries, (n) =>
            ticks.push([n + 1, this.monthMap.acronym[n + 1]])
          )
        this.month.option = {
          xaxis: {
            tickSize: chartData.month ? chartData.month.length : 0,
            ticks: ticks,
          },
        }
        this.month.drawChart(
          chartData.month && chartData.month.length
            ? moment(this.getStartDate(chartData.month)).format('YYYY')
            : null
        )

        this.mapData('week', chartData.week)
        ticks = []
        if (chartData.week && chartData.week.length)
          _.times(chartData.week[chartData.week.length - 1].timeSeries, (n) =>
            ticks.push([n + 1, 'Week' + (n + 1)])
          )
        this.week.option = {
          xaxis: {
            tickSize: chartData.week ? chartData.week.length : 0,
            ticks: ticks,
          },
        }
        this.week.drawChart(
          chartData.week && chartData.week.length
            ? moment(this.getStartDate(chartData.week)).format('YYYY/MM')
            : null
        )

        this.mapData('day', chartData.day)
        ticks = []
        if (chartData.day && chartData.day.length)
          _.times(chartData.day[chartData.day.length - 1].timeSeries, (n) =>
            ticks.push([n + 1, n + 1])
          )
        this.day.option = {
          xaxis: {
            tickSize: chartData.day ? chartData.day.length : 0,
            ticks: ticks,
          },
        }
        this.day.drawChart(
          chartData.day && chartData.day.length
            ? moment(this.getStartDate(chartData.day)).format('YYYY/MM')
            : null
        )
        this.loadingBtn.done()
      },
      getLayers: function () {
        var ctx = this
        ctx.layers = []
        $('[name=show-chart]').each(function () {
          if (this.checked) ctx.layers.push(this.value)
        })
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
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
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
