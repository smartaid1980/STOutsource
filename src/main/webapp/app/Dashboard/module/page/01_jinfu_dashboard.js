export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.initMarquee()
      context.initMachineData()
      context.initMachineModel()
      context.initRefreshFreqSpinner()
      context.setupFullscreen()
      context.initMachineElement(context.$content)
      context.startListenDeviceStatus()
      context.startRotate()
    },
    util: {
      $content: $('#canvas'),
      $marquee: $('#marquee'),
      $fullscreenBtn: $('#fullscreen-btn'),
      $fullscreen: $('#rotate-canvas'),
      $refreshFreqSpinner: $('#refresh-freq-spinner'),
      REFRESH_SCREEN_FREQ: 10,
      GET_HIPPO_DATA_FREQ: 5 * 60 * 1000, // 5min拿一次Hippo資料
      GET_DB_DATA_FREQ: 1 * 60 * 1000, // 1min拿一次DB資料
      intervalId: null,
      // 全螢幕功能 目前關閉
      setupFullscreen() {
        var context = this

        context.$fullscreenBtn.on('click', function (evt) {
          context.$fullscreen.addClass('full')
        })

        context.$fullscreen.on('click', function (evt) {
          context.$fullscreen.removeClass('full')
        })
      },
      // 機台更新頻率 目前關閉
      initRefreshFreqSpinner() {
        const context = this
        const { REFRESH_SCREEN_FREQ } = context

        // 因為要即時根據新的頻率調整所以要放這裡一起調才拿的到 intervalId
        this.$refreshFreqSpinner.spinner({
          min: 10,
          max: 300,
          step: 5,
          stop: function (evt, ui) {
            context.stopRotate()
            context.startRotate()
          },
        })

        // 把暫存的拿出來用
        context.$refreshFreqSpinner.spinner('value', REFRESH_SCREEN_FREQ)

        $(window).on('hashchange', function hashChange(evt) {
          clearInterval(context.intervalId)
          $(window).off('hashchange', hashChange)
        })
      },
      naturalCompare(a, b) {
        var ax = []
        var bx = []

        a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
          ax.push([$1 || Infinity, $2 || ''])
        })
        b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
          bx.push([$1 || Infinity, $2 || ''])
        })

        while (ax.length && bx.length) {
          var an = ax.shift()
          var bn = bx.shift()
          var nn = an[0] - bn[0] || an[1].localeCompare(bn[1])
          if (nn) return nn
        }

        return ax.length - bx.length
      },
      // 跑馬燈
      initMarquee() {
        const context = this

        function Marquee($container) {
          this.alarmMachines = new Set()
          this.delayMachines = new Set()
          this.$container = $container
          this.updateMessage()
          this.run()
        }
        Marquee.prototype = {
          addAlarmMachine(machineName) {
            if (this.alarmMachines.has(machineName)) {
              return
            }
            this.alarmMachines.add(machineName)
            this.updateMessage()
          },
          deleteAlarmMachine(machineName) {
            if (!this.alarmMachines.has(machineName)) {
              return
            }
            this.alarmMachines.delete(machineName)
            this.updateMessage()
          },
          addDelayMachine(machineName) {
            if (this.delayMachines.has(machineName)) {
              return
            }
            this.delayMachines.add(machineName)
            this.updateMessage()
          },
          deleteDelayMachine(machineName) {
            if (!this.delayMachines.has(machineName)) {
              return
            }
            this.delayMachines.delete(machineName)
            this.updateMessage()
          },
          updateMessage() {
            this.$container.text(this.getMarqueeMessage())
          },
          getMarqueeMessage() {
            // 先不排序，這樣越前面的就是狀況持續越久的機台
            return (
              '機台故障：' +
              ([...this.alarmMachines].join(' 、') || '無') +
              '；生產進度落後：' +
              ([...this.delayMachines].join(' 、') || '無')
            )
          },
          run() {
            this.$container.addClass('run')
          },
          stop() {
            this.$container.removeClass('run')
          },
        }
        Object.assign(context, {
          Marquee,
        })
      },
      // 機台資料
      initMachineData() {
        const context = this
        const millisecondsPerTimeUnitMap = {
          H: 60 * 60,
          M: 60,
          S: 1,
        }
        function MachineData() {
          this.machineId
          this.machineName
          this.status
          this.statusDuration
          this.currPartCount
          this.programName
          this.programRemarkMap
          this.standardSecond
          this.currentTime
          this.part_count_diff
          this.start_timestamp
          this.start_partcount
          this.part_count
          this.standard_part_count
          this.work_id
          this.product_id
          this.product_name
        }
        MachineData.prototype = {
          refresh(deviceStatus, machineId, currentTime) {
            this.machineId = machineId
            this.machineName = servkit.getMachineName(machineId)
            this.status = deviceStatus.getValue('G_CONS()', machineId)[0][0]
            this.statusDuration =
              deviceStatus.getValue('CTL_TCNT(G_CONS_)', machineId)[0][1] * 1000
            this.currPartCount = deviceStatus.getValue(
              'G_TOCP()',
              machineId
            )[0][0]
            this.programName = deviceStatus.getValue(
              'G_PRGM()',
              machineId
            )[0][0]
            this.programRemarkMap = this.parseProgramRemark(
              deviceStatus.getValue('G_PGCM()', machineId)[0][0]
            )
            this.standardSecond = this.parseN3(this.programRemarkMap.N3)
            this.currentTime = currentTime
            this.part_count_diff = _.isNumber(this.part_count_diff)
              ? this.part_count_diff
              : '---'
            this.setHippoData()
            this.setWorkData()
          },
          parseProgramRemark(G_PGCM) {
            // G_PGCM: (N1 XXX,N2 XXX,N3 XXX,XXX)
            // 20200211客戶會在後面加上其他備註，且N1可能會有空白和逗號，此處改成只parse N3

            // const remark = G_PGCM.replace(/[()]/g, '');
            // const remarkArr = remark.split(/,(?=N\d)/);
            // let matchResult;
            // const remarkMap = remarkArr.reduce((a, x) => {
            //   matchResult = x.match(/(N\d)\s(.*)/);
            //   if (matchResult) {
            //     a[matchResult[1]] = matchResult[2];
            //   }
            //   return a;
            // }, {});

            // N3 XHXMXS，X為正數
            const matchResult = G_PGCM.match(
              /N3 (\d+(\.\d+)?H)?(\d+(\.\d+)?M)?(\d+(\.\d+)?S)?/
            )
            const remarkMap = {
              N3: matchResult ? matchResult[0] : '',
            }
            return Object.assign(
              {
                N1: '',
                N2: '',
                N3: '',
                N4: '',
                N5: '',
                N6: '',
                N7: '',
              },
              remarkMap
            )
          },
          parseN3(N3 = '') {
            const matchResult = N3.match(/\d+(\.\d+)?[HMS]/g)
            let num
            let timeUnit
            return matchResult
              ? matchResult.reduce((a, x) => {
                  num = x.slice(0, -1)
                  timeUnit = x.slice(-1)
                  return a + Number(num) * millisecondsPerTimeUnitMap[timeUnit]
                }, 0)
              : 0
          },
          setHippoData(hippoData) {
            const data = hippoData || this.hippoData
            if (hippoData) {
              this.hippoData = hippoData
            }
            if (!data) {
              return
            }
            // 要檢查是否為同一張單，避免換單卻用上一筆資料算
            const isSameWork = data.program_name === this.programName
            const { start_timestamp, start_partcount } = data
            const part_count = this.currPartCount - start_partcount
            const standard_part_count = this.standardSecond
              ? Math.floor(
                  (moment(this.currentTime) -
                    moment(start_timestamp.date20BitsToFormatted())) /
                    this.standardSecond /
                    1000
                )
              : '---'
            const part_count_diff = this.standardSecond
              ? part_count - standard_part_count
              : '---'

            this.start_timestamp = isSameWork ? start_timestamp : null
            this.start_partcount = isSameWork ? start_partcount : null
            this.part_count = isSameWork ? part_count : null
            this.standard_part_count = isSameWork ? standard_part_count : null
            this.part_count_diff = isSameWork ? part_count_diff : null

            if (part_count_diff < 0 && this.status === '11') {
              context.marquee.addDelayMachine(this.machineName)
            } else {
              context.marquee.deleteDelayMachine(this.machineName)
            }
          },
          setWorkData(workData) {
            const data = workData || this.workData
            if (workData) {
              this.workData = workData
            }
            if (!data) {
              return
            }
            // 要檢查是否為同一張單，避免換單卻用上一筆資料算
            const isSameWork = data.program_name === this.programName
            this.work_id = isSameWork ? data.work_id : null
            this.product_id = isSameWork ? data.product_id : null
            this.product_name = isSameWork ? data.product_name : null
          },
        }
        Object.assign(context, {
          MachineData,
        })
      },
      // 儲存機台的資料、更新畫面、取得DB / HIPPO資料
      initMachineModel() {
        const context = this
        const { GET_DB_DATA_FREQ, GET_HIPPO_DATA_FREQ } = context
        class MachineModel {
          constructor(machineFrame, machineIdList) {
            this.machineIdList = machineIdList
            this.machineDataMap = Object.fromEntries(
              machineIdList.map((id) => [id, null])
            )
            this.currShowingMachineId = []
            this.currShowingElementMap = {}
            this.lastMachineIndex = -1
            this.machineFrame = machineFrame
            this.getHippoIntervalId = null
            this.getDBDataIntervalId = null
          }
          renderNextPage() {
            const self = this
            const { elementFrame } = this.machineFrame
            const flattenFrame = _.flatten(elementFrame)
            let machineId
            this.currShowingElementMap = {}
            this.machineFrame.$container
              .find('.machine-row')
              .fadeOut(500, function () {
                const onlineMachineId = _.chain(
                  Object.entries(self.machineDataMap)
                )
                  .filter(([machine_id, data]) => {
                    if (!data) {
                      console.warn(`${machine_id} 沒有資料`)
                      return false
                    }
                    return data.status && data.status !== 'B'
                  })
                  .map(([machine_id]) => machine_id)
                  .value()
                  .sort()
                if (!onlineMachineId.length) {
                  self.machineFrame.$container
                    .find('.machine-row')
                    .toggleClass('hide', true)
                  self.machineFrame.$container
                    .find('i')
                    .toggleClass('hide', false)
                  return
                }
                if (onlineMachineId.length >= 25) {
                  for (const element of flattenFrame) {
                    if (
                      self.lastMachineIndex ===
                      self.machineIdList.length - 1
                    ) {
                      self.lastMachineIndex = -1
                    }
                    machineId = self.machineIdList[++self.lastMachineIndex]
                    while (self.machineDataMap[machineId].status === 'B') {
                      if (
                        self.lastMachineIndex ===
                        self.machineIdList.length - 1
                      ) {
                        self.lastMachineIndex = -1
                      }
                      machineId = self.machineIdList[++self.lastMachineIndex]
                    }
                    element.machineId = machineId
                    self.currShowingElementMap[machineId] = element
                    element.refresh(
                      self.getMachineInfo(self.machineDataMap[machineId])
                    )
                  }
                } else {
                  for (const element of flattenFrame) {
                    machineId = onlineMachineId.shift()
                    element.machineId = machineId
                    if (machineId) {
                      self.currShowingElementMap[machineId] = element
                    }
                    element.refresh(
                      machineId
                        ? self.getMachineInfo(self.machineDataMap[machineId])
                        : undefined
                    )
                  }
                }
                self.machineFrame.$container.find('.machine-row').fadeIn(500)

                self.machineFrame.$container
                  .find('.machine-row')
                  .toggleClass('hide', false)
                self.machineFrame.$container.find('i').toggleClass('hide', true)
              })
          }
          getMachineInfo(machineData) {
            const {
              product_id = '---',
              product_name = '---',
              work_id = '---',
              machineId,
              status,
              part_count = '---',
              statusDuration,
              part_count_diff,
            } = machineData || {}
            const machineElementInfo = {
              productName: product_name,
              machineName: servkit.getMachineName(machineId),
              workId: work_id,
              outterCircleBgColor: 'offline',
              innerCircleBgColor: 'offline',
              outterCircleInfo: '---',
              innerCircleInfo: '---',
            }
            const isOperating = status === '11'
            machineElementInfo.outterCircleBgColor = this.getStatusClass(status)
            machineElementInfo.outterCircleInfo = part_count
            if (isOperating) {
              machineElementInfo.innerCircleBgColor =
                part_count_diff === '---'
                  ? 'red'
                  : part_count_diff < 0
                  ? 'orange'
                  : 'green'
              machineElementInfo.innerCircleInfo = part_count_diff
            } else {
              machineElementInfo.innerCircleBgColor =
                machineElementInfo.outterCircleBgColor
              if (statusDuration) {
                const DHHmmss = parseInt(statusDuration).millisecondToDHHmmss()
                machineElementInfo.innerCircleInfo = this.getShortenDHHmmss(
                  DHHmmss
                )
              } else {
                machineElementInfo.innerCircleInfo = '---'
              }
            }
            return machineElementInfo
          }
          getShortenDHHmmss(DHHmmss) {
            let result
            const matchResult = DHHmmss.match(/(\d+)D (\d{2}):(\d{2}):(\d{2})/)
            const [, day, hour, minute, second] = matchResult
            const isMoreThanADay = Number(day) !== 0
            const isMoreThanAnHour = Number(hour) !== 0

            if (isMoreThanADay) {
              result = `${day}天${hour}時`
            } else if (isMoreThanAnHour) {
              result = `${hour}時${minute}分`
            } else {
              result = `${minute}分${second}秒`
            }
            return result
          }
          getStatusClass(status) {
            switch (status) {
              case '11':
                return 'online'
              case '12':
                return 'idle'
              case '13':
                return 'alarm'
              case 'B':
                return 'offline'
              default:
                return 'offline'
            }
          }
          getHippoData() {
            const self = this
            const today = ''.toFormatedDate()
            hippo
              .newSimpleExhaler()
              .space('shift_program_data_for_monitor')
              .index('machine_id', this.machineIdList)
              .indexRange('date', today, today)
              .columns(
                'machine_id',
                'date',
                'work_shift',
                'program_name',
                'start_timestamp',
                'start_partcount'
              )
              .exhale(function (exhalable) {
                const dataMap = _.chain(exhalable.exhalable)
                  .groupBy('machine_id')
                  .mapObject((value, key) => {
                    return value.reduce((a, x) =>
                      a.start_timestamp > x.start_timestamp ? a : x
                    )
                  })
                  .value()
                for (const [machineId, hippoData] of Object.entries(dataMap)) {
                  if (
                    self.machineDataMap[machineId].programName ===
                    hippoData.program_name
                  ) {
                    self.machineDataMap[machineId].setHippoData(hippoData)
                    if (self.currShowingElementMap[machineId]) {
                      self.currShowingElementMap[machineId].refresh(
                        self.getMachineInfo(self.machineDataMap[machineId])
                      )
                    }
                  }
                }
              })
          }
          getWorkInfo() {
            const self = this
            const whereClause =
              'exp_mdate < NOW() AND exp_edate > NOW() AND is_close = "N" ORDER BY exp_mdate ASC'
            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'a_jinfu_view_work_status_work',
                  whereClause,
                }),
              },
              {
                success(data) {
                  const dbData = _.chain(data)
                    .map((value) => {
                      return Object.assign({}, value, {
                        machine_name: value.machine_id,
                        machine_id: context.getMachineId(value.machine_id),
                        program_name: value.program_name.match(
                          /(^[^\s(]+)\s*\(?/
                        )?.[1],
                        exp_mdate: value.exp_mdate.toFormatedDatetime(),
                      })
                    })
                    .groupBy((value) => {
                      return `${value.machine_id}@@${value.program_name}`
                    })
                    .mapObject((dataArr) => {
                      // 理論上同一個時間區間同一機台只會有一個程式名稱
                      // 遇到重複時，取起始時間(exo_mdate)最早的資料
                      // 遇到起始時間也重覆就找工單號最小的資料
                      let compareExpMDate
                      const dataArrSortByWorkIdAsc = [...dataArr].sort(
                        (
                          { work_id: workIdA, exp_mdate: expMDateA },
                          { work_id: workIdB, exp_mdate: expMDateB }
                        ) => {
                          compareExpMDate = expMDateA.localeCompare(expMDateB)
                          return compareExpMDate !== 0
                            ? compareExpMDate
                            : workIdA.localeCompare(workIdB)
                        }
                      )
                      return dataArrSortByWorkIdAsc[0]
                    })
                    .value()
                  const updateList = []
                  let key
                  Object.values(self.machineDataMap).forEach((machineData) => {
                    key = `${machineData.machineId}@@${machineData.programName}`
                    if (Object.prototype.hasOwnProperty.call(dbData, key)) {
                      updateList.push([machineData, dbData[key]])
                    }
                  })
                  updateList.forEach(([machineData, data]) => {
                    machineData.setWorkData(data)
                    if (self.currShowingElementMap[machineData.machineId]) {
                      self.currShowingElementMap[machineData.machineId].refresh(
                        self.getMachineInfo(machineData)
                      )
                    }
                  })
                },
              }
            )
          }
          setIntervalGetData() {
            this.getHippoData()
            this.getWorkInfo()
            this.getHippoIntervalId = setInterval(
              this.getHippoData.bind(this),
              GET_HIPPO_DATA_FREQ
            )
            this.getDBDataIntervalId = setInterval(
              this.getWorkInfo.bind(this),
              GET_DB_DATA_FREQ
            )
          }
        }
        Object.assign(context, {
          MachineModel,
        })
      },
      // 畫機台：單一機台和整個框架
      initMachineElement($container) {
        const context = this
        const machineCountAtOnce = 25
        class MachineFrame {
          constructor({ machineCountAtOnce = 10, $container }) {
            this.elementFrame = []
            this.$container = $container
            this.machineCountAtOnce = machineCountAtOnce
            this._createFrame()
          }
          _createFrame() {
            const { machineCountAtOnce, elementFrame } = this
            const row = document.createElement('DIV')
            let machineElement

            row.classList.add('machine-row', 'hide')

            for (let i = 1; i <= machineCountAtOnce; i++) {
              machineElement = new MachineElement()
              elementFrame.push(machineElement)
              row.appendChild(machineElement.element.container)
            }
            $container[0].appendChild(row)
            $container.append(
              $("<i class='fa fa-gear fa-spin' style='font-size: 10em;'></i>")
            )
          }
        }
        class MachineElement {
          constructor() {
            this.element = this._createElement()

            this.machineInfo = {
              productName: '',
              machineName: '',
              workId: '',
              outterCircleBgColor: '',
              innerCircleBgColor: '',
              outterCircleInfo: '',
              innerCircleInfo: '',
            }
            this.machineId = ''
            this._init()
          }
          _init() {
            const self = this
            const handler = {
              set(obj, prop, value) {
                if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
                  console.warn('machineInfo不得新增屬性')
                  return
                }
                switch (prop) {
                  case 'machineName':
                    self.element.machineName.textContent = value
                    break
                  case 'productName':
                    self.element.productName.textContent = value
                    self.element.productName.title = value
                    break
                  case 'workId':
                    self.element.workId.textContent = value
                    break
                  case 'outterCircleBgColor':
                    self.element.outterCircle.className = `outter-circle ${value}`
                    break
                  case 'innerCircleBgColor':
                    self.element.innerCircle.className = `inner-circle ${value}`
                    break
                  case 'outterCircleInfo':
                    self.element.outterCircleInfo.textContent = value
                    break
                  case 'innerCircleInfo':
                    self.element.innerCircleInfo.textContent = value
                    break
                }
                obj[prop] = value
                return true
              },
            }
            this.machineInfo = new Proxy(this.machineInfo, handler)
          }
          _createElement() {
            if (this.machine) {
              return
            }
            const container = document.createElement('DIV')
            // 機台文字用span包起來，更改文字時只要更新這裡
            const title = document.createElement('DIV')
            const machineName = document.createElement('DIV')
            const productName = document.createElement('DIV')
            const workId = document.createElement('DIV')
            const outterCircle = document.createElement('DIV')
            const outterCircleInfo = document.createElement('DIV')
            const innerCircle = document.createElement('DIV')
            const innerCircleInfo = document.createElement('DIV')

            title.classList.add('title')
            machineName.classList.add('machine-name')
            productName.classList.add('product-name')
            workId.classList.add('work-id')
            outterCircle.classList.add('outter-circle')
            outterCircleInfo.classList.add('value')
            innerCircle.classList.add('inner-circle')
            innerCircleInfo.classList.add('diff')

            innerCircle.appendChild(innerCircleInfo)
            outterCircle.appendChild(outterCircleInfo)
            outterCircle.appendChild(innerCircle)

            title.appendChild(productName)
            title.appendChild(workId)
            title.appendChild(machineName)

            container.appendChild(title)
            container.appendChild(outterCircle)

            return {
              container,
              machineName,
              productName,
              workId,
              title,
              outterCircle,
              outterCircleInfo,
              innerCircle,
              innerCircleInfo,
            }
          }
          refresh(machineInfo = {}) {
            this.element.container.classList.toggle(
              'hide',
              _.isEmpty(machineInfo)
            )
            for (const [key, value] of Object.entries(this.machineInfo)) {
              if (
                Object.prototype.hasOwnProperty.call(machineInfo, key) &&
                machineInfo[key] !== value
              ) {
                this.machineInfo[key] = machineInfo[key]
              }
            }
          }
        }
        context.machineFrame = new MachineFrame({
          machineCountAtOnce,
          $container,
        })
      },
      startListenDeviceStatus() {
        const context = this
        const { $marquee, MachineModel, Marquee } = context
        const machineListInBox = _.chain(servkit.getBoxMap())
          .values()
          .flatten()
          .pluck('device_id')
          .value()
        context.marquee = new Marquee($marquee)
        context.machineModel = new MachineModel(
          context.machineFrame,
          machineListInBox
        )

        servkit.subscribe('DeviceStatus', {
          machines: servkit.getBoxList(),
          dataModeling: true,
          handler(data) {
            const deviceStatus = data[0]
            const currentTime = ''.toFormatedDatetime()
            let isRenderNextPage = false
            let isGetData = false
            deviceStatus.eachMachine('G_CONS()', function (
              multisystem,
              machineId
            ) {
              let machineData = context.machineModel.machineDataMap[machineId]
              if (machineData) {
                machineData.refresh(deviceStatus, machineId, currentTime)
              } else {
                machineData = new context.MachineData(
                  deviceStatus,
                  machineId,
                  currentTime
                )
                machineData.refresh(deviceStatus, machineId, currentTime)
                context.machineModel.machineDataMap[machineId] = machineData
                isGetData = true
                isRenderNextPage = true
              }

              if (machineData.status === '13') {
                context.marquee.addAlarmMachine(machineData.machineName)
              } else {
                context.marquee.deleteAlarmMachine(machineData.machineName)
              }
            })
            if (isGetData) {
              context.machineModel.setIntervalGetData()
            }
            if (isRenderNextPage) {
              context.machineModel.renderNextPage()
            }
          },
        })
      },
      startRotate() {
        const context = this

        if (!context.intervalId) {
          context.intervalId = setInterval(
            context.machineModel.renderNextPage.bind(context.machineModel),
            context.$refreshFreqSpinner.spinner('value') * 1000
          )
        }
      },
      // for dev
      stopRotate() {
        const context = this

        if (context.intervalId) {
          clearInterval(context.intervalId)
          context.intervalId = null
        }
      },
      getMachineId(machine_name) {
        return _.findKey(
          servkit.getMachineMap(),
          (v, k) => v.device_name === machine_name
        )
      },
    },
    preCondition: {},
    delayCondition: ['machineList'],
    dependencies: [],
  })
}
