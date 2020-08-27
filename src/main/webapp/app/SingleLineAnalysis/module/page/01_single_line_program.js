import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')
      pageSetUp()
      servkit.initFuncBindMachineSelect(
        $('#machineId'),
        context.appId,
        context.funId
      )
      servkit.validateForm($('#search_form'), $('#submit'))
      servkit.initDatePicker(
        $('[name=element2start]'),
        $('[name=element2end]'),
        false,
        false
      )
      context.tempalteEngine = createTempalteEngine()
      context.ReportTable = createReportTable({
        $tableElement: $('#element5'),
        onDraw: function (tableData, pageData) {
          var valueIndex = 4
          // _.each(pageData,(obj)=>{
          //   obj[2] = servkit.getMachineName(obj[2])
          //   return obj
          // })
          var obj2 = JSON.parse(JSON.stringify(pageData))
          obj2 = _.map(obj2, (obj) => {
            obj[valueIndex] = obj[valueIndex].HHmmssToMillisecond() / 1000
            return obj
          })
          //build config data
          var chartConfig = {
            dataList: obj2,
            barValueIndex: [valueIndex],
            tickColor: 'black',
            yAxisLabelValueIndex: context.yMutilIndex,
            xAxisLabel: `${i18n('Execution_Time')}`,
            yAxisLabel: `${i18n('Main_Program')} - ${i18n('Date')} - ${i18n(
              'Name'
            )} - ${i18n('Time_Type')}`,
            max: _.max(_.map(obj2, (val) => val[valueIndex])) * 1.2,
          }
          if (context.filter) {
            chartConfig.filterVal =
              (context.filter * 1000)
                .millisecondToHHmmss()
                .HHmmssToMillisecond() / 1000
          }
          // draw bar chart
          context.changeChartSize(context.$mainChart, pageData.length)
          context.drawChart(context.$mainChart, chartConfig)
        }, // optional

        order: [[3, 'desc']],
      })
      context.listTable = createReportTable({
        $tableElement: $('#list-table'),
        customBtns: [
          `<button id='list-table-All' class='btn margin-left-10'><i class='fa fa-arrow-down'></i>&nbsp; ${i18n(
            'Join_All'
          )}</button>`,
        ],
        order: [[3, 'desc']],
      })
      context.compareTable = createReportTable({
        $tableElement: $('#compare-table'),
        onRow: function (row, data) {
          if (
            context.filterLine != null &&
            data[0] === context.filterLine.main_program &&
            data[1] === context.filterLine.date &&
            servkit.getMachineName(data[2]) ===
              servkit.getMachineName(context.filterLine.machine_id) &&
            data[3] ===
              context.getPartCountLabel(context.filterLine.part_count) &&
            data[4] ===
              (context.filterLine.times_total * 1000).millisecondToHHmmss()
          ) {
            $(row).css('color', servkit.colors.blue)
          }
        },
        customBtns: [
          `<button id='compare-table-All' class='btn margin-left-10'><i class='fa fa-arrow-up'></i>&nbsp; ${i18n(
            'Delete_All'
          )}</button>`,
          `<button id="compare-btn" class="btn btn-primary">${i18n(
            'Comparison'
          )}</button>`,
        ],
        order: [[3, 'desc']],
      })

      context.RunTable = createReportTable({
        $tableElement: $('#run-table'),
        onDraw: function (tableData, pageData) {
          let obj2 = JSON.parse(JSON.stringify(pageData))
          let numList = []
          obj2 = _.map(obj2, (obj) => {
            obj[1] = obj[1] === '---' ? 0 : obj[1].HHmmssToMillisecond() / 1000
            obj[2] = obj[1] === '---' ? 0 : obj[2].HHmmssToMillisecond() / 1000
            numList.push(obj[1])
            numList.push(obj[2])
            return obj
          })
          //build config data
          var chartConfig = {
            dataList: obj2,
            barValueIndex: [1, 2],
            tickColor: 'black',
            yAxisLabelValueIndex: [0],
            xAxisLabel: `${i18n('Execution_Time')}`,
            yAxisLabel: `${i18n('Subprogram')}`,
            max: _.max(numList) * 1.1,
            doubleBar: true,
          }
          context.curRunPageConfig = chartConfig
          // draw bar chart
          context.changeChartSize(context.$runChart, pageData.length + 2)
          context.drawChart(context.$runChart, chartConfig)
        }, // optional
        order: [[0, 'asc']],
      })
      context.singleTable = createReportTable({
        $tableElement: $('#single-table'),
        onDraw: function (tableData, pageData) {
          var obj2 = JSON.parse(JSON.stringify(pageData))
          let numList = []
          obj2 = _.map(obj2, (obj) => {
            obj[1] = obj[1] === '---' ? 0 : obj[1].HHmmssToMillisecond() / 1000
            obj[2] = obj[1] === '---' ? 0 : obj[2].HHmmssToMillisecond() / 1000
            numList.push(obj[1])
            numList.push(obj[2])
            return obj
          })
          //build config data
          var chartConfig = {
            dataList: obj2,
            barValueIndex: [1, 2],
            tickColor: 'black',
            yAxisLabelValueIndex: [0],
            xAxisLabel: `${i18n('Execution_Time')}`,
            yAxisLabel: `${i18n('Program_Block')}`,
            max: _.max(numList) * 1.1,
            doubleBar: true,
          }
          // draw bar chart
          context.changeChartSize(context.$singleChart, pageData.length + 2)
          context.drawChart(context.$singleChart, chartConfig)
        }, // optional
        order: [[0, 'asc']],
      })

      /**
       * main program binding bolck start
       */
      context.$mainChart.bind('plotclick', function (event, pos, item) {
        if (item) {
          var label = item.series.yaxis.ticks[item.seriesIndex].label
          var main = context.getCurCompareMain(label)
          if (
            main[3] === `${i18n('All')}` ||
            main[3] === `${i18n('Estimated')}-${i18n('All')}`
          ) {
            context.custCallBack = function (obj, main) {
              return obj.main_program === main.main_program
            }
          }
          context.RenderRunTable({
            main_program: main[0],
            date: main[1],
            machine_id: main[2],
            part_count: main[3],
            times_total: main[4].HHmmssToMillisecond() / 1000,
          })
        }
      })
      $('#element5').on('click', '.main-col', function (e) {
        var data = context.ReportTable.table.row($(this).parents('tr')).data()
        var label = context.buildTick(context.yMutilIndex, [
          data[0],
          data[1],
          data[2],
          data[3],
        ])
        var main = context.getCurCompareMain(label)
        if (
          main[3] === `${i18n('All')}` ||
          main[3] === `${i18n('Estimated')}-${i18n('All')}`
        ) {
          context.custCallBack = function (obj, main) {
            return obj.main_program === main.main_program
          }
        }
        context.RenderRunTable({
          main_program: main[0],
          date: main[1],
          machine_id: main[2],
          part_count: main[3],
          times_total: main[4].HHmmssToMillisecond() / 1000,
        })
      })
      // main program binding bolck end

      /**
       * run program binding bolck start
       */
      context.$runChart.bind('plotclick', function (event, pos, item) {
        if (item) {
          context.RenderSingleTable(
            item.series.yaxis.ticks[item.dataIndex].label
          )
        }
      })
      $('#run-chart-widget').on('click', '.run-col', function (e) {
        var data = context.RunTable.table.row($(this).parents('tr')).data()
        var run_program = data[0]
        var index = 0
        _.each(context.curRunPageConfig.dataList, (value, key) => {
          if (value[0] === run_program) index = key
        })
        context.RenderSingleTable(run_program)
      })
      /* run program binding bolck end */

      /*
       * submit button binding
       * binding compare data after filter data
       */
      $('#submit-all-estimated').on('click', function (event) {
        event.preventDefault()
        var programName = $('[name=main-program]').val()
        if (context.setEstimatedAsFilter(programName)) {
          context.changePage('close compare')
          context.filterCompareDataRender(function (obj) {
            return obj.main_program === programName
          })
        }
      })
      $('#submit-longTime-estimated').on('click', function (event) {
        event.preventDefault()
        var programName = $('[name=main-program]').val()
        var tempList = _.chain(context.mainPGData)
          .filter(
            (obj) =>
              programName === obj.main_program &&
              obj.part_count !== `${i18n('Estimated')}`
          )
          .sortBy((obj) => parseFloat(obj.times_total))
          .value()
        tempList = tempList.slice(-3)
        if (context.setEstimatedAsFilter(programName)) {
          context.changePage('close compare')
          context.filterCompareDataRender(function (obj) {
            var boolean = _.find(tempList, (r) => {
              return (
                r.machine_id === obj.machine_id &&
                r.date === obj.date &&
                r.part_count === obj.part_count &&
                r.main_program === obj.main_program
              )
            })
            return boolean != undefined
              ? true
              : false ||
                  (obj.part_count === `${i18n('Estimated')}` &&
                    obj.main_program === programName)
          })
        }
      })

      $('#submit-shortTime-estimated').on('click', function (event) {
        event.preventDefault()
        var programName = $('[name=main-program]').val()
        var tempList = _.chain(context.mainPGData)
          .filter(
            (obj) =>
              programName === obj.main_program &&
              obj.part_count !== `${i18n('Estimated')}`
          )
          .sortBy((obj) => parseFloat(obj.times_total))
          .value()
        tempList = tempList.slice(0, 3)
        if (context.setEstimatedAsFilter(programName)) {
          context.changePage('close compare')
          context.filterCompareDataRender(function (obj) {
            var boolean = _.find(tempList, (r) => {
              return (
                r.machine_id === obj.machine_id &&
                r.date === obj.date &&
                r.part_count === obj.part_count &&
                r.main_program === obj.main_program
              )
            })
            return boolean != undefined
              ? true
              : false ||
                  (obj.part_count === `${i18n('Estimated')}` &&
                    obj.main_program === programName)
          })
        }
      })

      $('#submit-close10-estimated').on('click', function (event) {
        event.preventDefault()
        var programName = $('[name=main-program]').val()
        var tempList = _.chain(context.mainPGData)
          .filter(
            (obj) =>
              programName === obj.main_program &&
              obj.part_count !== `${i18n('Estimated')}`
          )
          .sortBy((obj) => parseFloat(obj.part_count))
          .value()
        tempList = tempList.slice(-9)
        context.filter = tempList[0].times_total
        context.mainPGDataSetFilterLine(tempList[0])
        context.changePage('close compare')
        context.filterCompareDataRender(function (obj) {
          var boolean = _.find(tempList, (r) => {
            return (
              r.machine_id === obj.machine_id &&
              r.date === obj.date &&
              r.part_count === obj.part_count &&
              r.main_program === obj.main_program
            )
          })
          return boolean != undefined ? true : false
        })
      })

      $('#submit-far10-estimated').on('click', function (event) {
        event.preventDefault()
        var programName = $('[name=main-program]').val()
        var tempList = _.chain(context.mainPGData)
          .filter(
            (obj) =>
              programName === obj.main_program &&
              obj.part_count !== `${i18n('Estimated')}`
          )
          .sortBy((obj) => parseFloat(obj.part_count))
          .value()
        tempList = tempList.slice(0, 9)
        context.filter = tempList[tempList.length - 1].times_total
        context.mainPGDataSetFilterLine(tempList[tempList.length - 1])
        context.changePage('close compare')
        context.filterCompareDataRender(function (obj) {
          var boolean = _.find(tempList, (r) => {
            return (
              r.machine_id === obj.machine_id &&
              r.date === obj.date &&
              r.part_count === obj.part_count &&
              r.main_program === obj.main_program
            )
          })
          return boolean != undefined ? true : false
        })
      })

      $('#submit-All-estimated').on('click', function (event) {
        event.preventDefault()
        let programName = $('[name=main-program]').val()
        let tempAll = []
        _.chain(context.mainPGData)
          .filter((obj) => programName === obj.main_program)
          .groupBy((obj) => {
            let tag = obj.part_count.includes(`${i18n('Estimated')}`)
              ? '1'
              : '0'
            return obj.main_program + obj.date + obj.machine_id + tag
          })
          .each((value, key) => {
            let tempVal = 0
            _.each(value, (obj) => {
              tempVal += parseFloat(obj.times_total)
            })
            tempAll.push([
              programName,
              value[0].date.date8BitsToSlashed(),
              value[0].machine_id,
              value[0].part_count === `${i18n('Estimated')}`
                ? `${i18n('Estimated')}`
                : `${i18n('All')}`,
              (tempVal * 1000).millisecondToHHmmss(),
              context.$buttonHtml.expand,
            ])
          })
        let tmepfilter = _.find(
          tempAll,
          (obj) => obj[3] === `${i18n('Estimated')}`
        )
        if (tmepfilter) {
          context.filterLine = {
            main_program: tmepfilter[0],
            date: tmepfilter[1],
            machine_id: tmepfilter[2],
            part_count: tmepfilter[3],
            times_total: tmepfilter[4].HHmmssToMillisecond() / 1000,
          }
          context.filter = context.filterLine.times_total
        }
        context.changePage('close compare')
        context.compareData = JSON.parse(JSON.stringify(tempAll))
        context.refreshListAndCompareTable()
        let renderData = _.map(tempAll, (obj) => {
          obj[2] = servkit.getMachineName(obj[2])
          return obj
        })
        context.changePage('A')
        context.RenderMainTable(renderData)
      })

      /*
       * use page C
       * show mainPGData to select
       */
      $('#search-btn').on('click', function (event) {
        context.changePage('C')
        context.changePage('open compare')
        event.preventDefault()
        context.refreshListAndCompareTable()
      })
      /**
       *  search end
       */
      $('#leave-btn').on('click', function (event) {
        event.preventDefault()
        context.changePage('A')
      })
      $('#search_form').on('change', '.level1', function (event) {
        context.machineId = $('#machineId').val()
        hippo
          .newSimpleExhaler()
          .space('single_line_main_map')
          .index('machine_id', [context.machineId])
          .indexRange('date', context.$startDate.val(), context.$endDate.val())
          .columns(
            'machine_id',
            'date',
            'part_count',
            'main_program',
            'times_total'
          )
          .exhale(function (data) {
            context.mainPGData = data.exhalable
            // calculate db data
            _.chain(context.preCon.dbdata)
              .filter((obj) => {
                return obj.machine_id === context.machineId
              })
              .filter((obj) => {
                return (
                  (moment(obj.end_time) >=
                    moment(context.$startDate.val().replace(/\//g, '-')) &&
                    moment(obj.end_time) <=
                      moment(context.$endDate.val().replace(/\//g, '-'))) ||
                  (moment(obj.start_time) >=
                    moment(context.$startDate.val().replace(/\//g, '-')) &&
                    moment(obj.start_time) <=
                      moment(context.$endDate.val().replace(/\//g, '-'))) ||
                  (moment(obj.start_time) <
                    moment(context.$startDate.val().replace(/\//g, '-')) &&
                    moment(obj.end_time) >
                      moment(context.$endDate.val().replace(/\//g, '-')))
                )
              })
              .each((value, key) => {
                var tempSum = 0
                _.each(
                  value.run_program,
                  (v) => (tempSum += parseFloat(v.time))
                )
                context.mainPGData.push({
                  date: moment(value.start_time).format('YYYYMMDD'),
                  machine_id: value.machine_id,
                  main_program: value.pg_name,
                  part_count: `${i18n('Estimated')}`,
                  times_total: tempSum,
                })
              })
            var group = _.chain(data.exhalable)
              .groupBy((obj) => {
                return obj.main_program
              })
              .keys()
              .value()
            servkit.initSelectWithList(group, $('[name=main-program]'))
          })
      })
      /**
       * List widge button binding block
       */
      $('#list-table-widget').on('click', '.list-col', function (e) {
        e.preventDefault()
        let data = context.listTable.table.row($(this).parents('tr')).data()
        let raw = _.find(context.mainPGData, (obj) => {
          return (
            obj.main_program === data[0] &&
            obj.date.date8BitsToSlashed(obj.date) === data[1] &&
            servkit.getMachineName(obj.machine_id) === data[2] &&
            context.getPartCountLabel(obj.part_count) === data[3] &&
            (obj.times_total * 1000).millisecondToHHmmss() === data[4]
          )
        })
        if (raw) {
          context.compareData.push([
            data[0],
            data[1],
            raw.machine_id,
            raw.part_count,
            data[4],
            context.$buttonHtml.expand,
          ])
          context.refreshListAndCompareTable()
        }
      })
      $('#list-table-All').on('click', function (e) {
        e.preventDefault()
        var programName = $('[name=main-program]').val()
        var resultList = _.chain(context.mainPGData)
          .filter((obj) => obj.main_program == programName)
          .map((obj) => [
            obj.main_program,
            obj.date.date8BitsToSlashed(),
            obj.machine_id,
            obj.part_count,
            (parseFloat(obj.times_total) * 1000).millisecondToHHmmss(),
            context.$buttonHtml.list,
          ])
          .value()
        _.each(resultList, (record) => {
          context.compareData.push([
            record[0],
            record[1],
            record[2],
            record[3],
            record[4],
            context.$buttonHtml.expand,
          ])
        })
        context.refreshListAndCompareTable()
      })
      // List block end

      /**
       * Compare widge button binding block
       */

      $('#compare-table-widget').on('click', '.compare-col', function (e) {
        e.preventDefault()
        var data = context.compareTable.table.row($(this).parents('tr')).data()
        context.compareData = _.filter(context.compareData, (obj) => {
          if (
            obj[0] === data[0] &&
            obj[1] === data[1] &&
            servkit.getMachineName(obj[2]) === data[2] &&
            context.getPartCountLabel(obj[3]) === data[3]
          )
            return false
          else return true
        })
        context.refreshListAndCompareTable()
      })

      $('#compare-table-widget').on('click', '.stander-col', function (e) {
        e.preventDefault()
        var data = context.compareTable.table.row($(this).parents('tr')).data()
        context.filterLine = _.find(context.compareData, (obj) => {
          return (
            obj[0] === data[0],
            obj[1] === data[1],
            servkit.getMachineName(obj[2]) === servkit.getMachineName(data[2]),
            obj[3] === data[3],
            obj[4] === data[4]
          )
        })
        context.filterLine = {
          main_program: context.filterLine[0],
          date: context.filterLine[1],
          machine_id: context.filterLine[2],
          part_count: context.filterLine[3],
          times_total: context.filterLine[4].HHmmssToMillisecond() / 1000,
        }
        context.filter = data[4].HHmmssToMillisecond() / 1000
        context.refreshListAndCompareTable()
      })

      $('#compare-table-All').on('click', function (e) {
        e.preventDefault()
        context.compareData = []
        context.refreshListAndCompareTable()
      })

      $('#compare-btn').on('click', function (e) {
        e.preventDefault()
        context.changePage('A')
        context.changePage('close compare')
        console.log(context.compareData)
        let resultList = []
        _.each(context.compareData, (obj) => {
          resultList.push([
            obj[0],
            obj[1],
            servkit.getMachineName(obj[2]),
            obj[3],
            obj[4],
            context.$buttonHtml.expand,
          ])
        })
        context.changePage('A')
        context.RenderMainTable(resultList)
      })

      // Compare block end

      // context button html build

      context.$buttonHtml = {
        list: `<div class="list-col btn btn-default"><i class="fa fa-arrow-right"></i>&nbsp; ${i18n(
          'Join'
        )}</div>`,
        expand: `<div class="main-col btn btn-default">${i18n('Expand')}</div>`,
        delet: `<div class="compare-col btn btn-default" style="margin: 3px;padding: 3px;"><i class="fa fa-arrow-left"></i>&nbsp; ${i18n(
          'Delete'
        )}</div>`,
        stander: `<div class="stander-col btn btn-default" style="margin: 3px;padding: 3px;"><i class="fa fa-check-circle"></i>&nbsp; ${i18n(
          'Standard'
        )}</div>`,
        run_expand: '<div class="run-col btn btn-default">展開</div>',
      }

      //bind page button block
      $('#page-btn-search').on('click', function (e) {
        e.preventDefault()
        context.changePage('A')
        context.changePage('just search')
      })
      $('#page-btn-compare-list').on('click', function (e) {
        e.preventDefault()
        context.changePage('C')
        context.changePage('open compare')
      })
      $('#page-btn-main-list').on('click', function (e) {
        e.preventDefault()
        context.changePage('A')
        context.changePage('close compare')
      })

      // page init
      context.changePage('just search')
      // $('.dt-toolbar').addClass('hide')

      // for demo
      context.$startDate.val('2018/07/26')
      context.$endDate.val('2018/07/26')
      $('#machineId').val('_FOXCONNP01D01M006')
      context.$startDate.change()
    },
    util: {
      $buttonHtml: {},
      tempalteEngine: null,
      ReportTable: null,
      RunTable: null,
      singleTable: null,
      listTable: null,
      compareTable: null,
      yMutilIndex: [0, 1, 2, 3],
      detailData: {},
      mainPGData: [],
      compareData: [],
      curRunPageConfig: {},
      custCallBack: null,
      dbData: null,
      filter: null,
      filterLine: null,
      $legend: null,
      $mainChart: $('#main-bar-chart'),
      $runChart: $('#run-bar-chart'),
      $singleChart: $('#single-bar-chart'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $tempMachineId: '',
      RenderMainTable: function (resultList) {
        var context = this
        //draw table
        let result = _.map(resultList, (line) => {
          line[3] = context.getPartCountLabel(line[3])
          return line
        })
        console.log(result)
        context.ReportTable.clearTable()
        context.ReportTable.drawTable(result)
      },
      RenderRunTable: async function (main) {
        var context = this
        const data = await Promise.all([
          context.getDetailData(main),
          context.getDetailData(context.filterLine),
        ])
        let curFilterCallBack = context.getRunProgramFilterCallback
        if (context.custCallBack) {
          curFilterCallBack = context.custCallBack
          context.custCallBack = undefined
        }
        context.detailData.act = _.chain(data[0])
          .filter((obj) => curFilterCallBack(obj, main))
          .each((obj) => {
            obj.times_total_arr = JSON.parse(obj.times_total_arr)
            return obj
          })
          .value()
        context.detailData.std = _.chain(data[1])
          .filter((obj) => curFilterCallBack(obj, context.filterLine))
          .map((obj) => {
            obj.times_total_arr = JSON.parse(obj.times_total_arr)
            return obj
          })
          .value()
        // draw table
        var result = {}
        _.chain(context.detailData.act)
          .groupBy((obj) => obj.run_program)
          .each((value, key) => {
            let total = context.getArrTotalTime(value)
            result[key] = [
              key,
              total.millisecondToHHmmss(),
              '---',
              context.$buttonHtml.run_expand,
            ]
          })
          .value()
        _.chain(context.detailData.std)
          .groupBy((obj) => obj.run_program)
          .each((value, key) => {
            let total = context.getArrTotalTime(value)
            if (result[key]) {
              result[key][2] = total.millisecondToHHmmss()
            } else {
              result[key] = [
                key,
                '---',
                total.millisecondToHHmmss(),
                context.$buttonHtml.run_expand,
              ]
            }
          })
          .value()
        console.log(result)
        let runInfo = main.part_count.includes(`${i18n('Estimated')}`)
          ? ''
          : `${i18n('Actual_Time')}-`
        $('#run-info').text(
          main.main_program +
            ' / ' +
            main.date +
            ' / ' +
            servkit.getMachineName(main.machine_id) +
            ' / ' +
            runInfo +
            main.part_count
        )
        if (context.filterLine) {
          let standerdInfo = context.filterLine.part_count.includes(
            `${i18n('Estimated')}`
          )
            ? ''
            : `${i18n('Actual_Time')}-`
          $('#run-stander-info').text(
            context.filterLine.main_program +
              ' / ' +
              context.filterLine.date +
              ' / ' +
              servkit.getMachineName(context.filterLine.machine_id) +
              ' / ' +
              standerdInfo +
              context.filterLine.part_count
          )
        }
        context.$legend = $('#legend-run')
        context.changePage('B')
        context.RunTable.clearTable()
        context.singleTable.clearTable()
        context.RunTable.drawTable(_.values(result))
      },
      RenderSingleTable: function (runPG) {
        var context = this
        var result = {}
        _.chain(context.detailData.act)
          .filter(
            (obj) => obj.run_program === runPG && obj.single_line !== '---'
          )
          // for demo
          .groupBy((obj) => obj.single_line)
          .each((value, key) => {
            let total = context.getArrTotalTime(value)
            result[key] = [key, total.millisecondToHHmmss(), '---']
          })
          .value()
        _.chain(context.detailData.std)
          .filter(
            (obj) => obj.run_program === runPG && obj.single_line !== '---'
          )
          .groupBy((obj) => obj.single_line)
          .each((value, key) => {
            let total = context.getArrTotalTime(value)
            if (result[key]) {
              result[key][2] = total.millisecondToHHmmss()
            } else {
              result[key] = [key, '---', total.millisecondToHHmmss()]
            }
          })
          .value()
        $('#single-info').text(`${i18n('Subprogram')} : ` + runPG)
        context.$legend = $('#legend-single')
        context.singleTable.clearTable()
        context.singleTable.drawTable(_.values(result))
      },
      drawChart: function ($chartEle, config) {
        var context = this
        var chartDatas
        var dataList = config.dataList,
          barValueIndex = config.barValueIndex,
          yAxisLabelValueIndex = config.yAxisLabelValueIndex,
          xAxisLabel = config.xAxisLabel,
          yAxisLabel = config.yAxisLabel,
          highLighIndex =
            config.highLighIndex === undefined ? -1 : config.highLighIndex,
          filterVal = config.filterVal,
          doubleBar = config.doubleBar ? true : false,
          max = config.max
        if (!dataList || dataList.length === 0) {
          $chartEle.empty()
          return
        }
        if (!doubleBar) {
          chartDatas = _.map(dataList, function (value, key) {
            return {
              data: [[value[barValueIndex], key]],
              color: servkit.colors.blue,
              bars: { tag: 'aaa' },
            }
          })
          if (filterVal) {
            chartDatas = _.map(dataList, function (value, key) {
              var color = servkit.colors.blue
              if (value[barValueIndex] < filterVal) {
                color = servkit.colors.green
              } else if (value[barValueIndex] > filterVal) {
                color = servkit.colors.red
              }
              return {
                data: [[value[barValueIndex], key]],
                color: color,
              }
            })
          }
        } else {
          var t1 = {
            data: [],
            label: `${i18n('Comparison_Value')}`,
            bars: { order: 1, barWidth: 0.2 },
            legend: {
              show: true,
            },
          }
          var t2 = {
            data: [],
            label: `${i18n('Standard')}`,
            bars: { order: 2, barWidth: 0.2 },
            legend: {
              show: true,
            },
          }
          _.each(dataList, (obj, index) => {
            t1.data.push([obj[barValueIndex[0]], index])
            t2.data.push([obj[barValueIndex[1]], index])
          })
          chartDatas = [t2, t1]
        }
        context.curPlot = $.plot($chartEle, chartDatas, {
          colors: [
            servkit.colors.blue,
            servkit.colors.green,
            servkit.colors.orange,
            servkit.colors.purple,
          ],
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            axisLabelUseCanvas: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          xaxis: {
            min: 0,
            max: max,
            axisLabel: xAxisLabel,
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 18,
            axisLabelPadding: 10,
            axisLabelFontFamily: 'Open Sans',
          },
          yaxis: {
            ticks: function () {
              var a = _.map(dataList, function (ele, i) {
                var tick
                if (yAxisLabelValueIndex.length > 1) {
                  tick = context.buildTick(yAxisLabelValueIndex, ele)
                } else {
                  tick = _.map(yAxisLabelValueIndex, function (index) {
                    return ele[index]
                  }).join('</br>')
                }
                return [i, tick]
              })
              return a
            },
            axisLabel: yAxisLabel,
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 16,
            axisLabelPadding: 10,
          },
          legend: {
            show: true,
            container: context.$legend,
          },
          tooltip: true,
          tooltipOpts: {
            // content: `<span>${i18n('Execution_Time')} : %x.2</span></b>`,
            content: function (label, x, y) {
              return (
                `<div class="btn btn-default">${i18n('Execution_Time')} : ` +
                (x * 1000).millisecondToHHmmss() +
                '</div>'
              )
            },
            defaultTheme: false,
          },
          bars: {
            align: 'center',
            horizontal: true,
            show: true,
            barWidth: 0.5,
          },
        })
      },
      changeChartSize: function ($element, size) {
        var height = size * 50
        if (height < 250) {
          height = 250
        }
        $element.css('height', height + 'px')
      },
      changePage: function (page) {
        var context = this
        switch (page) {
          case 'A':
            // Search and display main program chart and table
            $('#search-widget').removeClass('hide')
            $('#compare-table-widget').removeClass('hide')
            $('#list-table-widget').removeClass('hide')
            $('#main-chart-widget').removeClass('hide')
            $('#main-table-widget').removeClass('hide')
            $('#run-chart-widget').addClass('hide')
            $('#single-chart-widget').addClass('hide')
            $('#leave-btn').addClass('hide')
            break
          case 'B':
            // Display detail run program and block run
            $('#search-widget').addClass('hide')
            $('#run-chart-widget').addClass('hide')
            $('#single-chart-widget').addClass('hide')
            $('#main-chart-widget').addClass('hide')
            $('#main-table-widget').addClass('hide')
            $('#run-chart-widget').removeClass('hide')
            $('#single-chart-widget').removeClass('hide')
            $('#leave-btn').removeClass('hide')
            $('#compare-table-widget').addClass('hide')
            $('#list-table-widget').addClass('hide')
            break
          case 'C':
            $('#search-widget').removeClass('hide')
            $('#compare-table-widget').removeClass('hide')
            $('#list-table-widget').removeClass('hide')
            $('#main-chart-widget').removeClass('hide')
            $('#main-table-widget').removeClass('hide')
            $('#run-chart-widget').addClass('hide')
            $('#single-chart-widget').addClass('hide')
            $('#leave-btn').addClass('hide')
            break
          case 'open compare':
            if ($('#list-jarvis').attr('class').includes('collapsed'))
              $('#list-jarvis').find('.jarviswidget-toggle-btn').click()
            if ($('#compare-jarvis').attr('class').includes('collapsed'))
              $('#compare-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#main-chart-jarvis').attr('class').includes('collapsed'))
              $('#main-chart-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#main-table-jarvis').attr('class').includes('collapsed'))
              $('#main-table-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#search-jarvis').attr('class').includes('collapsed'))
              $('#search-jarvis').find('.jarviswidget-toggle-btn').click()
            $('html, body').animate(
              {
                scrollTop: $('#compare-table-widget').offset().top,
              },
              500
            )
            break
          case 'close compare':
            if (!$('#list-jarvis').attr('class').includes('collapsed'))
              $('#list-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#compare-jarvis').attr('class').includes('collapsed'))
              $('#compare-jarvis').find('.jarviswidget-toggle-btn').click()
            if ($('#main-chart-jarvis').attr('class').includes('collapsed'))
              $('#main-chart-jarvis').find('.jarviswidget-toggle-btn').click()
            if ($('#main-table-jarvis').attr('class').includes('collapsed'))
              $('#main-table-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#search-jarvis').attr('class').includes('collapsed'))
              $('#search-jarvis').find('.jarviswidget-toggle-btn').click()
            $('html, body').animate(
              {
                scrollTop: $('#main-chart-widget').offset().top,
              },
              500
            )
            break
          case 'just search':
            if (!$('#list-jarvis').attr('class').includes('collapsed'))
              $('#list-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#compare-jarvis').attr('class').includes('collapsed'))
              $('#compare-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#main-chart-jarvis').attr('class').includes('collapsed'))
              $('#main-chart-jarvis').find('.jarviswidget-toggle-btn').click()
            if (!$('#main-table-jarvis').attr('class').includes('collapsed'))
              $('#main-table-jarvis').find('.jarviswidget-toggle-btn').click()
            if ($('#search-jarvis').attr('class').includes('collapsed'))
              $('#search-jarvis').find('.jarviswidget-toggle-btn').click()
            $('html, body').animate(
              {
                scrollTop: $('#search-widget').offset().top,
              },
              500
            )
            break
        }
      },
      buildTick: function (yAxisLabelValueIndex, ele) {
        return _.map(yAxisLabelValueIndex, function (index) {
          return ele[index]
        }).join(' - ')
      },
      refreshListAndCompareTable: function () {
        var context = this
        var programName = $('[name=main-program]').val()
        var resultList = _.chain(context.mainPGData)
          .filter((obj) => obj.main_program == programName)
          .map((obj) => [
            obj.main_program,
            obj.date.date8BitsToSlashed(),
            servkit.getMachineName(obj.machine_id),
            context.getPartCountLabel(obj.part_count),
            (parseFloat(obj.times_total) * 1000).millisecondToHHmmss(),
            context.$buttonHtml.list,
          ])
          .value()
        let tt = JSON.parse(JSON.stringify(context.compareData))
        var deletCompareData = _.map(tt, (obj) => {
          obj[2] = servkit.getMachineName(obj[2])
          obj[3] = context.getPartCountLabel(obj[3])
          obj[obj.length - 1] =
            context.$buttonHtml.delet + context.$buttonHtml.stander
          return obj
        })
        var list = _.filter(resultList, (arr) => {
          var boolean = _.find(deletCompareData, (obj) => {
            return (
              arr[0] === obj[0] &&
              arr[1] === obj[1] &&
              arr[2] === obj[2] &&
              arr[3] === obj[3]
            )
          })
          return boolean ? false : true
        })
        console.log(context.compareData)
        context.listTable.clearTable()
        context.compareTable.clearTable()
        if (list.length > 0) context.listTable.drawTable(list)
        if (deletCompareData.length > 0) {
          // context.compareData = deletCompareData
          context.compareTable.drawTable(deletCompareData)
        }
      },
      filterCompareDataRender: function (filterCallBack) {
        var context = this
        let renderData = []
        context.compareData = _.chain(context.mainPGData)
          .filter((obj) => filterCallBack(obj))
          .map((obj) => {
            renderData.push([
              obj.main_program,
              obj.date.date8BitsToSlashed(),
              servkit.getMachineName(obj.machine_id),
              obj.part_count,
              (parseFloat(obj.times_total) * 1000).millisecondToHHmmss(),
              context.$buttonHtml.expand,
            ])
            return [
              obj.main_program,
              obj.date.date8BitsToSlashed(),
              obj.machine_id,
              obj.part_count,
              (parseFloat(obj.times_total) * 1000).millisecondToHHmmss(),
              context.$buttonHtml.expand,
            ]
          })
          .value()
        console.log(context.compareData)
        context.changePage('A')
        context.RenderMainTable(renderData)
      },
      setEstimatedAsFilter: function (programName) {
        let context = this
        let temp = _.find(context.mainPGData, (obj) => {
          return (
            obj.main_program === programName &&
            obj.part_count === `${i18n('Estimated')}`
          )
        })
        if (temp) {
          context.filter = temp.times_total
          context.mainPGDataSetFilterLine(temp)
          return true
        } else {
          context.filter = undefined
          alert(`${i18n('No_Estimated')}`)
          return false
        }
      },
      getDetailData: function (main) {
        try {
          let context = this
          let date = main.date
          if (main.part_count.includes(`${i18n('Estimated')}`)) {
            let dbData = []
            _.chain(context.preCon.dbdata)
              .filter((obj) => {
                var tempSum = 0
                _.each(obj.run_program, (v) => (tempSum += parseFloat(v.time)))
                return (
                  obj.pg_name === main.main_program &&
                  obj.machine_id === main.machine_id &&
                  tempSum === main.times_total
                )
              })
              .each((obj) => {
                _.each(obj.run_program, (v) => {
                  dbData.push({
                    main_program: obj.pg_name,
                    part_count: `${i18n('Estimated')}`,
                    run_program: v.run_program,
                    single_line: '---',
                    times_total_arr: JSON.stringify([v.time * 1000]),
                  })
                })
              })
            return dbData
          } else {
            return new Promise(function (resolve, reject) {
              hippo
                .newSimpleExhaler()
                .space('single_line_statistics')
                .index('machine_id', [main.machine_id])
                .indexRange('date', date, date)
                .columns(
                  'main_program',
                  'part_count',
                  'run_program',
                  'single_line',
                  'times_total_arr'
                )
                .exhale(function (data) {
                  let temp = _.map(data.exhalable, (obj) => {
                    if (obj.single_line === '-1')
                      obj.single_line = `${i18n('Blank_Lines')}`
                    return obj
                  })
                  resolve(temp)
                })
            })
          }
        } catch (e) {
          console.log('main is:' + main)
          return []
        }
      },
      mainPGDataSetFilterLine: function (obj) {
        let context = this
        context.filterLine = {
          main_program: obj.main_program,
          date: obj.date.date8BitsToSlashed(),
          machine_id: obj.machine_id,
          part_count: obj.part_count,
          times_total: obj.times_total,
        }
      },
      getArrTotalTime: function (value) {
        let total = 0
        _.chain(value)
          .map((obj) => obj.times_total_arr)
          .each((list) => _.each(list, (num) => (total += parseFloat(num))))
        return total
      },
      getRunProgramFilterCallback(obj, main) {
        return (
          obj.main_program === main.main_program &&
          obj.part_count === main.part_count
        )
      },
      getCurCompareMain: function (label) {
        let context = this
        return _.find(context.compareData, (obj) => {
          let temp = JSON.parse(JSON.stringify(obj))
          temp[2] = servkit.getMachineName(obj[2])
          temp[3] = context.getPartCountLabel(temp[3])
          return context.buildTick(context.yMutilIndex, temp) === label
        })
      },
      getPartCountLabel: function (partCount) {
        if (partCount.includes(`${i18n('Estimated')}`)) {
          return partCount
        } else {
          return `${i18n('Actual_Time')}-` + partCount
        }
      },
    },
    preCondition: {
      dbdata: function (done) {
        servkit.ajax(
          {
            url: 'api/shzbg/single/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip-0.9.0.min.js',
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
