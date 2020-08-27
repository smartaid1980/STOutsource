export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.date = moment().format('YYYY/MM/DD')
      context.machineData = _.groupBy(context.preCon.getMachineData, (val) => {
        return val.deviceId
      })
      _.each(context.preCon.getData, (val, key) => {
        val.start_date = context.getDate(val.start_date)
        val.delivery_date = context.getDate(val.delivery_date)
        val.estimate_delivery_date = context.getDate(val.estimate_delivery_date)
        if (!context.product[key]) {
          context.product[key] = val
          context.product[key].quality = 0
          context.product[key].exceptQuality = 0
        }
        var machines = []
        _.each(val.works, (work) => {
          machines.push(work.machine_id)
          context.product[key].quality += Number(work.quantity)
        })
        context.product[key].delay =
          new Date(val.delivery_date).getTime() -
          new Date(val.estimate_delivery_date).getTime()
        _.each(val.decision, (decision) => {
          decision.delivery_date = context.getDate(decision.delivery_date)
          decision.estimate_delivery_date = context.getDate(
            decision.estimate_delivery_date
          )
        })

        var data = JSON.parse(JSON.stringify(val))
        data = _.extend(data, context.product)
        data.name = key
        data.machines = machines
        context.data.push(data)
      })
      // context.mode1Init()
      context.mode2Init()
    },
    util: {
      date: null,
      width: 0,
      color: '',
      height: 0,
      pointDownTime: false,
      pointX: {},
      machineData: {},
      data: [],
      product: {},
      gauge: {},
      decision: {},
      progressColor: ['#2e8b57', '#ffa500', '#a90329', '#768495'],
      mode1Init: function () {
        var ctx = this
        $('.mode1').css('display', 'flex')
        // 讓svg重新畫
        document.getElementById('widget-grid').onresize = function () {
          $('#order').trigger('change')
        }

        $('#order').on('change', function () {
          $('#gauge-container').empty()
          const value = this.value
          var data = JSON.parse(JSON.stringify(ctx.data))
          data.sort(function (a, b) {
            if (value === 'delay') return b.delay - a.delay
            else if (value === 'output') return b.quality - a.quality
            else return new Date(b.delivery_date) - new Date(b.delivery_date)
          })
          _.each(data, (val) => {
            var { name } = val
            var { quality, exceptQuality, decision, works } = ctx.product[name]
            ctx.createGauge(name, quality, 0, 0, name)
            // ctx.createGauge(name,ctx.preCon.getData[name].works[0].quantity, 0, 0, name)
            if (decision) {
              if (ctx.decision[name]) {
                $(`#gauge-container [data-id=${name}] .gauge`).addClass('made')
                $(`#gauge-container [data-id=${name}] .gauge`).append(
                  '<div class="gauge-decision-icon made">已決策</div>'
                )
              } else
                $(`#gauge-container [data-id=${name}] .gauge`).append(
                  '<div class="gauge-decision-icon">決策</div>'
                )
            }
          })
          $('.gauge:first').trigger('click')
          if (ctx.schedule) {
            ctx.schedule.stop()
            ctx.schedule.start()
          }
        })
        $('#decision-zone').on('change', 'input[type=radio]', function () {
          $('#timing-diagram-zone')
            .find('.decision-date')
            .each(function () {
              this.classList.add('hide')
            })
          $('#timing-diagram-zone')
            .find(`[data-id=${this.getAttribute('id')}]`)[0]
            .classList.remove('hide')

          function animate() {
            d3.select(`.decision-date:not(.hide)`)
              .transition()
              .duration(2000)
              .tween('progress', function () {
                return function (percentOfPercent) {
                  ctx.pointDownTime = true
                  var color = d3.interpolateRgb(
                    ctx.color,
                    $(this).find('circle').attr('fill')
                  )
                  var progress =
                    ctx.pointX['預估交期'] +
                    (ctx.pointX[$(this).data('id')] - ctx.pointX['預估交期']) *
                      percentOfPercent
                  if (percentOfPercent === 1) {
                    ctx.pointDownTime = false
                    animate()
                  }
                  d3.select('#point').attr(
                    'transform',
                    `translate(${progress},${ctx.height / 2 - 10})`
                  )
                  d3.select('#point>circle').attr(
                    'fill',
                    color(percentOfPercent)
                  )
                  d3.select(this).style('opacity', percentOfPercent + 0.2)
                }
              })
          }
          if (!ctx.pointDownTime) animate()
        })
        $('#gauge-container').on('click', '.gauge', function () {
          $('.gauge').removeClass('clicked')
          $(this).addClass('clicked')
          const id = this.closest('[data-id]').getAttribute('data-id')
          var {
            delivery_date: end,
            start_date: start,
            estimate_delivery_date: eEnd,
            decision,
          } = ctx.product[id]

          if (decision) {
            $('#decision').removeClass('hide')
            $('#info').addClass('hide')
            // 繪製決策區
            var dDates = []
            $('#decision-zone>div').remove()
            _.each(decision, (val, key) => {
              var {
                name,
                delivery_date: dDate,
                estimate_delivery_date: eDDate,
                cost,
                customer_complaint_rate: rate,
                estimate_delivery_output: output,
              } = val
              dDates.push({
                date: new Date(eDDate),
                index: key,
              })
              ctx.createDecision(
                name,
                dDate,
                eDDate,
                cost,
                rate,
                output,
                key,
                eEnd,
                end
              )
            })
            if ($(this).hasClass('made')) $('#confirm').attr('disabled', true)
            else $('#confirm').attr('disabled', false)

            // 畫時間線
            $('#timing-diagram-zone').empty()
            start = new Date(start)
            eEnd = new Date(eEnd)
            end = new Date(end)
            var now = new Date()
            var dates = []
            dates.push({
              date: start,
              name: '開工日期',
            })
            dates.push({
              date: now,
              name: '現在',
            })
            dates.push({
              date: end,
              name: '交期',
            })
            dates.push({
              date: eEnd,
              name: '預估交期',
            })
            ctx.createTimingDiagram(
              dates.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date)
              }),
              now,
              eEnd,
              end,
              dDates.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date)
              })
            )

            // 繪製堆疊圖
            ctx.drawStackChart(decision)

            if (ctx.decision[id])
              $(`input[type=radio][name=decision]#${ctx.decision[id]}`)
                .prop('checked', true)
                .trigger('change')
            else
              $('input[type=radio][name=decision]:first')
                .prop('checked', true)
                .trigger('change')
          } else {
            $('#decision').addClass('hide')
            $('#info').removeClass('hide')
          }
        })

        $('#confirm').on('click', function () {
          const $gauge = $('.gauge.clicked')
          const id = $gauge.closest('[data-id]').attr('data-id')
          const $icon = $gauge.find('.gauge-decision-icon')
          if ($icon.length) {
            ctx.decision[id] = $('[name=decision]:checked').attr('id')
            $icon.addClass('made')
            $icon.text('已決策')
            $gauge.addClass('made')
            $('#confirm').attr('disabled', true)
          }
        })

        ctx.schedule = servkit
          .schedule('updateQuantity')
          .freqMillisecond(30 * 1000)
          .action(function () {
            var now = new Date()
            var seconds =
              (now.getTime() - new Date(ctx.date + ' 08:00:00').getTime()) /
              1000
            _.each(ctx.data, (product) => {
              var target = 0
              _.each(product.works, (work) => {
                target += Math.round(seconds / work.standard_work)
              })
              var output = 0
              _.each(product.machines, (machine) => {
                _.each(ctx.machineData[machine], (data) => {
                  if (
                    new Date(ctx.date + ' ' + data.time).getTime() <=
                      now.getTime() &&
                    data.quality.includes('OK')
                  )
                    output += Number(data.output)
                })
              })
              if (ctx.gauge[product.name]) {
                ctx.gauge[product.name].value = output
                ctx.gauge[product.name].moveTo()
                ctx.gauge[product.name].target = target
                ctx.gauge[product.name].changeTarget()
              }
            })
          })
          .start()
        $('#order').val($('#order>option:first').val()).trigger('change')
      },
      mode2Init: function () {
        var ctx = this
        var alertIndex = 0
        $('.mode2').css('display', 'flex')
        ctx.alertAnimate(0, 0)

        document.getElementsByClassName(
          'widget-body'
        )[0].onresize = function () {
          console.log('resize')
          ctx.drawPieChart(alertIndex)
        }
        $('.jarviswidget-fullscreen-btn').on('click', function () {
          console.log('click')
          ctx.drawPieChart(alertIndex)
        })

        $('#alert-zone').on('click', '.alert-box', function () {
          $('.alert-box').removeClass('active')
          $(this).addClass('active')

          const index = $(this).data('id')
          alertIndex = index
          ctx.drawPieChart(index)

          var progressHtml = []
          _.each(ctx.preCon.getAIData[index].REASONS, (reason, i) => {
            const percent = reason.VALUE * 100
            progressHtml.push(`<div class="reason-group">`)
            progressHtml.push(`  <div class="progress">`)
            progressHtml.push(
              `    <div class="progress-bar" style="width: ${percent}%;background-color: ${ctx.progressColor[i]}"></div>`
            )
            progressHtml.push(
              `    <span class="txt-sm" style="margin-left: ${
                percent + 3
              }%">${percent}%</span>`
            )
            progressHtml.push(`  </div>`)
            progressHtml.push(
              `  <span class="text txt-sm">${reason.REASON}</span>`
            )
            progressHtml.push(`</div>`)
          })
          $('#reason-zone>.body').html(progressHtml.join(''))

          $('#ai-zone .type').html(ctx.preCon.getAIData[index].AI.REASON_TYPE)
          $('#ai-zone .reason').html(ctx.preCon.getAIData[index].AI.MAIN_REASON)

          const decisionWidth =
            Math.floor(
              (100 / ctx.preCon.getAIData[index].AI.ACTIONS.length) * 100
            ) / 100
          var decisionHtml = []
          _.each(ctx.preCon.getAIData[index].AI.ACTIONS, (ai, i) => {
            decisionHtml.push(
              `<div class="decision-btn${
                i ? ' left-border' : ''
              }" style="width: ${decisionWidth - 2}%">`
            )
            decisionHtml.push(
              `  <span class="txt-lg" data-id="${i}">${ai.ACTION}</span>`
            )
            decisionHtml.push(`  <div class="desc txt-sm">${ai.DESC}</div>`)
            decisionHtml.push(`</div>`)
          })
          $('#ai-zone .decision').html(decisionHtml.join(''))
          $('.result').html('')

          // $('.dim span').html(ctx.preCon.getAIData[alertIndex].AI.MAIN_DIM)
          // $('.decision-btn:first').trigger('click')
        })

        $('#ai-zone').on('click', '.decision-btn', function () {
          $('.decision-btn').removeClass('active')
          $(this).addClass('active')
          const index = $(this).children().data('id')
          $('.result').html(
            ctx.preCon.getAIData[alertIndex].AI.ACTIONS[index].RESULT
          )
        })
        ctx.drawPieChart()

        // var chartOption = {
        //   barColor: '#2e8b57',
        //   size: ctx.width  / 11,
        //   trackColor: 'rgba(0,0,0,0.2)',
        //   lineWidth: ctx.width  / 100,
        //   scaleLength: 0,
        //   lineCap: 'square'
        // }

        ctx.schedule = servkit
          .schedule('updateQuantity')
          .freqMillisecond(30 * 1000)
          .action(function () {
            var now = new Date()
            var seconds =
              (now.getTime() - new Date(ctx.date + ' 08:00:00').getTime()) /
              1000
            _.each(ctx.data, (product) => {
              var target = 0
              _.each(product.works, (work) => {
                target += Math.round(seconds / work.standard_work)
              })
              var output = 0
              _.each(product.machines, (machine) => {
                _.each(ctx.machineData[machine], (data) => {
                  if (
                    new Date(ctx.date + ' ' + data.time).getTime() <=
                      now.getTime() &&
                    data.quality.includes('OK')
                  )
                    output += Number(data.output)
                })
              })
              var $product = $('#product-zone [data-id=' + product.name + ']')
              if ($product.length) {
                $product
                  .find('.outter')
                  .data('easyPieChart')
                  .update(
                    (
                      (output / ctx.product[product.name].quality) *
                      100
                    ).toFixed(1)
                  )
                $product
                  .find('.inner')
                  .data('easyPieChart')
                  .update(
                    (
                      (target / ctx.product[product.name].quality) *
                      100
                    ).toFixed(1)
                  )
                var percent = (output / target) * 100
                $product.find('.pie-chart-value').text(output + ' / ' + target)
                $product.find('.js-percent').text(percent.toFixed(1) + '%')
                // if (percent < 70) {
                // $product.find('.js-percent').css('color', '#a90329')
                // $product.find('.outter').data('easyPieChart').options.barColor = '#a90329'
                // $product.find('.pie-chart-value').addClass('alarm-value')
                // } else {
                // $product.find('.outter').data('easyPieChart').options.barColor = '#2e8b57'
                // $product.find('.pie-chart-value').removeClass('alarm-value')
                // $product.find('.js-percent').css('color', '#fff')
                // }
                // console.log($product.find('.outter'), chartOption)
                // $product.find('.outter').easyPieChart()
              }
            })
          })
          .start()

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
      drawPieChart: function (index) {
        var ctx = this
        $('#product-zone>.body').empty()
        ctx.width = $('#widget-grid').width()
        for (var i = 0; i < 5; i++) {
          var product
          if (index !== undefined)
            product = ctx.preCon.getAIData[index].PRODUCTS[i]
          var html = []
          if (product)
            html.push(`<div class="easy-pie-chart-zone" data-id="${product}">`)
          else
            html.push(`<div class="easy-pie-chart-zone" style="opacity: 0;">`)
          html.push(
            `  <div class="easy-pie-chart easyPieChart outter" data-percent="0">`
          )
          html.push(
            `    <div class="easy-pie-chart easyPieChart inner" data-percent="0">`
          )
          html.push(`      <span class="js-percent txt-sm">0%</span>`)
          html.push(`    </div>`)
          html.push(`  </div>`)
          html.push(`  <span class="pie-chart-name txt-md">${product}</span>`)
          html.push(`  <span class="pie-chart-value txt-sm">${0 / 0}</span>`)
          html.push(`</div>`)
          $('#product-zone>.body').append(html.join(''))
          $('#product-zone>.body>div:last-child .outter').easyPieChart({
            barColor: '#2e8b57',
            size: ctx.width / 11.5,
            trackColor: 'rgba(0,0,0,0.2)',
            lineWidth: ctx.width / 100,
            scaleLength: 0,
            lineCap: 'square',
          })
          $('#product-zone>.body>div:last-child .inner').easyPieChart({
            barColor: '#ffa500',
            trackColor: 'rgba(0,0,0,0.2)',
            size: ctx.width / 16.5,
            lineWidth: ctx.width / 200,
            scaleLength: 0,
            lineCap: 'square',
          })
        }

        if (ctx.schedule) {
          ctx.schedule.stop()
          ctx.schedule.start()
        }
      },
      alertAnimate: function (index, sec) {
        var ctx = this
        window.setTimeout(
          function () {
            $('#alert-zone>.body').append(
              `<div class="btn alert-box txt-md" data-id="${index}">${ctx.preCon.getAIData[index].TITLE}</div>`
            )
            if ($('#alert-zone>.body .alert-box').length === 1) {
              $('.alert-box').trigger('click')
            }
            if (index + 1 < ctx.preCon.getAIData.length)
              ctx.alertAnimate(index + 1)
          },
          sec !== undefined ? sec : 5000
        )
      },
      getDate: function (days) {
        var date = new Date()
        date.setDate(date.getDate() + Number(days))
        return moment(date).format('YYYY/MM/DD')
      },
      createGauge: function (id, max, min, target, name) {
        class Gauge {
          // 儀錶板實體
          constructor(ele) {
            this.ele = ele
            this.min = -1
            this.max = 1
            this.percent = 0
            this.targetPercent = 0
            this.value = 0
            this.color = {
              needle: '#8f9599', // 指針
              spindle: '#6a6a6a', // 軸心
              scale: '#acacac', // 刻度
              value: '#ffffff', // 值
              left: 'rgb(68,219,138)', // 綠色區塊
              right: 'rgb(219,69,98)', // 紅色區塊
              targetLine: 'white', // 目標值(虛線)
            }
          }

          set target(target) {
            this._target = target
            this.changeTarget()
          }

          changeValueText(valueDOM, text, rectDOM) {
            valueDOM.text(text)
            var textWidth = valueDOM.node().getBBox().width
            valueDOM.attr(
              'transform',
              `translate(${-this.radius / 0.96},${textWidth / 2}) rotate(-90)`
            )

            if (rectDOM) {
              var textHeight = valueDOM.node().getBBox().height
              var width = textWidth + 6
              var height = textHeight - 2
              rectDOM.attr('width', width > 0 ? width : 0)
              rectDOM.attr('height', height > 0 ? height : 0)
              rectDOM.attr(
                'transform',
                `translate(${-this.radius / 0.96 - textHeight + 4},${
                  textWidth / 2 + 3
                }) rotate(-90)`
              )
            }
          }
          getPercent(data) {
            return (data - this.min) / (this.max - this.min)
          }
          render() {
            const margin = {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            }
            var width = this.ele[0][0].offsetWidth
            var height = width / 1.75
            var svg = this.ele
              .append('svg')
              .attr('width', width)
              .attr('height', height + margin.bottom)
            var all = svg
              .append('g')
              .attr('transform', `translate(${width / 2}, ${(height / 7) * 6})`) // 把全部元件群組化

            this.radius = Math.min(width, height) / 1.6
            this.arc = d3.svg
              .arc()
              .outerRadius(this.radius)
              .innerRadius(this.radius / 1.2)
              .cornerRadius(5)

            var chart = all.append('g') // 儀表圖
            this.left = chart
              .append('path')
              .attr('id', 'left')
              .attr('fill', this.color.left)
            this.right = chart
              .append('path')
              .attr('id', 'right')
              .attr('fill', this.color.right)

            this.targetLine = all.append('g').attr('transform', `rotate(0)`) // 目標值
            this.targetLine
              .append('line')
              .attr('x1', -this.radius)
              .attr('x2', 0)
              .attr('y1', 0)
              .attr('y2', 0)
              .style('stroke', this.color.targetLine)
              .style('stroke-width', 4)
              .style('stroke-dasharray', '8,5')
            this.targetLine
              .append('text')
              .attr('class', 'value')
              .attr('fill', this.color.value)

            this.scale = all.append('g') // 刻度和值
            // var min =this.scale.append('g').append('text').attr('class', 'value')
            //   .attr('fill', this.color.value)
            // this.changeValueText(min, this.min)
            var max = this.scale
              .append('g')
              .attr('transform', `rotate(180)`)
              .append('text')
              .attr('class', 'value')
              .attr('fill', this.color.value)
            this.changeValueText(max, this.max)

            this.needle = all.append('g').attr('transform', `rotate(0)`) // 指針
            this.needle.append('text').attr('class', 'value')
            this.needle
              .insert('rect', 'text')
              .attr('fill', 'rgb(41, 42, 46)')
              .attr('rx', 4)
              .attr('ry', 4)
              .style('stroke', '#999999')

            var roundedRect = function (variable) {
              // 指針的針
              return (
                'M' +
                -(variable * 1.017 + 1.72) +
                ',' +
                -1 + // 起始位置
                'l' +
                (variable * 1.29 - 4.44) +
                ' ' +
                -(variable * 0.06 - 1.09) + // ↗
                'a' +
                variable / 50 +
                ',' +
                variable / 50 +
                ' 0 0 1 ' +
                variable / 50 +
                ',' +
                variable / 50 + // ⤵(有弧度)
                'v' +
                (variable * 0.06 - 0.09 - variable / 50) * 2 + // ↓
                'a' +
                variable / 50 +
                ',' +
                variable / 50 +
                ' 0 0 1 ' +
                -(variable / 50) +
                ',' +
                variable / 50 + // ↵(有弧度)
                'l' +
                -(variable * 1.29 - 4.44) +
                ' ' +
                -(variable * 0.06 - 1.09) + // ↖
                'z'
              ) // 回起始位置
            }
            this.needle
              .append('path')
              .attr('d', roundedRect(this.radius))
              .attr('fill', this.color.needle)
            this.needle
              .append('circle')
              .attr('fill', this.color.spindle)
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', this.radius / 8)
            this.needle
              .append('circle')
              .attr('fill', this.color.needle)
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', this.radius / 20)
            svg
              .selectAll('text')
              .attr('font-size', `${(1.3 * this.radius) / 120}rem`) // 字體放大
          }
          changeTarget() {
            var gauge = this
            var goalPercent = gauge.getPercent(gauge._target)
            var realPercent = goalPercent
            if (realPercent > 183) {
              realPercent = 183
            } else if (realPercent < -3) {
              realPercent = -3
            }
            if (gauge.targetLine) {
              gauge.changeValueText(
                gauge.targetLine.select('.value'),
                gauge._target
              )
              if (!gauge.targetBuf)
                gauge.targetLine
                  .transition()
                  .duration(2000)
                  .tween('progress', function () {
                    return function (percentOfPercent) {
                      gauge.targetBuf = true
                      var progress =
                        gauge.targetPercent +
                        (realPercent - gauge.targetPercent) * percentOfPercent
                      if (percentOfPercent === 1) {
                        gauge.targetPercent = realPercent
                        gauge.targetBuf = false
                      }
                      return d3
                        .select(this)
                        .attr('transform', `rotate(${progress * 180})`)
                    }
                  })
            }
          }
          moveTo() {
            var gauge = this
            var goalPercent = gauge.getPercent(gauge.value)
            var realPercent = goalPercent
            if (realPercent > 183) {
              realPercent = 183
            } else if (realPercent < -3) {
              realPercent = -3
            }

            if (!gauge.needleBuf)
              gauge.needle
                .transition()
                .duration(2000)
                .tween('progress', function () {
                  return function (percentOfPercent) {
                    gauge.needleBuf = true
                    var progress =
                      gauge.percent +
                      (realPercent - gauge.percent) * percentOfPercent
                    var text =
                      Math.ceil(((progress - gauge.y) / gauge.x) * 10) / 10
                    gauge.changeValueText(
                      gauge.needle.select('.value'),
                      gauge.value,
                      gauge.needle.select('rect')
                    )
                    gauge.needle
                      .select('.value')
                      .attr('fill', gauge.color.value)
                    if (percentOfPercent === 1) {
                      gauge.percent = realPercent
                      if (goalPercent > 183 || goalPercent < -3) {
                        gauge.changeValueText(
                          gauge.needle.select('.value'),
                          gauge.value,
                          gauge.needle.select('rect')
                        )
                        gauge.needle
                          .select('.value')
                          .attr('fill', servkit.statusColors.alarm)
                      }
                      gauge.needleBuf = false
                      // gauge.value = Math.floor((Math.random() * gauge.max) - gauge.min)
                      // gauge.moveTo()
                    }
                    gauge.left.attr(
                      'd',
                      gauge.arc
                        .startAngle(-0.52 * Math.PI)
                        .endAngle((-0.51 + progress) * Math.PI)
                    )
                    gauge.right.attr(
                      'd',
                      gauge.arc
                        .startAngle((-0.49 + progress) * Math.PI)
                        .endAngle(0.52 * Math.PI)
                    )
                    return d3
                      .select(this)
                      .attr('transform', `rotate(${progress * 180})`)
                  }
                })
          }
        }

        $('#gauge-container').append(
          `<div data-id="${id}"><div class="gauge"><div class="gauge-chart"></div><div class="gauge-name"></div></div></div>`
        )
        const element = d3.select(
          `#gauge-container [data-id=${id}] .gauge-chart`
        )
        if (!element.select('svg')[0][0]) {
          // 沒有svg才畫
          this.gauge[id] = new Gauge(element)
          this.gauge[id].max = max
          this.gauge[id].min = min
          this.gauge[id].render()
          this.gauge[id].target = target
          this.gauge[id].moveTo()
        }
        $(`#gauge-container [data-id=${id}] .gauge-name`).text(name)
      },
      createTimingDiagram: function (dates, now, eEnd, end, dDates) {
        var ctx = this
        const element = d3.select(`#timing-diagram-zone`)
        if (!element.select('svg')[0][0]) {
          // 沒有svg才畫
          const margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          }
          var width = element[0][0].offsetWidth - margin.right - margin.left
          ctx.height = width / 8
          var r = ctx.height / 12
          var svg = element
            .append('svg')
            .attr('width', width)
            .attr('height', ctx.height)
          var all = svg.append('g').attr('id', 'canvas') // 把全部元件群組化

          var pointMargin = {
            top: 20,
            right: 70,
            bottom: 40,
            left: 70,
          }
          var points = `${pointMargin.right},${ctx.height / 2 - 14 - 2}`
          points += ` ${width - pointMargin.left - 20},${
            ctx.height / 2 - 14 - 2
          }`
          points += ` ${width - pointMargin.left - 20},${
            ctx.height / 2 - 14 - 2 - 4
          }`
          points += ` ${width - pointMargin.left},${ctx.height / 2 - 14}`
          points += ` ${width - pointMargin.left - 20},${
            ctx.height / 2 - 14 + 2 + 4
          }`
          points += ` ${width - pointMargin.left - 20},${
            ctx.height / 2 - 14 + 2
          }`
          points += ` ${pointMargin.right},${ctx.height / 2 - 14 + 2}`
          all
            .append('polygon') // 線
            .attr('points', points)
            .attr('fill', 'white')

          // 畫時間點
          var first =
            dDates[0].date.getTime() - dates[0].date.getTime() >= 0
              ? dates[0].date
              : dDates[0].date
          var last =
            dDates[dDates.length - 1].date.getTime() -
              dates[dates.length - 1].date.getTime() >=
            0
              ? dDates[dDates.length - 1].date
              : dates[dates.length - 1].date
          var startDate = new Date(first)
          var days = this.getDates(first, last)
          for (var i = 0; i <= days; i++) {
            var date = moment(startDate).format('MM/DD')
            var index = dates.findIndex((val) => {
              return moment(val.date).format('MM/DD') == date
            })
            var dIndexs = []
            for (var di = 0; di < dDates.length; di++) {
              if (moment(dDates[di].date).format('MM/DD') == date)
                dIndexs.push(di)
            }
            var addPoint = function (type, dataIndex) {
              var x =
                ((width - pointMargin.left - pointMargin.right) / (days + 1)) *
                  i +
                pointMargin.left +
                pointMargin.right
              var point = all.append('g')
              point.attr(
                'transform',
                `translate(${x - date.length * 4.5},${ctx.height / 2 - 14})`
              )
              // 建立時間文字
              var dateText = point
                .append('text')
                .text(date)
                .attr('font-size', `${1.3}rem`)
                .attr('fill', 'white')
              var dateWidth = dateText.node().getBBox().width
              var dateHeight = dateText.node().getBBox().height
              dateText.attr(
                'transform',
                `translate(${-dateWidth / 2},${dateHeight})`
              )
              // 點的資訊文字
              var nameText = '預估交期(決策後)'
              if (type === 'index') nameText = dates[dataIndex].name
              var name = point
                .append('text')
                .text(nameText)
                .attr('font-size', `${1.3}rem`)
                .attr('fill', 'white')
              var nameW = name.node().getBBox().width
              var nameH = name.node().getBBox().height
              name.attr('transform', `translate(${-nameW / 2},${-(r * 2)})`)
              if (type === 'dIndex')
                // 決策後的點資訊要移到日期下面
                name.attr(
                  'transform',
                  `translate(${-nameW / 2},${
                    r * 2 + 12 + dateText.node().getBBox().height
                  })`
                )

              var namewRect = point
                .insert('rect', 'text')
                .attr('fill', 'rgb(41, 42, 46)')
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('width', nameW + 12)
                .attr('height', nameH + 2)
                .style('stroke', '#999999')
                .attr(
                  'transform',
                  `translate(${-nameW / 2 - 6},${-nameH - r - 6})`
                )
              if (type === 'dIndex')
                // 決策後的點資訊要移到日期下面
                namewRect.attr(
                  'transform',
                  `translate(${-nameW / 2 - 6},${
                    r * 2 + dateText.node().getBBox().height / 2
                  })`
                )
              var color = 'white'
              // 換「預估交期」的顏色
              if (date === moment(eEnd).format('MM/DD')) {
                if (eEnd.getTime() > end.getTime()) color = 'rgb(219,69,98)'
                else color = 'rgb(68,219,138)'
                ctx.color = color
              }
              // 決策後結果
              if (type === 'dIndex') {
                if (dDates[dataIndex].date.getTime() > end.getTime())
                  color = 'rgb(219,69,98)'
                else color = 'rgb(68,219,138)'
                point
                  .attr('data-id', 'd' + dDates[dataIndex].index)
                  .attr('class', 'decision-date')
                ctx.pointX['d' + dDates[dataIndex].index] =
                  x - date.length * 4.5
              } else {
                ctx.pointX[dates[dataIndex].name] = x - date.length * 4.5
              }
              // 繪製時間點
              point.append('circle').attr('fill', color).attr('r', r)
              // 複製「預估交期」的點
              if (date === moment(eEnd).format('MM/DD') && type === 'index') {
                all
                  .append('g')
                  .attr(
                    'transform',
                    `translate(${x - date.length * 4.5},${ctx.height / 2 - 14})`
                  )
                  .attr('id', 'point')
                  .style('opacity', 0.5)
                  .append('circle')
                  .attr('fill', color)
                  .attr('r', r)
              }

              // 繪製內圈
              // if (date !== moment(now).format('MM/DD'))
              //   point.append('circle').attr('fill', 'rgb(41, 42, 46)').attr('r', r - 3)
            }
            if (dIndexs.length)
              _.each(dIndexs, (val) => addPoint('dIndex', val))
            if (index >= 0) addPoint('index', index)

            startDate.setDate(startDate.getDate() + 1)
          }

          // svg.selectAll('text').attr('font-size', `${1.3}rem`) // 字體放大

          // 把決策的點移到最前面才不會被遮到
          $('.decision-date').each(function () {
            $('#canvas').append(this)
          })
        }
      },
      createDecision: function (
        name,
        dDate,
        eDDate,
        cost,
        rate,
        output,
        index,
        eEnd,
        end
      ) {
        // 繪製決策
        var html = []
        html.push(`<div>`)
        html.push(`  <div class="decision-radio">`)
        html.push(`    <input type="radio" id="d${index}" name="decision">`)
        html.push(`    <label for="d${index}"><span>${name}</span></label>`)
        html.push(`  </div>`)
        html.push(`  <div class="decision-info">`)
        if (dDate !== end) html.push(`    <span>交期：${dDate}</span>`)
        if (eDDate !== eEnd)
          html.push(
            `    <span${
              this.getTime(end) > this.getTime(eDDate) ? ' class="on-time"' : ''
            }>預估交期：${eDDate}</span>`
          )
        if (cost !== undefined)
          html.push(
            `    <span>成本：${(cost > 0 ? '+' : '') + cost * 100 + '%'}</span>`
          )
        else
          html.push(
            `    <span>收入：${(rate > 0 ? '+' : '') + rate * 100 + '%'}</span>`
          )
        html.push(`    <span>預估產量：${output}</span>`)
        html.push(`  <div>`)
        html.push(`</div>`)
        $('#confirm').before(html.join(''))
      },
      getDates: function (startDate, endDate) {
        // 找出第一筆跟最後一筆相差幾天
        var dates = 0,
          currentDate = new Date(startDate),
          addDays = function (days) {
            var date = new Date(this.valueOf())
            date.setDate(date.getDate() + days)
            return date
          }
        while (currentDate <= new Date(endDate)) {
          dates++
          currentDate = addDays.call(currentDate, 1)
        }
        return dates
      },
      getTime: function (time) {
        return new Date(time).getTime()
      },
      drawStackChart: function (decision) {
        // 繪製收入、成本堆疊圖
        var data1 = [],
          data2 = [],
          ticks = []
        _.each(decision, (val, key) => {
          var {
            cost: cost, // 成本
            customer_complaint_rate: rate, // 收入
          } = val
          if (cost !== undefined) {
            cost = 0.5 + cost
            rate = 1 - cost
          } else {
            rate = 0.5 + rate
            cost = 1 - rate
          }
          data1.push([key, rate])
          data2.push([key, cost])
          ticks.push([key, val.name])
        })

        var dataset = [
          {
            label: '收入',
            data: data1,
            color: 'rgb(53,161,233)',
          },
          {
            label: '成本',
            data: data2,
            color: 'rgb(251,208,80)',
          },
        ]

        var option = {
          series: {
            stack: true,
            bars: {
              show: true,
            },
          },
          bars: {
            align: 'center',
            barWidth: 0.3,
          },
          xaxis: {
            // tickSize: [3, "day"],
            // tickLength: 10,
            // color: "black"
            ticks: ticks,
          },
          // yaxis: {
          // },
          grid: {
            // backgroundColor: "#000000",
            tickColor: 'rgb(75, 75, 77)',
            borderWidth: 0,
            color: 'rgb(75, 75, 77)',
          },
        }

        $.plot($('#flot-zone>div'), dataset, option)
      },
    },
    preCondition: {
      getMachineData: function (done) {
        // 取得機台狀態(csv檔)
        $.get('app/Dashboard/demoData/situationRoomDeviceStatus.csv', function (
          response
        ) {
          var data = response.split('\r\n').filter((word) => word.length)
          var dataMap = []
          for (var i = 1; i < data.length; i++) {
            var text = data[i].split(',')
            dataMap.push({
              time: text[0],
              deviceId: text[1],
              status: text[2],
              output: text[3],
              quality: text[4],
            })
          }
          done(dataMap)
        })
      },
      getData: function (done) {
        // 取得工單、產品、機台資訊
        $.get('app/Dashboard/demoData/situationRoom.json', function (response) {
          var data = {}
          _.each(response, (val, key) => {
            if (!key.includes('//')) data[key] = val
          })
          done(data)
        })
      },
      getAIData: function (done) {
        // 取得含有AI的設定檔
        $.get('app/Dashboard/demoData/situationRoomAI.json', function (
          response
        ) {
          done(response)
        })
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
      ],
      ['/js/plugin/d3/d3.min.js'],
    ],
  })
}
