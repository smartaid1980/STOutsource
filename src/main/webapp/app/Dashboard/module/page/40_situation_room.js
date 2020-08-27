export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      window.window.setup_widgets_desktop()

      $('#demonstrator>.online').css(
        'background-color',
        servkit.getMachineLightColor('11')
      )
      $('#demonstrator>.idle').css(
        'background-color',
        servkit.getMachineLightColor('12')
      )
      $('#demonstrator>.alarm').css(
        'background-color',
        servkit.getMachineLightColor('13')
      )

      let options = _.keys(ctx.preCon.workStatus)
        .map(
          (productId) => `<option value="${productId}">${productId}</option>`
        )
        .join('')
      $('#product')
        .html(options)
        .on('change', function (e) {
          ctx.product = this.value
          if (!ctx.plantStatusMap) {
            ctx.calcMachineStatusNow(ctx)
          }
          ctx.initMachine(ctx)
        })
        .trigger('change')

      servkit
        .schedule('update')
        .action(() => {
          $('#update-time').text(
            `更新時間： ${moment().format('YYYY/MM/DD HH:mm:ss')} (每1分鐘更新)`
          )
          ctx.calcMachineStatusNow(ctx)
          ctx.drawPieChart(ctx)
          ctx.initPlant(ctx)
          ctx.initMachine(ctx)
        })
        .freqMillisecond(60000)
        .start()

      // prevent from logout
      servkit
        .schedule('login')
        .freqMillisecond(20 * 60 * 1000)
        .action(function () {
          servkit.ajax(
            {
              url: 'api/user/loginInfo',
            },
            {
              success: function () {},
            }
          )
        })
        .start()
    },
    util: {
      product: null,
      initPlant(ctx) {
        $('#plant-div').empty()
        let allPlant = {
          plant: 'ALL',
          workNum: 0,
          idleSecond: 0,
          powerSecond: 0,
          yieldAry: [],
          outputNow: 0,
          outputMax: 0,
        }
        _.each(servkit.getPlantAreaMap(), (plantId) => {
          let plant = plantId.plant_id
          if (ctx.plantStatusMap[plant]) {
            let obj = {
              plant,
              workNum: ctx.plantStatusMap[plant].workNum,
              downRatio:
                ctx.plantStatusMap[plant].idleSecond /
                ctx.plantStatusMap[plant].powerSecond, // (12) / (not 0)
              yieldRatio:
                ctx.plantStatusMap[plant].yieldAry.reduce((a, b) => a + b) /
                ctx.plantStatusMap[plant].yieldAry.length,
              outputNow: ctx.plantStatusMap[plant].outputNow,
              outputMax: ctx.plantStatusMap[plant].outputMax,
            }
            $('#plant-div').append(ctx.plantTemplate(obj))

            allPlant.workNum += obj.workNum
            allPlant.idleSecond += ctx.plantStatusMap[plant].idleSecond
            allPlant.powerSecond += ctx.plantStatusMap[plant].powerSecond
            allPlant.yieldAry.push(obj.yieldRatio)
            allPlant.outputNow += obj.outputNow
            allPlant.outputMax += obj.outputMax
          }
        })

        allPlant.downRatio = allPlant.idleSecond / allPlant.powerSecond
        allPlant.yieldRatio =
          allPlant.yieldAry.reduce((a, b) => a + b) / allPlant.yieldAry.length
        $('#plant-div')
          .prepend(ctx.plantTemplate(allPlant))
          .prepend(
            `<div class="txt-lg title" style="margin-bottom: 1vh;">廠區總覽</div>`
          )

        let options = {
          lineCap: 'butt',
          // barColor: b,
          trackColor: 'rgba(0,0,0,0.2)',
          scaleColor: 0,
          lineWidth: window.innerHeight / 120,
          trackWidth: window.innerHeight / 120,
          size: window.innerHeight / 11,
          onStep(from, to, percent) {
            $(this.el).find('.percent').text(Math.round(percent))
          },
        }
        $('.easy-pie-chart.idle').easyPieChart(
          _.extend(options, { barColor: servkit.getMachineLightColor('12') })
        )
        $('.easy-pie-chart.yield').easyPieChart(
          _.extend(options, { barColor: servkit.getMachineLightColor('11') })
        )
        // pageSetUp();
      },
      plantTemplate(obj) {
        let percentage = (obj.outputNow / obj.outputMax).floatToPercentage()
        return `
          <div class="inline-block">
            <div class="well flex-column" id="${obj.plant}">
              <div class="well-header txt-lg">${obj.plant}</div>
              <div class="pie-charts flex">
                <!-- 工單數 -->
                <div class="block">
                  <div class="block-title txt-md">工單數</div>
                  <div class="content text txt-md">${obj.workNum}</div>
                </div>

                <!-- 閒置比 -->
                <div class="block">
                  <div class="block-title txt-md">閒置比</div>
                  <div class="content easy-pie-chart idle txt-color-orange" name="downtime" data-percent="${obj.downRatio.floatToPercentage()}">
                    <div class="percent txt-sm"></div>
                  </div>
                </div>

                <!-- 良率 -->
                <div class="block">
                  <div class="block-title txt-md">良率</div>
                  <div class="content easy-pie-chart yield txt-color-green" name="yield" data-percent="${obj.yieldRatio.floatToPercentage()}">
                    <div class="percent txt-sm"></div>
                  </div>
                </div>
              </div>

              <div calss="bar">
                <!-- 產量 -->
                <div class="txt-md">本日產量</div>
                <div class="progress progress-xl" name="output">
                  <div class="progress-bar" style="width: ${percentage};"></div>
                  <span class="txt-sm" style="left: ${percentage};">${
          obj.outputNow
        } / ${obj.outputMax}</span>
                </div>
              </div>
            </div>
          </div>`
      },
      initMachine(ctx) {
        $('#product-works').html(ctx.machineTitleTemplate())
        _.each(ctx.preCon.workStatus[ctx.product].works, (work) => {
          let { machine_id, staff, quantity, name, standard_work } = work
          let color = servkit.getMachineLightColor(
            ctx.machineStatusNow[machine_id].status
          )
          let act_partcount = ctx.machineStatusNow[machine_id].good
          let est_partcount = Math.floor(
            ctx.machineStatusNow[machine_id].duration / standard_work
          ) // 預期產量=目前時間/標工
          let yeild =
            ctx.machineStatusNow[machine_id].good /
            ctx.machineStatusNow[machine_id].output
          let obj = {
            color,
            machine_id,
            staff,
            quantity,
            name,
            act_partcount,
            est_partcount,
            yeild,
          }
          $('#product-works').append(ctx.machineTemplate(obj))
        })
      },
      machineTitleTemplate() {
        return `
        <div class="header flex">
          <div class="status" style=" width: 1rem;"></div>
          <div class="flex-grow-sm">機台</div>
          <div class="flex-grow-sm">人員</div>
          <div class="flex-grow-sm">目標產量</div>
          <div class="flex-grow-sm">實際產量</div>
          <div class="flex-grow-sm">預期產量</div>
          <div class="flex-grow-sm">良率</div>
          <div class="flex-grow-sm"></div>
          <div class="flex-grow-lg">生產進度</div>
          <div class="flex-grow-sm">工單編號</div>
        </div>`
      },
      machineTemplate(obj) {
        console.log(obj)
        let actProgress = (obj.act_partcount / obj.quantity).floatToPercentage()
        let estimateProgress = (
          obj.est_partcount / obj.quantity
        ).floatToPercentage()
        return `
        <div class="machine flex">
            <div class="status" style="background-color: ${obj.color};"></div>
            <div class="name flex-grow-sm">${obj.machine_id}</div>
            <div class="operator flex-grow-sm">${obj.staff}</div>
            <div class="output flex-grow-sm text-right">${obj.quantity}</div>
            <div class="output flex-grow-sm text-right">${
              obj.act_partcount
            }</div>
            <div class="output flex-grow-sm text-right">${
              obj.est_partcount
            }</div>
            <div class="output flex-grow-sm text-right">${obj.yeild.floatToPercentage()}</div>
            <div class="act-progress flex-grow-sm text-right">${actProgress}</div>
            <div class="progress progress-xl flex-grow-lg">
              ${
                obj.act_partcount < obj.est_partcount
                  ? `<div class="progress-bar bg-color-orange" style="width: ${actProgress};"></div>
      <div class="progress-bar bg-color-redLight" style="width: ${estimateProgress};"></div>
      <span style="left: ${estimateProgress};">${estimateProgress}</span>`
                  : `<div class="progress-bar bg-color-green" style="width: ${actProgress};"></div>`
              }
            </div>
            <div class="order flex-grow-sm">${obj.name}</div>
          </div>
        `
      },
      drawPieChart(ctx) {
        let online = 0
        let idle = 0
        let alarm = 0
        // let offline = 0;
        let onlineTime = 0
        let idleTime = 0
        let alarmTime = 0
        // let offlineTime = 0;
        _.each(ctx.machineStatusNow, (obj) => {
          if (obj.status == '11') {
            online++
          } else if (obj.status == '12') {
            idle++
          } else if (obj.status == '13') {
            alarm++
            // } else if (obj.status == "0") {
            //   offline++;
          }
          onlineTime += obj.operateSecond
          idleTime += obj.idleSecond
          alarmTime += obj.alarmSecond
          // offlineTime += obj.offlineSecond;
        })

        var statusData = [
          {
            label: '閒置',
            data: idle,
            color: servkit.getMachineLightColor('12'),
          },
          {
            label: '加工',
            data: online,
            color: servkit.getMachineLightColor('11'),
          },
          {
            label: '警報',
            data: alarm,
            color: servkit.getMachineLightColor('13'),
            // },
            // {
            //   label: "離線",
            //   data: offline,
            //   color: servkit.getMachineLightColor("0")
          },
        ]
        var timeData = [
          {
            label: '閒置',
            data: idleTime,
            color: servkit.getMachineLightColor('12'),
          },
          {
            label: '加工',
            data: onlineTime,
            color: servkit.getMachineLightColor('11'),
          },
          {
            label: '警報',
            data: alarmTime,
            color: servkit.getMachineLightColor('13'),
            // },
            // {
            //   label: "離線",
            //   data: offlineTime,
            //   color: servkit.getMachineLightColor("0")
          },
        ]
        var options = {
          series: {
            pie: {
              show: true,
              innerRadius: 0.4,
              combine: {
                color: '#999',
                threshold: 0.01,
                label: '無效',
              },
              stroke: {
                width: 0.1,
                color: '#222B45',
              },
              label: {
                show: true,
              },
            },
          },
          legend: {
            show: false,
          },
          grid: {
            hoverable: true,
          },
        }
        options.series.pie.label.formatter = (label, series) =>
          `<div style="font-size:0.8rem;">${series.percent.toFixed(0)}%</div>`
        $.plot($('#status-time'), timeData, options)

        options.series.pie.label.formatter = (label, series) =>
          `<div style="font-size:0.8rem;">${series.data[0][1]}台</div>`
        $.plot($('#status-count'), statusData, options)
      },
      machineStatusNow: null,
      plantStatusMap: null,
      calcMachineStatusNow(ctx) {
        ctx.machineStatusNow = {}
        ctx.plantStatusMap = {}
        let now = moment()
        let duration = (now - ctx.preCon.shiftStartTime) / 1000
        _.each(ctx.preCon.machineStatus, (records, machineId) => {
          let plant = servkit.getPlantAreaByMachine(machineId)
          if (plant && !ctx.plantStatusMap[plant]) {
            ctx.plantStatusMap[plant] = {
              plant,
              workNum: 0,
              idleSecond: 0,
              powerSecond: 0,
              yieldAry: [],
              outputNow: 0,
              outputMax: 0,
            }
          }
          var nowMap = {
            status: '0',
            output: 0,
            good: 0,
            powerSecond: 0,
            operateSecond: 0,
            idleSecond: 0,
            alarmSecond: 0,
            offlineSecond: 0,
            duration,
            plant,
          }
          let prevRecord = null
          _.each(records, (record) => {
            let { time, status, output, quality } = record
            if (record.time <= now) {
              nowMap.status = status
              nowMap.output += output
              if (quality == 'OK') {
                nowMap.good += output
              }
              let timeGap = prevRecord
                ? (time - prevRecord.time) / 1000
                : (time - ctx.preCon.shiftStartTime) / 1000
              if (status === '11') {
                nowMap.powerSecond += timeGap
                nowMap.operateSecond += timeGap
              } else if (status === '12') {
                nowMap.powerSecond += timeGap
                nowMap.idleSecond += timeGap
              } else if (status === '13') {
                nowMap.powerSecond += timeGap
                nowMap.alarmSecond += timeGap
              } else if (status === '0') {
                nowMap.offlineSecond += timeGap
              }
              prevRecord = record
            } else {
              return
            }
          })
          ctx.machineStatusNow[machineId] = nowMap
        })

        _.each(ctx.preCon.workStatus, (product) => {
          _.each(product.works, (work) => {
            let { quantity, machine_id } = work
            let plant = servkit.getPlantAreaByMachine(machine_id)
            ctx.plantStatusMap[plant].workNum++
            ctx.plantStatusMap[plant].idleSecond +=
              ctx.machineStatusNow[machine_id].idleSecond
            ctx.plantStatusMap[plant].powerSecond +=
              ctx.machineStatusNow[machine_id].powerSecond
            ctx.plantStatusMap[plant].yieldAry.push(
              ctx.machineStatusNow[machine_id].good /
                ctx.machineStatusNow[machine_id].output
            )
            ctx.plantStatusMap[plant].outputNow +=
              ctx.machineStatusNow[machine_id].good
            ctx.plantStatusMap[plant].outputMax += quantity
          })
        })
      },
    },
    preCondition: {
      workStatus(done) {
        // 取得工單、產品、機台資訊
        $.get('app/Dashboard/demoData/situationRoom.json', function (response) {
          var data = {}
          _.each(response, (val, key) => {
            if (!key.includes('//')) data[key] = val
          })
          done(data)
        })
      },
      machineStatus(done) {
        // 取得機台狀態(csv檔)
        $.get('app/Dashboard/demoData/situationRoomDeviceStatus.csv', function (
          response
        ) {
          let data = response.split('\n').filter((word) => word.length)
          let dataMap = {}
          for (var i = 1; i < data.length; i++) {
            let [time, machine_id, status, output, quality] = data[i].split(',')
            if (!dataMap[machine_id]) {
              dataMap[machine_id] = []
            }
            dataMap[machine_id].push({
              time: moment(time, 'HH:mm'),
              machine_id,
              status: status.trim(),
              output: parseInt(output),
              quality: quality.trim(),
            })
          }
          done(dataMap)
        })
      },
      shiftStartTime(done) {
        servkit.ajax(
          {
            url: 'api/workshift/today',
            type: 'GET',
          },
          {
            success(data) {
              done(moment(data[0].start))
            },
            fail() {
              done(null)
            },
          }
        )
      },
    },
    delayCondition: [
      'machineList',
      'machinePlantAreaList',
      'plantAreaList',
      'machineLightList',
    ],
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
      ],
      ['/js/plugin/bootstrap-progressbar/bootstrap-progressbar.min.js'],
    ],
  })
}
