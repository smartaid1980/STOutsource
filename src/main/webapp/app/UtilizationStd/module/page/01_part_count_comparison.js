export default function () {
  GoGoAppFun({
    gogo(context) {
      console.log(context)
      context.initModal()
      context.initQueryForm()
      context.initReportTable()
    },
    util: {
      submitLoadingBtn: servkit.loadingButton($('#submit')[0]),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $submitBtn: $('#submit'),
      $machineSelect: $('#machine_id'),
      $plantSelect: $('#plant_id'),
      $queryConditionForm: $('#query-condition-form'),
      $confirmCloseBtn: $('#confirm-yes'),
      $confirmModal: $('#confirm-modal-widget'),
      $processInfo: $('.process-info'),
      timeThreshold: servtechConfig.ST_TIMETHRESHOLD || -1, // 資料之間間隔多少毫秒才算離線
      initQueryForm() {
        const context = this
        const {
          $machineSelect,
          $plantSelect,
          $startDate,
          $endDate,
          $submitBtn,
          $queryConditionForm,
        } = context
        servkit.initSelectWithList(
          Object.keys(context.preCon.plantArea),
          $plantSelect,
          true
        )
        servkit.initDatePicker($startDate, $endDate)
        $submitBtn.click(function (e) {
          e.preventDefault()
          context.getData()
        })
        $plantSelect
          .on('change', function () {
            let plantIdArray = $(this).val()
            let machineIdList
            let machineMapList
            plantIdArray = plantIdArray
              ? plantIdArray.filter((x) => x !== 'ALL')
              : []
            if (plantIdArray.length) {
              machineIdList = _.chain(context.preCon.plantAreaMachine)
                .pick(plantIdArray)
                .values()
                .flatten()
                .value()
                .sort()
            } else {
              machineIdList = _.chain(context.preCon.plantAreaMachine)
                .values()
                .flatten()
                .value()
                .sort()
            }
            machineMapList = Object.fromEntries(
              machineIdList.map((id) => [id, servkit.getMachineName(id)])
            )
            servkit.initSelectWithList(machineMapList, $machineSelect, true)
          })
          .change()
        $queryConditionForm.on('change', '[name=search-by]', function () {
          const container = this.closest('.col')
          const isDisabled = !this.checked
          Array.from(container.querySelectorAll('.form-element')).forEach(
            (el) => (el.disabled = isDisabled)
          )
        })
      },
      getData() {
        const context = this
        const requetParam = {}
        const searchBy = new Set(
          $('[name=search-by]:checked')
            .map((i, el) => el.value)
            .toArray()
        )

        context.submitLoadingBtn.doing()
        if (searchBy.has('date')) {
          const startDate = $('#start-date').val()
          const endDate = $('#end-date').val()
          Object.assign(requetParam, {
            startDate,
            endDate,
          })
        }
        if (searchBy.has('work_id')) {
          const workId = $('#work-id').val()
          Object.assign(requetParam, {
            workId,
          })
        }
        if (searchBy.has('machine_id')) {
          const machineId = $('#machine_id option:selected')
            .toArray()
            .map((el) => el.textContent)
          Object.assign(requetParam, {
            machineId,
          })
        }
        if (_.isEmpty(requetParam)) {
          alert('請勾選愈查詢之條件')
          return
        }
        const calcBy = $('[name=calc_by]:checked').val()
        const workStatus = $('[name=work_status]:checked').val()
        Object.assign(requetParam, {
          calcBy,
          workStatus,
        })
        servkit.ajax(
          {
            url: 'api/jinfu/utilization',
            type: 'GEt',
            data: requetParam,
          },
          {
            success(data) {
              context.reportTable.drawTable(
                data.map((d) =>
                  _.mapObject(d, (v, k) => {
                    if (k === 'exp_mdate' || k === 'exp_edate') {
                      return v.toFormatedDatetime()
                    } else if (k === 'program_name') {
                      return v.match(/(^[^\s(]+)\s*\(?/)?.[1]
                    }
                    return v
                  })
                )
              )
              context.submitLoadingBtn.done()
            },
          }
        )
      },
      initReportTable() {
        const context = this
        const { $queryConditionForm } = context
        const MILLISECOND_A_DAY = 24 * 60 * 60 * 1000
        const getDenomator = (calcBy, data) => {
          let result
          switch (calcBy) {
            case 'power_millisecond':
              result = data.power_millisecond
              break
            case 'workshift_millisecond':
              result = data.workshift_millisecond
              break
            case 'natural_day':
              result = data.power_millisecond === 0 ? 0 : MILLISECOND_A_DAY
          }
          return result
        }
        const columns = [
          {
            name: 'work_id',
            data: 'work_id',
          },
          {
            name: 'product_id',
            data: 'product_id',
          },
          {
            name: 'product_name',
            data: 'product_name',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'machine_id',
            data: 'machine_id',
            render(data, type) {
              if (type === 'display' || type === 'selectFilter') {
                return servkit.getMachineName(data)
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'program_name',
            data: 'program_name',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'power_millisecond',
            data: 'power_millisecond',
            render(data, type) {
              if (type === 'display') {
                return data === '---' ? data : data.millisecondToHHmmss()
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'operate_millisecond',
            data: 'operate_millisecond',
            render(data, type) {
              if (type === 'display') {
                return data === '---' ? data : data.millisecondToHHmmss()
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'cutting_millisecond',
            data: 'cutting_millisecond',
            render(data, type) {
              if (type === 'display') {
                return data === '---' ? data : data.millisecondToHHmmss()
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'downtime',
            data: 'downtime',
            render(data, type) {
              if (type === 'display') {
                return data === '---' ? data : data.millisecondToHHmmss()
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'utilization',
            data: 'utilization',
            render(data, type) {
              if (type === 'display') {
                return data === '---' ? data : data.floatToPercentage()
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'effective_utilization',
            data: 'effective_utilization',
            render(data, type) {
              if (type === 'display') {
                return data === '---' ? data : data.floatToPercentage()
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'exp_mdate',
            data: 'exp_mdate',
          },
          {
            name: 'exp_edate',
            data: 'exp_edate',
          },
          {
            name: 'work_qty',
            data: 'work_qty',
          },
          {
            name: 'part_count',
            data: 'part_count',
          },
          {
            name: 'part_count_diff',
            data: 'part_count_diff',
            render(data, type) {
              if (type === 'display') {
                return `<span ${
                  data && data < 0 ? 'style="color: red"' : ''
                }>${data}</span>`
              } else {
                return data
              }
            },
          },
          {
            name: 'completion_percentage',
            data: 'completion_percentage',
            render(data, type) {
              if (type === 'display') {
                return data === '---' ? data : data.floatToPercentage()
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'close',
            data: null,
            render(data, type, rowData) {
              const { is_close = 'N', exp_edate } = rowData
              const isExceedEndDate = moment().isAfter(
                moment(exp_edate.toFormatedDatetime()).add(1, 'days')
              )
              const isDisabled = is_close === 'Y' || isExceedEndDate
              return `<button class="btn btn-success close-work" ${
                isDisabled ? 'disabled' : ''
              }>結案</button>`
            },
          },
          {
            name: 'process',
            data: null,
            render(data) {
              return `<button class="btn btn-primary process">在製過程</button>`
            },
          },
        ]
        context.reportTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          columnDefs: [
            {
              type: 'num-cust',
              targets: [5, 6, 7, 8, 9, 10, 14, 15, 16],
            },
          ],
          columns,
          summaryInfo: {
            text(tableData, tableApi) {
              if (!tableData.length) {
                return ''
              }
              let denominator
              const calcBy = $queryConditionForm
                .find('[name=calc_by]:checked')
                .val()
              const sumData = tableData.reduce(
                (a, x) => {
                  denominator = getDenomator(calcBy, x)
                  a.denominator += denominator
                  a.operate_millisecond += x.operate_millisecond
                  a.cutting_millisecond += x.cutting_millisecond
                  return a
                },
                {
                  denominator: 0,
                  operate_millisecond: 0,
                  cutting_millisecond: 0,
                }
              )
              const utilization =
                sumData.denominator === 0
                  ? '0.00%'
                  : (
                      sumData.operate_millisecond / sumData.denominator
                    ).floatToPercentage()
              const effectiveUtilization =
                sumData.denominator === 0
                  ? '0.00%'
                  : (
                      sumData.cutting_millisecond / sumData.denominator
                    ).floatToPercentage()
              return `平均總覽 稼動率：${utilization} / 有效稼動率：${effectiveUtilization}`
            },
          },
          excel: {
            fileName: '工單產量比對',
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
              '0.00%',
              '0.00%',
              'text',
              'text',
              '0',
              '0',
              '0',
              '0.00%',
            ],
            customHeaderFunc: function (tableHeader) {
              return tableHeader.slice(0, 17)
            },
            customDataFunc: function (tableData) {
              let value
              let name
              return tableData
                .map((data) =>
                  columns.slice(0, 17).map((colDef) => {
                    name = colDef.name
                    value = data[name]
                    switch (name) {
                      case 'power_millisecond':
                      case 'operate_millisecond':
                      case 'cutting_millisecond':
                      case 'downtime':
                        value =
                          value !== '---' ? value.millisecondToHHmmss() : value
                        break
                      case 'machine_id':
                        value = servkit.getMachineName(value)
                        break
                    }
                    return value
                  })
                )
                .toArray()
            },
          },
        })
        $('#query-result-table')
          .on('click', '.process', function () {
            context.showModal(this.closest('tr'))
          })
          .on('click', '.close-work', function () {
            context.showConfirmModal(this.closest('tr'))
          })

        context.$confirmCloseBtn.on('click', function () {
          const dataset = $(this).data()
          context.updateWorkStatus(dataset.rowData, dataset.tr)
        })
      },
      showConfirmModal(tr) {
        const context = this
        const { $confirmCloseBtn, $confirmModal } = context
        const rowData = context.reportTable.table.row(tr).data()
        $('#confirm-content').find('span').text(rowData.work_id)
        $confirmCloseBtn.data({ rowData, tr })
        $confirmModal.modal('show')
      },
      updateWorkStatus(rowData, tr) {
        const context = this
        const { $confirmModal, reportTable } = context
        const { work_id } = rowData
        servkit.ajax(
          {
            url: 'api/jinfu/work/updateWorkStatus',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              work_id,
              is_close: 'Y',
            }),
          },
          {
            success(data) {
              $confirmModal.modal('hide')
              reportTable.table
                .row(tr)
                .data(Object.assign({}, rowData, { is_close: 'Y' }))
                .draw(false)
            },
          }
        )
      },
      initModal() {
        const context = this
        // 如果圖畫在隱藏的元素中會跑版，所以先show modal再畫
        $('#process-modal').on('shown.bs.modal', function () {
          const { plotDataSet, plotConfig } = context
          const $placeholder = $(
            "<div style='width:100%;height:100px;'></div>"
          ).attr('name', 'placeholder')
          $('#stack-chart').empty()
          $('#stack-chart').append($placeholder)
          $.plot($placeholder, plotDataSet, plotConfig)
        })
      },
      showModal(tr) {
        const context = this
        const { reportTable, $queryConditionForm } = context
        const rowData = reportTable.table.row(tr).data()
        const { machine_id: machine_name } = rowData
        const columns = [
          'machine_id',
          'status',
          'start_time',
          'end_time',
          'alarm_code',
          'duration',
          'cnc_brand',
          'invalid_macro',
        ]
        const { startDate, endDate } = context.getDate(
          rowData.exp_mdate,
          rowData.exp_edate
        )
        const calcBy = $queryConditionForm.find('[name=calc_by]:checked').val()
        const hippoConfig = {
          machine_id: _.findKey(
            servkit.getMachineMap(),
            (v, k) => v.device_name === machine_name
          ),
          startDate,
          endDate,
          columns,
        }
        $('#stack-chart').empty()
        context.renderWorkInfo(rowData)

        Promise.all([
          context.getTimeRangeObj(startDate, endDate, calcBy),
          context.getHippoData(hippoConfig),
        ]).then(([timeRangeObj, hippoData]) => {
          const dataList = []
          // 補上離線資料
          // 如果沒有資料的時間區間大於timeThreshold則補上離線資料
          // 不然就會用後面一筆資料補上這段空白(開始時間往前延伸)
          let lastEndTime = null
          let isEmptySpanGreaterThanThreshold
          _.each(hippoData, (elem) => {
            const startTime = new Date(elem.start_time.date20BitsToFormatted())
            isEmptySpanGreaterThanThreshold =
              context.timeThreshold !== -1 &&
              lastEndTime &&
              startTime.getTime() - lastEndTime.getTime() >
                context.timeThreshold

            if (isEmptySpanGreaterThanThreshold) {
              dataList.push(
                context.createOfflineobj(elem, lastEndTime, startTime)
              )
              lastEndTime = null
            }
            elem.status = elem.status === 'B' ? '0' : elem.status
            elem.start_time =
              lastEndTime || new Date(elem.start_time.date20BitsToFormatted())
            elem.end_time = new Date(elem.end_time.date20BitsToFormatted())
            lastEndTime = elem.end_time
            dataList.push(elem)
          })
          if (!dataList.length) {
            alert('查無資訊')

            return
          }
          const firstData = _.first(dataList)
          // 補上minTime到第一筆資料的離線資料
          const plotData = []
          let dummy = context.createDummyObj(
            rowData.machine_id,
            firstData.cnc_brand,
            timeRangeObj.minTime,
            firstData.start_time
          )
          if (dummy) {
            plotData.push(dummy)
          }
          _.each(dataList, function (elem) {
            var obj = {}
            obj.deviceId = elem.machine_id
            obj.cnc_brand = elem.cnc_brand
            obj.lightId = elem.status
            obj.macroCode = elem.invalid_macro

            obj.deviceName = servkit.getMachineName(elem.machine_id)
            obj.lightName = servkit.getMachineLightName(elem.status)
            obj.start =
              elem.start_time < timeRangeObj.minTime
                ? moment(timeRangeObj.minTime).format('YYYY/MM/DD HH:mm:ss')
                : moment(elem.start_time).format('YYYY/MM/DD HH:mm:ss')
            obj.end =
              elem.end_time > timeRangeObj.maxTime
                ? moment(timeRangeObj.maxTime).format('YYYY/MM/DD HH:mm:ss')
                : moment(elem.end_time).format('YYYY/MM/DD HH:mm:ss')
            obj.rawTime = context.getRawTime(obj.start, obj.end)
            obj.period = obj.rawTime.millisecondToHHmmss()
            obj.alarmCode =
              elem.alarm_code === '-1' || elem.alarm_code === 'B'
                ? ''
                : elem.alarm_code.replace(/#/g, ',')
            if (context.preCon.getCncAlarmCodeMap[elem.cnc_brand]) {
              if (
                context.preCon.getCncAlarmCodeMap[elem.cnc_brand][obj.alarmCode]
              ) {
                obj.alarmStatus =
                  context.preCon.getCncAlarmCodeMap[elem.cnc_brand][
                    obj.alarmCode
                  ]
              } else if (obj.alarmCode.includes(',')) {
                obj.alarmStatus = _.map(obj.alarmCode.split(','), function (
                  code
                ) {
                  return (
                    context.preCon.getCncAlarmCodeMap[elem.cnc_brand][code] ||
                    code
                  )
                }).join(',')
              } else {
                obj.alarmStatus = '---'
              }
            } else {
              obj.alarmStatus = '---'
            }

            if (obj.rawTime > 0) {
              plotData.push(obj)
            }
          })
          // 補上最後一筆資料到maxTime的離線資料
          dummy = context.createDummyObj(
            rowData.machine_id,
            firstData.cnc_brand,
            _.last(dataList).end_time,
            timeRangeObj.maxTime
          )
          if (dummy) {
            plotData.push(dummy)
          }
          // var groupedPlotObj = _.groupBy(plotObj, 'deviceId')
          // var machineList = _.keys(groupedPlotObj)
          const dataSet = []
          let lastElem = {}
          // 如果前後顏色一樣就合併資料
          _.each(plotData, function (elem) {
            var lightId = elem.lightId
            // 如果前後筆資料狀態相同
            const isLightIdEqual =
              lastElem.lightId && lastElem.lightId === lightId
            const isMacroCodeEqual = lastElem.macroCode === elem.macroCode
            // 前後筆燈號一樣且不是閒置
            // 前後筆燈號一樣且是閒置且無效代碼一樣(或沒有無效代碼)
            if (
              (isLightIdEqual && lightId !== '12') ||
              (isLightIdEqual &&
                lightId === '12' &&
                ((elem.macroCode && isMacroCodeEqual) || !elem.macroCode))
            ) {
              dataSet.pop()
              elem.start = lastElem.start
            }
            var start = elem.start
            var end = elem.end
            var rawTime = context.getRawTime(start, end)
            var offSetPeriod = rawTime.millisecondToHHmmss()
            // 套用無效代碼設定的顏色
            let color =
              lightId === '12' &&
              elem.macroCode &&
              elem.macroCode !== '---' &&
              elem.macroCode !== '0'
                ? context.getMacroProp(elem.macroCode, 'color_code')
                : servkit.getMachineLightColor(lightId)
            color =
              color === '---' ? servkit.getMachineLightColor(lightId) : color
            var obj = {
              label:
                '&nbsp' +
                servkit.getMachineLightName(lightId) +
                '<br>' +
                start +
                ' ~ ' +
                end +
                '<br>' +
                offSetPeriod,
              data: [[rawTime, 0]],
              color,
            }
            lastElem = elem

            dataSet.push(obj)
          })
          var option = {
            series: {
              stack: true,
              bars: {
                show: true,
              },
            },
            bars: {
              lineWidth: 0.5,
              barWidth: 1,
              horizontal: true,
            },
            xaxis: {
              mode: 'time',
              axisLabel: 'Time ( MM/DD )',
              tickSize: [1, 'day'],
              tickFormatter: function (value, axis) {
                // 沒有的話會從格林威治時間開始
                // value是時間長度，所以要用起始時間加上value才是正確的時間
                return moment(timeRangeObj.minTime).add(value).format('MM/DD')
              },
            },
            yaxis: {
              ticks: function () {
                let machineName = servkit.getMachineName(rowData.machine_id)
                machineName =
                  machineName.length > 20
                    ? '...' + machineName.substring(machineName.length - 17)
                    : machineName
                return [[0.5, machineName]]
              },
            },
            grid: {
              hoverable: true,
            },
            legend: {
              show: true,
              position: 'ne',
              container: 'machineName',
            },
            tooltip: true,
            tooltipOpts: {
              content: '%s',
              defaultTheme: false,
            },
          }
          context.plotDataSet = dataSet
          context.plotConfig = option
          $('#process-modal').modal('show')
        })
      },
      renderWorkInfo(rowData) {
        const context = this
        const { $processInfo, reportTable } = context
        const reportTableColumns = _.indexBy(reportTable.config.columns, 'name')
        $processInfo.toArray().forEach((el) => {
          const column = $(el).data('column')
          const value = reportTableColumns[column].render
            ? reportTableColumns[column].render(rowData[column], 'display')
            : rowData[column] || ''
          el.innerHTML = value
        })
      },
      getDate(exp_mdate, exp_edate) {
        let startDate = exp_mdate
        let endDate = exp_edate
        const twentyDaysFromStart = moment(startDate).add('day', 20)
        const now = moment()
        if (moment(endDate).isAfter(now)) {
          endDate = now.format('YYYY/MM/DD')
        } else if (twentyDaysFromStart.isBefore(moment(endDate))) {
          endDate = twentyDaysFromStart.format('YYYY/MM/DD')
        } else {
          endDate = endDate.toFormatedDate()
        }
        startDate = startDate.toFormatedDate()
        return {
          startDate,
          endDate,
        }
      },
      getTimeRangeObj(startDate, endDate, calcBy) {
        return new Promise((res) => {
          let minTime
          let maxTime
          const isCalcByWorkshift = calcBy === 'workshift_millisecond'
          if (isCalcByWorkshift) {
            const startDate8bit = startDate.replace(/\//g, '')
            const endDate8bit = endDate.replace(/\//g, '')
            servkit.ajax(
              {
                url: 'api/workshift/byDateInterval',
                type: 'GET',
                data: {
                  startDate: startDate8bit,
                  endDate: endDate8bit,
                },
              },
              {
                success(data) {
                  minTime = new Date(_.first(data[startDate8bit]).start)
                  maxTime = new Date(_.last(data[endDate8bit]).end)
                  res({
                    minTime,
                    maxTime,
                  })
                },
              }
            )
          } else {
            minTime = new Date(startDate + ' 00:00:00')
            maxTime = new Date(endDate + ' 23:59:59')
            res({
              minTime,
              maxTime,
            })
          }
        })
      },
      getHippoData({ machine_id, startDate, endDate, columns }) {
        return new Promise((res) => {
          hippo
            .newSimpleExhaler()
            .space('machine_status_history_marco')
            .index('machine_id', [machine_id])
            // 如果查詢有細到時間就往前找一天，解決加上時間之後的跨班議題，ex: 9/21 01:00 可能屬於9/20的C班
            .indexRange('date', startDate, endDate)
            .columns(...columns)
            .exhale((exhalable) => {
              res(exhalable.exhalable)
            })
        })
      },
      createDummyObj: function (deviceId, cncBrand, start, end) {
        var rawTime = this.getRawTime(start, end)
        if (rawTime > 0) {
          var leakObj = {}
          leakObj.deviceId = deviceId
          leakObj.deviceName = servkit.getMachineName(deviceId)
          leakObj.cnc_brand = cncBrand
          leakObj.lightId = '0' // 機台無資料視同離線
          leakObj.lightName = servkit.getMachineLightName('0')
          leakObj.alarm_code = ''
          leakObj.alarmStatus = ''
          leakObj.start = moment(start).format('YYYY/MM/DD HH:mm:ss')
          leakObj.end = moment(end).format('YYYY/MM/DD HH:mm:ss')
          leakObj.rawTime = rawTime
          leakObj.period = rawTime.millisecondToHHmmss()
          return leakObj
        }
      },
      createOfflineobj: function (elem, start, end) {
        var obj = Object.assign({}, elem)
        obj.status = '0'
        obj.start_time = moment(start).format('YYYY/MM/DD HH:mm:ss')
        obj.end_time = moment(end).format('YYYY/MM/DD HH:mm:ss')
        obj.alarm_code = ''
        obj.alarmStatus = ''
        obj.lightId = '0'
        obj.rawTime = this.getRawTime(start, end)
        obj.lightName = servkit.getMachineLightName('0')
        obj.period = obj.rawTime.millisecondToHHmmss()
        return obj
      },
      getRawTime: function (start, end) {
        return moment(end) - moment(start)
      },
      getMacroProp(macroCode, propName = 'macro_code_name') {
        const context = this
        const { macroMap } = context.preCon
        return Object.prototype.hasOwnProperty.call(macroMap, macroCode)
          ? macroMap[macroCode][propName]
          : '---'
      },
    },
    delayCondition: ['machineList', 'plantAreaList', 'machinePlantAreaList'],
    preCondition: {
      plantArea(done) {
        done(
          _.mapObject(servkit.getPlantAreaMap(), (value) => value.plant_name)
        )
      },
      plantAreaMachine(done) {
        done(servkit.getPlantAreaMachineMap())
      },
      getCncAlarmCodeMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_alarm',
              columns: ['alarm_id', 'cnc_id', 'alarm_status'],
            }),
          },
          {
            success: function (data) {
              var cncAlarmCodeMap = {}
              _.each(data, function (elem) {
                if (!cncAlarmCodeMap[elem.cnc_id]) {
                  cncAlarmCodeMap[elem.cnc_id] = {}
                }
                cncAlarmCodeMap[elem.cnc_id][elem.alarm_id] = elem.alarm_status
              })
              done(cncAlarmCodeMap)
            },
          }
        )
      },
      macroMap(done) {
        servkit.ajax(
          {
            url: 'api/v3/macro/config/read',
            type: 'GET',
          },
          {
            success(data) {
              done(_.indexBy(data, 'macro_code'))
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        '/js/plugin/datatables/plugin/sort.number.cust.js',
      ],
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
    ],
  })
}
