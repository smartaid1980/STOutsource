export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.tableQuery = createReportTable({
        $tableElement: $('#table_query'),
        rightColumn: [2, 3, 4],
        onRow: function (row, data) {
          $(row).find('td').eq(0).html(servkit.getMachineName(data[0]))
          $(row)
            .find('td')
            .eq(5)
            .html(
              '<span class="badge bg-color-' +
                (data[5] == 'M4' ? 'red' : 'blue') +
                '">' +
                (context.preCon.macroMap[data[5]] || '') +
                '</span>'
            )
        },
      })
      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initSelectWithList(
        context.preCon.machineByGroup,
        context.$deviceQuery
      )
      //machine light style
      context.deviceStatusStyle()
      //macro edit dialog
      context.addDialog()
      //畫機台按鈕
      context.renderMachineBtns()

      $('#machine-btns').on('click', '.machine-unit', function (e) {
        e.preventDefault()

        var machineId = e.currentTarget.getAttribute('id')
        //只有機台狀態為閒置或Alarm時，才能按無效時間項目
        if (context.machineStatusMap[machineId] == '12') {
          context.$macroBtn.removeClass('disabled').removeAttr('disabled')
        } else if (context.machineStatusMap[machineId] == '13') {
          //警報時只可按M2, 4, 10, 因為其他無效項目不可出現於警報時
          context.$macroBtn.addClass('disabled').attr('disabled', 'disabled')
          $('#M2').removeClass('disabled').removeAttr('disabled')
          $('#M4').removeClass('disabled').removeAttr('disabled')
          $('#M10').removeClass('disabled').removeAttr('disabled')
        } else {
          context.$macroBtn.addClass('disabled').attr('disabled', 'disabled')
        }
        //preload data
        context.setMacroBtnStatus($(this).find('.machine-macro').attr('macro'))

        console.log(machineId)
        context.$macroDialog
          .dialog(
            'option',
            'title',
            $(this).find('.machine-btn').clone().attr('machine-id', machineId)
          )
          .dialog('open')
      })

      //macro btn 行為
      context.$macroBtns.on('click', 'button', function (e) {
        e.preventDefault()
        var macro = $(this).attr('id')
        context.setMacroBtnStatus(macro)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $deviceQuery: $('#device-query'),
      $macroDialog: $('#macro-dialog'),
      $macroBtns: $('#macro-btns'),
      $macroBtn: $('.macro-btn'),
      tableQuery: undefined,
      lightClassMap: {
        0: 'offline',
        11: 'online',
        12: 'idle',
        13: 'alarm',
      },
      machineStatusMap: {},
      machineBtnTemlpate: _.template(
        '    <div class="machine-unit well" id="<%= machineId %>">' +
          ' <button class="btn machine-btn" style="background-color: <%= color %>"><%= machineName %></button>' +
          ' <div class="machine-macro" macro="<%= macro %>"><%= macroName %></div>' +
          '</div>'
      ),
      addDialog: function () {
        this.$macroDialog.dialog({
          autoOpen: false,
          resizable: true,
          modal: true,
          width: 1500,
          height: 800,
          title: '機台',
          buttons: [
            {
              html: '完成',
              class: 'btn btn-primary',
              click: function () {
                $(this).dialog('close')
              },
            },
          ],
        })
      },
      renderMachineBtns: function () {
        var context = this
        var btnHtml = []
        _.each(context.preCon.machinePlantMap, function (machines, plantId) {
          //該廠區含有有權限瀏覽的機台
          var plantAuthorizedMachines = _.intersection(
            _.keys(machines),
            _.keys(context.preCon.machineByGroup)
          )
          if (plantAuthorizedMachines.length) {
            btnHtml.push(
              "<div class='plant-header'>" +
                servkit.getPlantAreaName(plantId) +
                '</div>'
            )
            _.each(plantAuthorizedMachines, function (machineId) {
              var colorRandom = _.random(0, 3) //0, 11, 12, 13
              var macro
              var macroName = '<br><br><br>' //colorRandom == 0
              if (colorRandom == 1) {
                //11
                var onlineMacro = ['M2', 'M4', 'M10']
                macro = onlineMacro[_.random(0, 2)]
              } else if (colorRandom == 2) {
                //12
                var idleMacro = [
                  'M1',
                  'M2',
                  'M3',
                  'M4',
                  'M5',
                  'M6',
                  'M7',
                  'M8',
                  'M9',
                  'M10',
                  'M999',
                ]
                macro = idleMacro[_.random(0, 10)]
              } else if (colorRandom == 3) {
                // 13
                var alarmMacro = ['M4', '']
                macro = alarmMacro[_.random(0, 1)]
                macroName = context.preCon.macroMap[macro] || macroName
              }
              context.machineStatusMap[machineId] = _.keys(
                servkit.getMachineLightMap()
              )[colorRandom]

              btnHtml.push(
                context.machineBtnTemlpate({
                  machineId: machineId,
                  machineName: servkit.getMachineName(machineId),
                  color: _.pluck(
                    _.values(servkit.getMachineLightMap()),
                    'color'
                  )[colorRandom],
                  macro: macro,
                  macroName: context.preCon.macroMap[macro]
                    ? context.preCon.macroMap[macro]
                        .replace(' (', '<br>(')
                        .replace('/', '<br>')
                    : macroName,
                })
              )
            })
          }
        })
        $('#machine-btns').html(btnHtml.join(''))
      },
      deviceStatusStyle: function () {
        var context = this
        var deviceStatusStyle = _.map(servkit.getMachineLightMap, function (
          elem,
          status
        ) {
          return (
            '.machine-btn.' +
            context.lightClassMap[status] +
            '{ background-color:' +
            elem.color +
            ';}'
          )
        })
        console.log(deviceStatusStyle.join(''))
        $('body').append(deviceStatusStyle.join(''))
      },
      setMacroBtnStatus: function (macro) {
        var context = this
        var $btn = $('#' + macro)
        context.$macroBtns
          .find('button')
          .removeClass('selected')
          .removeAttr('style')
        if ($btn.attr('id') == 'M4') {
          $btn
            .css({
              'background-color': servkit.getMachineLightMap()[13].color,
              'border-color': 'red',
            })
            .addClass('selected')
        } else {
          $btn
            .css({
              'background-color': servkit.getMachineLightMap()[12].color,
              'border-color': 'yellow',
            })
            .addClass('selected')
        }
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      machineByGroup: function (done) {
        //{machineId1: machineName1, ...}
        this.commons.getMachineByGroup(done)
      },
      macroMap: function (done) {
        //只有這頁要求要macro同時有中英文
        done({
          M1: '更換刀具/Change Tool (M1)',
          M2: '設定時間/Setting Time (M2)',
          M3: '工件量測/Measuring (M3)',
          M4: '故障待修/Failure to be Repaired (M4)',
          M5: '待料/Wait for Material (M5)',
          M6: '待刀具/Wait for Tool (M6)',
          M7: '待人設定/Wait for Setting (M7)',
          M8: '待單/Wait for Order (M8)',
          M9: '機台清理/Cleaning (M9)',
          M10: '治具加工/Fixture Processing (M10)',
          M999: '待人顧車/Wait for taking care of car (M999)',
        })
        //      var macroPath = "app/" + document.location.hash.split('/').slice(1, 4).join("/") + "/macro.json";
        //      $.getJSON(macroPath)
        //          .done(function (macroObj) {
        //            done(macroObj);
        //          })
        //          .fail(function (d, textStatus, error) {
        //            done({});
        //            console.error("getJSON failed, status: " + textStatus + ", error: " + error);
        //          });
      },
      boxList: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_box',
              columns: ['box_id'],
            }),
          },
          {
            success: function (boxes) {
              done(_.pluck(boxes, 'box_id'))
            },
          }
        )
      },
      machinePlantMap: function (done) {
        servkit.ajax(
          {
            url: 'api/plantarea/getMachinePlantArea',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var platnAreaMap = {}
              _.each(data.machines, function (obj) {
                if (_.isUndefined(platnAreaMap[obj.plant_id])) {
                  platnAreaMap[obj.plant_id] = {}
                }
                platnAreaMap[obj.plant_id][
                  obj.device_id
                ] = servkit.getMachineName(obj.device_id)
              })
              done(platnAreaMap)
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
      ],
    ],
  })
}
