export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')
      servkit.validateForm($('#main-form'), $('#submit'))
      let unConnectMachineList = {}
      _.chain(servkit.getMachineMap())
        .filter(
          (value) => servkit.getBoxByMachine(value.device_id) === undefined
        )
        .each(
          (value) => (unConnectMachineList[value.device_id] = value.device_name)
        )
      servkit.initSelectWithList(unConnectMachineList, $('#machine'))
      context.$submit.on('click', function (event) {
        event.preventDefault()
        const inhaler = hippo.newInhaler()
        if (
          context.$m521.val() === '' &&
          context.$m522.val() === '' &&
          context.$m523.val() === ''
        ) {
          context.errorDialog('不可全部空白')
        } else {
          try {
            inhaler
              .space('HUL_unconnect_machine')
              .index('machine_id', context.$machine.val())
              .index('date', moment(new Date()).format('YYYYMMDD'))
              .put('time', moment(new Date()).format('YYYY/MM/DD HH:mm:ss'))
              .put(
                'm521',
                context.$m521.val() === ''
                  ? context.$m521Label.text()
                  : context.$m521.val()
              )
              .put(
                'm522',
                context.$m522.val() === ''
                  ? context.$m522Label.text()
                  : context.$m522.val()
              )
              .put(
                'm523',
                context.$m523.val() === ''
                  ? context.$m523Label.text()
                  : context.$m523.val()
              )
              .next()
              .inhaleAppend(
                function () {
                  context.$m521.val('')
                  context.$m522.val('')
                  context.$m523.val('')
                  context.getLastLine()
                  context.successDialog('上傳成功')
                },
                function () {
                  context.errorDialog('上傳失敗')
                }
              )
          } catch (e) {
            context.errorDialog('上傳失敗')
          }
        }
      })
      context.$machine.on('change', function (e) {
        context.getLastLine()
      })
      context.getLastLine()
    },
    util: {
      $machine: $('#machine'),
      $m521: $('#m521-text'),
      $m522: $('#m522-text'),
      $m523: $('#m523-text'),
      $m521Label: $('#m521-label'),
      $m522Label: $('#m522-label'),
      $m523Label: $('#m523-label'),
      $submit: $('#submit'),
      $lastTime: $('#last-time'),
      dialogCount: 0,
      errorDialog: function (data) {
        const context = this
        $.smallBox({
          title: data,
          content: `<div id=dialog-${context.dialogCount}>&nbsp<div>`,
          color: servkit.colors.red,
          icon: 'fa fa-bell swing animated',
        })
        context.closeDialog(context.dialogCount)
        context.dialogCount++
      },
      successDialog: function (data) {
        const context = this
        $.smallBox({
          title: data,
          content: `<div id=dialog-${context.dialogCount}>&nbsp<div>`,
          color: servkit.colors.green,
          icon: 'fa fa-bell swing animated',
        })
        context.closeDialog(context.dialogCount)
        context.dialogCount++
      },
      closeDialog: function (id) {
        const context = this
        setInterval(function () {
          $(`#dialog-${id}`).click()
        }, 3000)
      },
      getLastLine: function () {
        const context = this
        hippo
          .newSimpleExhaler()
          .space('HUL_unconnect_machine')
          .index('machine_id', [context.$machine.val()])
          .indexRange(
            'date',
            moment(new Date()).add(-1, 'days').format('YYYYMMDD'),
            moment(new Date()).format('YYYYMMDD')
          )
          .columns('time', 'm521', 'm522', 'm523')
          .exhale(function (exhale) {
            const data = exhale.exhalable[exhale.exhalable.length - 1]
            if (data) {
              context.$m521Label.text(data.m521)
              context.$m522Label.text(data.m522)
              context.$m523Label.text(data.m523)
              context.$lastTime.text(data.time)
            } else {
              context.$m521Label.text('---')
              context.$m522Label.text('---')
              context.$m523Label.text('---')
              context.$lastTime.text('---')
              context.errorDialog('無資料')
            }
            console.log(data)
          })
      },
    },
    preCondition: {},
    dependencies: [],
  })
}
