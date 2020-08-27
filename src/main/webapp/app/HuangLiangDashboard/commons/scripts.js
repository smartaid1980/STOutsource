function ajaxWorkShift(doneOrCtx) {
  var ctx = this

  servkit.ajax(
    {
      url: 'api/workshift/byDateInterval',
      type: 'GET',
      data: {
        startDate: moment().add(-1, 'days').format('YYYYMMDD'),
        endDate: moment().format('YYYYMMDD'),
      },
    },
    {
      success: function (data) {
        for (var date in data) {
          _.each(data[date], function (workShift) {
            workShift.date = date
          })
        }

        if (_.isFunction(doneOrCtx)) {
          doneOrCtx(data)
        } else {
          doneOrCtx.preCon.workShift = data
        }
      },
    }
  )
}

function MachineModel() {
  this.machineIdList = []
  this.machines = {}
  this.index = 0
}

MachineModel.prototype = {
  add: function (machine) {
    if (!this.machines[machine.machineId]) {
      this.machines[machine.machineId] = machine
      this.machineIdList.push(machine.machineId)
      this.machineIdList.sort(naturalCompare)
    }
  },
  contains: function (machineId) {
    return this.machines[machineId] ? true : false
  },
  get: function (machineId) {
    return this.machines[machineId]
  },
  giveMeNext: function (n) {
    if (n >= this.machineIdList.length) {
      this.index = 0
      return _.map(
        this.machineIdList,
        _.bind(function (machineId) {
          return this.machines[machineId]
        }, this)
      )
    }

    var result = []
    for (var i = this.index; i < this.index + n; i++) {
      var j = i
      if (j >= this.machineIdList.length) {
        j -= this.machineIdList.length
      }
      result.push(this.machines[this.machineIdList[j]])
    }
    this.index = this.index + n
    this.index =
      this.index >= this.machineIdList.length
        ? this.index - this.machineIdList.length
        : this.index
    return result
  },
  giveMePrev: function (n) {
    if (n >= this.machineIdList.length) {
      return _.map(
        this.machineIdList,
        _.bind(function (machineId) {
          return this.machines[machineId]
        }, this)
      )
    }

    var result = []
    for (var i = this.index - n; i < this.index; i++) {
      var j = i
      if (j < 0) {
        j += this.machineIdList.length
      }
      result.push(this.machines[this.machineIdList[j]])
    }
    return result
  },
  show: function () {
    _.each(this.machineIdList, function (machineId) {
      console.log(this.machines[machineId].toString())
    })
  },
}

function Machine(machineId, status, employee, macro522, macro523) {
  this.machineId = machineId
  this.status = status
  this.employee = employee
  this.macroStatus = macro522
  this.manageId = macro523

  this.partcount = undefined
  // this.machineOeeTime = undefined;
  this.currPersonOeeTime = undefined
  this.personOeeTime = undefined
}

Machine.prototype = {
  statusClass: function () {
    switch (this.status) {
      case '11':
        return 'row-online'
      case '12':
        return 'row-idle'
      case '13':
        return 'row-alarm'
      case 'B':
        return 'row-offline'
      default:
        return 'row-offline'
    }
  },
  getPartcount: function () {
    return this.partcount || '0'
  },
  // getMachineOee: function () {
  //   if (this.machineOeeTime) {
  //     return (this.machineOeeTime.operate_millisecond / this.machineOeeTime.power_millisecond).floatToPercentage();
  //   }
  //   return '0.0%';
  // },
  getCurrPersonOee: function () {
    if (this.currPersonOeeTime) {
      return (
        this.currPersonOeeTime.operate_millisecond /
        this.currPersonOeeTime.power_millisecond
      ).floatToPercentage()
    }
    return '0.0%'
  },
  getPersonOee: function () {
    if (this.personOeeTime) {
      return (
        this.personOeeTime.operate_millisecond /
        this.personOeeTime.power_millisecond
      ).floatToPercentage()
    }
    return '0.0%'
  },
  toString: function () {
    return (
      '[machineId] ' +
      this.machineId +
      ' - ' +
      '[status] ' +
      this.status +
      ' - ' +
      '[partcount] ' +
      this.partcount +
      ' - ' +
      '[macroStatus] ' +
      this.macroStatus +
      ' - ' +
      '[manageId] ' +
      this.manageId
    )
  },
}

var marqueeText = '皇亮精密企業股份有限公司 - 機台狀態列表'

function Marquee(ctx) {
  this.machineIdList = []
  this.machines = {}
  this.ctx = ctx

  var that = this
  $(window).on('hashchange', function hashChange(evt) {
    _.each(that.machines, function (machineCon) {
      clearTimeout(machineCon.timeoutId)
    })
    $(window).off('hashchange', hashChange)
  })

  // 走馬燈
  var currIndex = 0,
    $marquee = $('#marquee'),
    runMarquee = _.bind(function () {
      var message = marqueeText,
        bgColor = ''
      if (this.machineIdList.length === 0) {
        currIndex = 0
        cancelImportantShow()
      } else {
        if (currIndex >= this.machineIdList.length) {
          currIndex = 0
        }
        message = this.marqueeMessage(this.machineIdList[currIndex])
        if (
          this.machines[this.machineIdList[currIndex]].status ===
            'notDispatch' ||
          this.machines[this.machineIdList[currIndex]].status === 'notRepair'
        ) {
          bgColor = 'red'
        }
        currIndex++
      }
      $marquee
        .text(message)
        .css({ left: $marquee.parent().width() })
        .animate({ left: -$marquee.width() }, 30000, 'linear', function () {
          runMarquee()
        })
      $marquee.parent().css({ backgroundColor: bgColor })
    }, this)

  runMarquee()
}

Marquee.prototype = {
  push: function (machineId) {
    if (this.machines[machineId]) {
      return
    }
    this.machineIdList.push(machineId)
    this.machineIdList.sort(naturalCompare)
    this.machines[machineId] = {}

    var requestMachineCondition = _.bind(function () {
      var that = this
      servkit.ajax(
        {
          url: 'api/huangliang/repair/machineCondition',
          type: 'GET',
          data: { machineId: machineId },
        },
        {
          success: function (data) {
            _.extend(that.machines[machineId], data)
            that.machines[machineId].timeoutId = setTimeout(
              requestMachineCondition,
              30000
            )
          },
        }
      )
    }, this)

    this.machines[machineId].timeoutId = setTimeout(requestMachineCondition, 0)
  },
  pop: function (machineId) {
    if (this.machines[machineId]) {
      this.machineIdList.splice(this.machineIdList.indexOf(machineId), 1)
      clearTimeout(this.machines[machineId].timeoutId)
      delete this.machines[machineId]
    }
  },
  marqueeMessage: function (machineId) {
    var machineCon = this.machines[machineId]

    // 一種不爽催促的節奏
    cancelImportantShow()
    // console.log(!isOuter(this.ctx.funId));
    // console.log(machineCon.priority > 0);
    // console.log(this.ctx.commons.getPrevAndCurrWorkShift().curr.sequence > 1);
    // console.log(machineCon.status === 'notRepair');
    // console.log(moment(machineCon.alarm_time + '.000', 'YYYY/MM/DD HH:mm:ss.SSS').valueOf() + (5 * 60 * 1000) < new Date().getTime());
    var alarmDuring = moment(
      machineCon.alarm_time + '.000',
      'YYYY/MM/DD HH:mm:ss.SSS'
    ).valueOf()
    if (
      !isOuter(this.ctx.funId) &&
      machineCon.priority > 0 &&
      this.ctx.commons.getPrevAndCurrWorkShift().curr.sequence > 1 &&
      machineCon.status === 'notRepair' &&
      alarmDuring + 30 * 60 * 1000 < new Date().getTime()
    ) {
      importantShow(
        '已延遲累積' +
          moment
            .utc(
              moment().diff(
                moment(machineCon.alarm_time, 'YYYY/MM/DD HH:mm:ss')
              )
            )
            .format('HH:mm:ss') +
          '，請' +
          userList[machineCon.repair_emp_id] +
          '(' +
          machineCon.repair_emp_id +
          ')' +
          '盡速維修' +
          servkit.getMachineName(machineCon.machine_id) +
          '故障代碼' +
          machineCon.alarm_code +
          '(' +
          (this.ctx.preCon.alarmCode[machineCon.alarm_code] || '') +
          ')'
      )
    }

    if (machineCon) {
      switch (machineCon.status) {
        case 'notDispatch':
          return (
            servkit.getMachineName(machineId) +
            ' 故障待修，請主管分配人員至前往該機台'
          )
        case 'notRepair':
          return (
            machineCon.notify_time.substring(11) +
            ' ' +
            userList[machineCon.repair_emp_id] +
            '(' +
            machineCon.repair_emp_id +
            ')修理 ' +
            servkit.getMachineName(machineId) +
            ' ' +
            '故障代碼 ' +
            machineCon.alarm_code +
            '(' +
            (this.ctx.preCon.alarmCode[machineCon.alarm_code] || '') +
            ')'
          )
        case 'repairing':
        case 'complete':
        default:
          return marqueeText
      }
    } else {
      return marqueeText
    }
  },
}

// function refreshMachineOee(machineModel, workShift) {
function refreshCurrCareEmpOee(machineModel, workShift, renderer) {
  $('.prev-work-shift').text(workShift.name)

  /*hippo.newSimpleExhaler()
      .space('huangliang_utilization_time_work_shift')
      .index('machine_id', servkit.getMachineList())
      .indexRange('date', workShift.date, workShift.date)
      .columns('machine_id', 'work_shift_name',
          'power_millisecond', 'operate_millisecond',
          'cutting_millisecond', 'work_shift_millisecond')
      .exhale(function (exhalable) {
        exhalable.each(function (d) {
          if (d.work_shift_name === workShift.name &&
              machineModel.contains(d.machine_id)) {
            machineModel.get(d.machine_id).machineOeeTime = d;
          }
        });
      });*/
  hippo
    .newSimpleExhaler()
    .space('huangliang_utilization_time_work_shift_care_emp')
    .index('machine_id', servkit.getMachineList())
    .indexRange('date', workShift.date, workShift.date)
    .columns(
      'machine_id',
      'work_shift_name',
      'power_millisecond',
      'operate_millisecond'
    )
    .exhale(function (exhalable) {
      exhalable.each(function (d) {
        if (d.work_shift_name === workShift.name) {
          if (!machineModel.contains(d.machine_id)) {
            machineModel.add(
              new Machine(d.machine_id, '11', '---', '---', '---')
            )
          }
          machineModel.get(d.machine_id).currPersonOeeTime = d
        }
      })
      renderer()
    })
}

function refreshCareEmpOee(machineModel, workShift, renderer) {
  $('.prev-work-shift-care-emp').text(workShift.name)

  hippo
    .newSimpleExhaler()
    .space('huangliang_utilization_time_work_shift_care_emp')
    .index('machine_id', servkit.getMachineList())
    .indexRange('date', workShift.date, workShift.date)
    .columns(
      'machine_id',
      'work_shift_name',
      'power_millisecond',
      'operate_millisecond'
    )
    .exhale(function (exhalable) {
      exhalable.each(function (d) {
        if (d.work_shift_name === workShift.name) {
          if (!machineModel.contains(d.machine_id)) {
            machineModel.add(
              new Machine(d.machine_id, '11', '---', '---', '---')
            )
          }
          machineModel.get(d.machine_id).personOeeTime = d
        }
      })
      renderer()
    })
}

/*function refreshPartcount(machineModel, workShift) {
  hippo.newSimpleExhaler()
      .space('part_count_merged')
      .index('machine_id', servkit.getMachineList())
      .indexRange('date', workShift.date, workShift.date)
      .columns('machine_id', 'work_shift', 'part_count')
      .exhale(function (exhalable) {
        var groupByMachineId = exhalable.reduce(function (m, d) {
          if (!m[d.machine_id]) {
            m[d.machine_id] = [];
          }
          if (d.work_shift === workShift.name) {
            m[d.machine_id].push(d);
          }
          return m;
        }, {});
        _.each(groupByMachineId, function (partcounts, machineId) {
          //離線時,想顯示離線前的顆數
          if (machineModel.contains(machineId) && machineModel.get(machineId).status != "B") {
            machineModel.get(machineId).partcount = partcounts.length;
          }
        });
      });
}*/

function getPrevAndCurrWorkShift(context) {
  var currWorkShift,
    prevWorkShift,
    currTsp = new Date().getTime(),
    ctx = context || this
  for (var date in ctx.preCon.workShift) {
    for (var i = 0; i < ctx.preCon.workShift[date].length; i++) {
      currWorkShift = ctx.preCon.workShift[date][i]
      if (!prevWorkShift) {
        prevWorkShift = currWorkShift
        continue
      }
      if (
        currTsp >=
          moment(
            currWorkShift.start + '.000',
            'YYYY/MM/DD HH:mm:ss.SSS'
          ).valueOf() &&
        currTsp <=
          moment(
            currWorkShift.end + '.999',
            'YYYY/MM/DD HH:mm:ss.SSS'
          ).valueOf()
      ) {
        return { prev: prevWorkShift, curr: currWorkShift }
      }

      prevWorkShift = currWorkShift
    }
  }

  ajaxWorkShift(ctx)
  return { prev: prevWorkShift, curr: prevWorkShift }
}

function machineIntoTable($rotateTable, machines, priority, funId) {
  if (machines.length === 0) {
    return
  }

  var html
  if (!isOuter(funId)) {
    html = _.map(machines, function (machine) {
      return (
        '<tr class="' +
        machine.statusClass() +
        '">' +
        '  <td class="text-center">' +
        servkit.getMachineName(machine.machineId) +
        ' (' +
        priorityText(priority[machine.machineId]) +
        ')' +
        '</td>' +
        '  <td class="text-center">' +
        machine.manageId +
        '</td>' +
        '  <td class="text-right">' +
        machine.getPartcount() +
        ' 件</td>' +
        '  <td class="text-center">' +
        machine.employee +
        '</td>' +
        // '  <td class="text-right">' + machine.macroStatus + '</td>' +
        '  <td class="text-right">' +
        machine.getCurrPersonOee() +
        '</td>' +
        '  <td class="text-right">' +
        machine.getPersonOee() +
        '</td>' +
        '</tr>'
      )
    }).join('')
  } else {
    html = _.map(machines, function (machine) {
      return (
        '<tr class="' +
        machine.statusClass() +
        '">' +
        '  <td class="text-center">' +
        servkit.getMachineName(machine.machineId) +
        ' (' +
        priorityText(priority[machine.machineId]) +
        ')' +
        '</td>' +
        '  <td class="text-center">' +
        machine.manageId +
        '</td>' +
        //          '  <td class="text-right">' + machine.macroStatus + '</td>' +
        '  <td class="text-center">' +
        machine.employee +
        '</td>' +
        '  <td class="text-right">' +
        machine.getCurrPersonOee() +
        '</td>' +
        '  <td class="text-right">' +
        machine.getPersonOee() +
        '</td>' +
        '</tr>'
      )
    }).join('')
  }

  $rotateTable
    .find('.row-online, .row-idle, .row-alarm, .row-offline, .row-loading')
    .remove()
  $rotateTable.find('tbody').append(html)
}

function priorityText(prio) {
  switch (prio) {
    case 0:
      return '普'
    case 1:
      return '低'
    case 2:
      return '中'
    case 3:
      return '高'
    default:
      return ''
  }
}

function importantShow(message) {
  var $importantShow = $('#important-show')

  if ($importantShow.length === 0) {
    $(document.body)
      .append('<div id="important-show"></div>')
      .find('#important-show')
      .css({
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        backgroundColor: 'red',
        zIndex: 10000,
        color: 'white',
        fontSize: '72px',
        fontWeight: 900,
        padding: '50px 100px',
      })
      .text(message)
  } else {
    $importantShow.text(message).show()
  }
}

function cancelImportantShow() {
  $('#important-show').hide()
}

exports.ajaxWorkShift = ajaxWorkShift
exports.getPrevAndCurrWorkShift = getPrevAndCurrWorkShift
exports.getMachineModel = function () {
  return new MachineModel()
}

exports.setupFullscreen = function () {
  var ctx = this

  ctx.$fullscreenBtn.on('click', function (evt) {
    ctx.$rotateTable.addClass('full')
  })

  ctx.$rotateTable.on('click', function (evt) {
    ctx.$rotateTable.removeClass('full')
  })
}

exports.startListenDeviceStatus = function (machineModel, type) {
  var ctx = this,
    marquee = new Marquee(ctx)

  servkit.subscribe('DeviceStatus', {
    machines: ctx.preCon.boxIdList,
    handler: function (data) {
      data[0].eachMachine('G_CONS()', function (multisystem, machineId) {
        var status = multisystem[0][0]
        var macro521 = data[0].getValue('G_MRCO(521,521)', machineId)[0][0]
        var macro522 = data[0].getValue('G_MRCO(522,522)', machineId)[0][0]
        var macro523 = data[0].getValue('G_MRCO(523,523)', machineId)[0][0]
        var PGCM = data[0].getValue('G_PGCM()', machineId)[0][0]
        var part = data[0].getValue('G_TOCP()', machineId)[0][0]
        var orderId = macro523

        //(N6 10 G ON)
        if (PGCM.indexOf('N6 ') != -1) {
          var source = PGCM.split('N6 ')[1].split(' ')[1]
          source = source != 'G' && source != 'M' ? '' : source
          orderId = source + macro523
        }

        while (macro521.length < 5) {
          macro521 = '0' + macro521
        }
        var employee = userList[macro521]
          ? userList[macro521].substr(0, 1) +
            'O' +
            userList[macro521].substr(2, 1)
          : macro521

        if (machineModel.contains(machineId)) {
          var machine = machineModel.get(machineId)
          machine.status = status
          machine.employee = employee
          machine.macroStatus = macro522
          //離線時,想顯示離線前的管編
          machine.manageId =
            status == 'B' ? machine.manageId : getManageIdFromOrderId(orderId)
        } else {
          machineModel.add(
            new Machine(
              machineId,
              status,
              employee,
              macro522,
              getManageIdFromOrderId(orderId)
            )
          )
        }

        if (macro522 === '101' && ctx.preCon.priority[machineId] > 0) {
          marquee.push(machineId)
        } else {
          marquee.pop(machineId)
        }

        if (status === '11') {
          marquee.pop(machineId)
        }
      })

      var $rotateTable = ctx.$rotateTable,
        machines = machineModel.giveMePrev(
          ctx.$showRecordSpinner.spinner('value')
        )
      machineIntoTable($rotateTable, machines, ctx.preCon.priority, ctx.funId)
    },
    dataModeling: true,
  })

  // 超即時的顆顆
  servkit.subscribe('js_partcount', {
    machines: servkit.getMachineList(),
    handler: function (data) {
      _.each(data, function (partcount, machineId) {
        machineModel.get(machineId).partcount = partcount
      })
    },
  })
}

exports.startRotate = function (machineModel) {
  var intervalId,
    ctx = this,
    intervalAction = function () {
      var $rotateTable = ctx.$rotateTable,
        machines = machineModel.giveMeNext(
          ctx.$showRecordSpinner.spinner('value')
        )
      machineIntoTable($rotateTable, machines, ctx.preCon.priority, ctx.funId)
    }

  this.$refreshFreqSpinner.spinner({
    min: 10,
    max: 300,
    step: 5,
    stop: function (evt, ui) {
      var newSecond = ctx.$refreshFreqSpinner.spinner('value')
      intervalId && clearInterval(intervalId)
      intervalId = setInterval(intervalAction, newSecond * 1000)
    },
  })

  // 把佔存的拿出來用
  ctx.$refreshFreqSpinner.spinner('value', 10)

  if (!intervalId) {
    intervalId = setInterval(
      intervalAction,
      ctx.$refreshFreqSpinner.spinner('value') * 1000
    )
  }
  intervalAction()

  $(window).on('hashchange', function hashChange(evt) {
    clearInterval(intervalId)
    $(window).off('hashchange', hashChange)
  })
}

exports.startRefreshOeeAndPartcount = function (machineModel) {
  var refreshMillisecond = 15 * 60 * 1000,
    intervalId,
    ctx = this,
    intervalAction = function () {
      var prevAndCurrWorkShift = getPrevAndCurrWorkShift(ctx)
      var renderer = function () {
        var $rotateTable = ctx.$rotateTable,
          machines = machineModel.giveMePrev(
            ctx.$showRecordSpinner.spinner('value')
          )
        machineIntoTable($rotateTable, machines, ctx.preCon.priority, ctx.funId)
      }
      // refreshMachineOee(machineModel, prevAndCurrWorkShift.prev);
      refreshCurrCareEmpOee(machineModel, prevAndCurrWorkShift.curr, renderer)
      refreshCareEmpOee(machineModel, prevAndCurrWorkShift.prev, renderer)
      // refreshPartcount(machineModel, prevAndCurrWorkShift.curr);
    }

  if (!intervalId) {
    intervalId = setInterval(intervalAction, refreshMillisecond)
  }
  intervalAction()

  $(window).on('hashchange', function hashChange(evt) {
    clearInterval(intervalId)
    $(window).off('hashchange', hashChange)
  })
}

function isOuter(funId) {
  return funId === '02_outter_dashboard'
}

exports.isFullscreen = function () {
  return this.$rotateTable.hasClass('full')
}

exports.setMarqueeText = function (text) {
  marqueeText = text
}

var productCache
exports.getProductList = (function () {
  return function (done) {
    if (productCache) {
      done(productCache)
    } else {
      servkit.ajax(
        {
          url: 'api/huangliang/product/get',
          contentType: 'application/json',
          type: 'GET',
        },
        {
          success: function (data) {
            productCache = data
            done(productCache)
          },
        }
      )
    }
  }
})()

var sampleCache
exports.getSampleList = (function () {
  return function (done) {
    if (sampleCache) {
      done(sampleCache)
    } else {
      servkit.ajax(
        {
          url: 'api/huangliang/sample/get',
          contentType: 'application/json',
          type: 'GET',
        },
        {
          success: function (data) {
            sampleCache = data
            done(sampleCache)
          },
        }
      )
    }
  }
})()

function getManageIdFromOrderId(orderId) {
  var manageId = orderId
  if (productCache) {
    var productObj = _.find(productCache, function (obj) {
      return (
        obj.macro523 == orderId ||
        obj.macro523 == 'G' + orderId ||
        obj.macro523 == 'M' + orderId
      )
    })
    manageId = productObj ? productObj.standard_id : manageId
  }

  if (sampleCache) {
    var sampleObj = _.find(sampleCache, function (obj) {
      return (
        obj.macro523 == orderId ||
        obj.macro523 == 'G' + orderId ||
        obj.macro523 == 'M' + orderId
      )
    })
    manageId = sampleObj ? sampleObj.sample_id : manageId
  }
  return manageId
}

var userList = {}
;(function getUserList() {
  hippo
    .newSimpleExhaler()
    .space('HUL_care_employees')
    .index('customer_id', ['HuangLiang'])
    .columns('employee_id', 'employee_name')
    .exhale(function (exhalable) {
      _.each(exhalable.exhalable, function (elem) {
        userList[elem.employee_id] = elem.employee_name
      })
    })

  servkit.ajax(
    {
      url: 'api/user/read',
      type: 'GET',
      contentType: 'application/json',
    },
    {
      success: function (data) {
        _.each(data, function (sysUser) {
          userList[sysUser.user_id] = sysUser.user_name
        })
      },
    }
  )
})()

function naturalCompare(a, b) {
  var ax = [],
    bx = []

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
}
