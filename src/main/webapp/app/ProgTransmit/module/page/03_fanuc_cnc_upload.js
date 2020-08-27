import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      if (context.preCon.machineLight && context.preCon.defaultAccount) {
        var $node = context.preCon.machineLight
        context.$machineLigth.html($node.html())
        context.drawTable()
        context.defaultAccountMap = context.preCon.defaultAccount
        context.subscribeDataServer()
      }
      if (context.preCon.boxId) {
        servkit.subscribe('DeviceStatus', {
          machines: context.preCon.boxId,
          handler: function (data) {
            console.log(data)
            data[0].eachMachine('G_CONS()', function (multisystem, machineId) {
              var status = data[0].getValue('G_CONS()', machineId)[0][0]
              if (status == 'B') {
                status = 0
              }
              var btn = document.querySelector('#' + machineId)
              $(btn)
                .parent()
                .prev()
                .prev()
                .children('.machineLight')
                .css('background', context.lightMap[status])
            })
          },
          dataModeling: true,
          noDataHandler: function () {
            _.each(document.querySelectorAll('button.machineLight'), function (
              ele
            ) {
              $(ele).css('background', context.lightMap[0])
            })
          },
        })
      }
      context.$machineTable.on('click', 'button.dataServerBtn', function (evt) {
        context.showDialog(this.id)
      })
      context.$modalSubmitBtn.on('click', function (evt) {
        var user = context.$serverUser.val()
        var password = context.$serverPassword.val()
        context.$connectModal.modal('toggle')
        context.gogoAnother({
          appId: 'ProgTransmit',
          funId: '05_fanuc_data_server',
          currentTab: true,
          graceParam: {
            machineId: context.machineId,
            user: user,
            password: password,
          },
        })
      })
    },
    util: {
      machineId: '',
      $machineLigth: $('[name="machineLigth"]'),
      $machineTable: $('#machine-table'),
      $connectModal: $('#connect-modal'),
      $serverUser: $('#server-user'),
      $serverPassword: $('#server-password'),
      $modalSubmitBtn: $('#connect-submit'),
      defaultAccountMap: {},
      $dialog: $('<div></div'),
      lightMap: {},
      drawTable: function () {
        var that = this
        var machineMap = servkit.getMachineMap()
        var table = createReportTable({
          $tableElement: $('#machine-table'),
          $tableWidget: $('#machine-table-widget'),
          onRow: function (row, data) {},
          centerColumn: [3],
        })
        var resultData = _.map(_.keys(machineMap), function (key) {
          var data = machineMap[key]
          return [
            data.device_name,
            '<button class="btn machineLight" style="background:' +
              that.lightMap[0] +
              '"></button>',
            '<button class="btn dataServerLight" style="background:' +
              that.lightMap[0] +
              '"></button>',
            '<button class="btn btn-xs btn-success dataServerBtn" id="' +
              key +
              `" disabled="disabled">${i18n('CNC_Upload_0011')}</button>`,
          ]
        })
        table.drawTable(resultData)
      },
      showDialog: function (machineId) {
        var that = this
        that.$dialog.dialog({
          autoOpen: false,
          width: 400,
          resizable: false,
          modal: true,
          title:
            `<div class='widget-header'>${i18n('CNC_Upload_0016')} ` +
            servkit.getMachineName(machineId) +
            ' DataServer',
          buttons: [
            {
              html: `${i18n('CNC_Upload_0012')}&nbsp; `,
              class: 'btn btn-primary btn-sm',
              click: function () {
                $(this).dialog('close')
                that.gogoAnother({
                  appId: 'ProgTransmit',
                  funId: '05_fanuc_data_server',
                  currentTab: true,
                  graceParam: {
                    machineId: machineId,
                    user: that.defaultAccountMap[machineId].user,
                    password: that.defaultAccountMap[machineId].password,
                  },
                })
              },
            },
            {
              html: `${i18n('CNC_Upload_0017')}&nbsp; `,
              class: 'btn btn-success btn-sm',
              click: function () {
                $(this).dialog('close')
                that.machineId = machineId
                that.$serverUser.val('')
                that.$serverPassword.val('')
                that.$connectModal.modal()
              },
            },
            {
              html: `${i18n('CNC_Upload_0013')}`,
              class: 'btn btn-default btn-sm',
              click: function () {
                $(this).dialog('close')
              },
            },
          ],
        })

        that.$dialog.html(`${i18n('CNC_Upload_0014')}?`)
        that.$dialog.dialog('open')
      },
      subscribeDataServer: function () {
        var that = this
        servkit.subscribe('js_fanuc_dataserver', {
          machines: ['FANUC_DATA_SERVER'],
          handler: function (data) {
            var dataServerInfo = data.FANUC_DATA_SERVER
            _.each(document.querySelectorAll('button.dataServerBtn'), function (
              ele
            ) {
              var key = ele.id
              var btn = document.querySelector('#' + key)
              if (dataServerInfo[key]) {
                var info = dataServerInfo[key]
                if (info.available == true) {
                  $(btn).prop('disabled', false)
                  $(btn)
                    .parent()
                    .prev()
                    .children('.dataServerLight')
                    .css('background', that.lightMap[11])
                } else {
                  $(btn).prop('disabled', true)
                  $(btn)
                    .parent()
                    .prev()
                    .children('.dataServerLight')
                    .css('background', that.lightMap[0])
                }
              } else {
                $(btn).prop('disabled', true)
                $(btn)
                  .parent()
                  .prev()
                  .children('.dataServerLight')
                  .css('background', that.lightMap[0])
              }
            })
            // _.each(_.keys(dataServerInfo), function (key) {
            //   var info = dataServerInfo[key];
            //   if (info.available == true) {
            //     var btn  = document.querySelector('#'+ key);
            //     $(btn).prop('disabled', false);
            //     $(btn).parent().prev().children('.dataServerLight').css('background', that.lightMap[11]);
            //   }
            // });
          },
          noDataHandler: function () {
            that.allDataServerOff()
          },
        })
      },
      subscribeMachineStatus: function () {
        var that = this
      },
      allDataServerOff: function () {
        var that = this
        _.each(document.querySelectorAll('button.dataServerBtn'), function (
          ele
        ) {
          $(ele).prop('disabled', true)
          $(ele)
            .parent()
            .prev()
            .children('.dataServerLight')
            .css('background', that.lightMap[0])
        })
      },
    },
    preCondition: {
      machineLight: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_light',
              columns: ['light_id', 'light_name', 'color'],
            }),
          },
          {
            success: function (data) {
              var $div = $('<div></div')
              $div.append(`<span>${i18n('CNC_Upload_0015')}:</span>`)
              $div.append('&nbsp;')
              _.each(data, function (ele) {
                that.lightMap[ele.light_id] = ele.color
                $div.append(
                  '<span class="btn" style="background:' +
                    ele.color +
                    '"></span>'
                )
                $div.append('&nbsp;')
                $div.append('<span>' + ele.light_name + '</span>')
                $div.append('&nbsp;')
              })
              done($div)
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      defaultAccount: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_file_manage_machine',
              columns: ['machine_id', 'account', 'password'],
            }),
          },
          {
            success: function (data) {
              var accountMap = {}
              _.each(data, function (obj) {
                accountMap[obj.machine_id] = {
                  user: obj.account,
                  password: obj.password,
                }
              })
              done(accountMap)
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      boxId: function (done) {
        servkit.ajax(
          {
            url: 'api/box/read',
            type: 'GET',
          },
          {
            success: function (datas) {
              done(
                _.chain(datas)
                  .map(function (box) {
                    return box.box_id
                  })
                  .value()
              )
            },
          }
        )
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      [
        '/js/plugin/jquery-validate/jquery.validate.min.js',
        '/js/plugin/masked-input/jquery.maskedinput.min.js',
      ],
    ],
  })
}
