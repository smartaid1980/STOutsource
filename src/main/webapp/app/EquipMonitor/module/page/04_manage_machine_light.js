import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()

      context.$updateColor.colorpicker().on('changeColor', function (event) {
        context.$swatches.css('background', event.color.toHex())
      })
      $('.colorpicker').css('z-index', '9999')

      var machineLightTable = createReportTable({
        $tableElement: context.$machineLightTableTag,
        $tableWidget: context.$machineLightTableWidget,
        onRow: function (row, data) {},
      })
      context.drawTable(machineLightTable)
      context.$machineLightTableTag.on(
        'click',
        'button.update-light',
        function (evt) {
          var $ele = $(this).parent().parent().find('.machineLight').eq(0)
          var color = $ele.attr('name')
          var $id = $(this).parent().parent().children('td').eq(0)
          var lightId = $id.text()
          var lightName = $(this).parent().parent().children('td').eq(1).text()
          //預設色票
          context.$swatches.css('background', color)
          //預設色票代碼
          context.$updateColor.val(color)
          //將colorpicker上的顏色也改成預設值(不改的話會有顏色亂掉的嚴重後果)
          context.$updateColor.colorpicker('setValue', color)
          context.$updateLightName.val(lightName)
          context.$updateLightDialog.dialog({
            autoOpen: false,
            width: '50%',
            modal: true,
            resizable: false,
            title: `${i18n('Update')}`,
            close: function () {
              $('#deleteErrorMsg').html('')
            },
            buttons: [
              {
                html: `${i18n('Cancel')}`,
                class: 'btn btn-default',
                click: function () {
                  context.$updateColor.val(color)
                  context.$updateLightDialog.dialog('close')
                },
              },
              {
                html: `<i class='fa fa-check'></i>&nbsp; ${i18n('Ok')}`,
                class: 'btn btn-success',
                click: function () {
                  //取得目前選取的顏色
                  var currentUpdateColor = context.$updateColor.val()
                  var currentUpdateLightName = context.$updateLightName.val()
                  var updateParamObj = {
                    light_id: lightId,
                    light_name: currentUpdateLightName,
                    color: currentUpdateColor,
                  }
                  context.updateTable(
                    'api/machinelight/update',
                    updateParamObj,
                    $id
                  )
                },
              },
            ],
          })
          context.$updateLightDialog.dialog('open')
        }
      )
    },
    util: {
      $updateLightDialog: $('#dialog-update-light'),
      $machineLightTableWidget: $('#machine-datatables-widget'),
      $machineLightTableTag: $('#machine-datatables'),
      $updateColor: $('#updateColor'),
      $updateLightName: $('#updateLightName'),
      $swatches: $('#swatches'),
      lightMap: {},
      drawTable: function (table) {
        var that = this
        var result = _.map(_.keys(that.lightMap), function (key) {
          var obj = that.lightMap[key]
          return [
            that.filterUndefined(obj.light_id),
            that.filterUndefined(obj.light_name),
            that.filterUndefined(
              '<button name="' +
                obj.color +
                '" class="btn machineLight" style="background:' +
                obj.color +
                '"></button>'
            ),
            that.filterUndefined(obj.create_by),
            that.filterUndefined(servkit.dateFormateString(obj.create_time)),
            that.filterUndefined(obj.modify_by),
            that.filterUndefined(servkit.dateFormateString(obj.modify_time)),
            `<button class="btn btn-success update-light"><i class="fa fa-refresh"></i>&nbsp;${i18n(
              'Update'
            )}</button>`,
          ]
        })
        table.drawTable(result)
      },
      updateTable: function (updateUrl, formData, $idEle) {
        var that = this
        servkit.ajax(
          {
            url: updateUrl,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
          },
          function (data) {
            that.updateTableCallback(data, $idEle)
          }
        )
      },
      updateTableCallback: function (id, $idEle) {
        var that = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_light',
              columns: [
                'light_id',
                'light_name',
                'color',
                'create_time',
                'create_by',
                'modify_time',
                'modify_by',
              ],
              whereClause: "light_id ='" + id + "'",
            }),
          },
          {
            success: function (data) {
              _.each(data, function (obj) {
                var $ele = $idEle
                  .parent()
                  .find('td > button.machineLight')
                  .eq(0)
                var lightName = $idEle.parent().find('td').eq(1)
                var modifyName = $idEle.parent().find('td').eq(5)
                var modifyTime = $idEle.parent().find('td').eq(6)
                $ele.attr('name', obj.light_name)
                $ele.css('background', obj.color)
                lightName.html(obj.light_name)
                modifyName.html(obj.modify_by)
                modifyTime.html(servkit.dateFormateString(obj.modify_time))
                that.lightMap[obj.light_id] = obj
              })
              that.$updateLightDialog.dialog('close')
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      refreshLight: function () {
        var that = this
      },
      filterUndefined: function (value) {
        var that = this
        if (_.isUndefined(value)) {
          return ''
        } else {
          return value
        }
      },
    },
    preCondition: {
      initLightMap: function (done) {
        var that = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_light',
              columns: [
                'light_id',
                'light_name',
                'color',
                'create_time',
                'create_by',
                'modify_time',
                'modify_by',
              ],
            }),
          },
          {
            success: function (data) {
              _.each(data, function (obj) {
                that.lightMap[obj.light_id] = obj
              })
              done(true)
            },
            fail: function (data) {
              console.log(data)
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
        '/js/plugin/colorpicker/bootstrap-colorpicker.min.js',
      ],
    ],
  })
}
