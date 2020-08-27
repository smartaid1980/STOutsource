import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  pageSetUp()

  var $updateLightDialog = $('#dialog-update-light')
  $updateLightDialog.hide()

  ;(function () {
    var initMachineLight = function () {
      var $machineLightTableTag = $('#machine-datatables')
      var $updateColor = $('#updateColor')
      var $updateLightName = $('#updateLightName')
      var $swatches = $('#swatches')

      var renderMachineLightTable

      //套用colorpicker
      $updateColor.colorpicker().on('changeColor', function (event) {
        $swatches.css('background', event.color.toHex())
      })
      //讓colorpicker顯示在最上層
      $('.colorpicker').css('z-index', '9999')

      //初始化tool table
      var responsiveHelper = undefined,
        breakpointDefinition = {
          tablet: 1024,
          phone: 480,
        }

      var machineLightTable = $machineLightTableTag.DataTable({
        sDom:
          "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r>" +
          't' +
          "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
        autoWidth: true,
        preDrawCallback: function () {
          // Initialize the responsive datatables helper once.
          if (!responsiveHelper) {
            responsiveHelper = new ResponsiveDatatablesHelper(
              $machineLightTableTag,
              breakpointDefinition
            )
          }
        },
        rowCallback: function (row, data) {
          responsiveHelper.createExpandIcon(row)
          // 顯示格式調整
          _.each(row.querySelectorAll('td'), function (ele, i) {
            var value = ele.textContent
            ele.style.textAlign = 'right'

            if (i == 0) {
              //id欄位增加lightId class
              ele.className = ele.className + ' lightId'
            }

            if (i == 1) {
              //name欄位增加lightName class
              ele.className = ele.className + ' lightName'
            }

            if (i == 2) {
              //燈號顏色
              let value = ele.textContent
              ele.innerHTML =
                '<button name="' +
                value +
                '" class="btn machineLight" style="background:' +
                value +
                '"></button>'
            }

            if (i == 7) {
              //更新按鈕
              let value = ele.textContent
              ele.style.textAlign = 'center'
              //ele.innerHTML = '<button id="' + value + `" class="btn btn-success theToolDetail">${i18n('Update')}</button>`;
              ele.innerHTML =
                '<button name="' +
                value +
                `" class="btn btn-success update-light"><i class="fa fa-refresh"></i>&nbsp;${i18n(
                  'Update'
                )}</button>`
            }
          })
        },
      })
      renderMachineLightTable = function (data) {
        if (data.length > 0) {
          machineLightTable.clear().rows.add(data).draw()
        } else {
          $('#dialog-no-data').dialog('open')
        }
      }
      //過濾欄位事件綁定
      $machineLightTableTag
        .find('thead th > input[type=text]')
        .on('keyup change', function () {
          machineLightTable
            .column($(this).parent().index() + ':visible')
            .search(this.value)
            .draw()
        })

      updateMachineLight()

      function updateMachineLight() {
        getDbData(
          'm_device_light',
          [
            'light_id',
            'light_name',
            'color',
            'create_time',
            'create_by',
            'modify_time',
            'modify_by',
          ],
          getDbDataCallback
        )
      }

      function getDbData(tableName, colArr, callback) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: tableName,
              columns: colArr,
            }),
          },
          function (data) {
            callback(data)
          }
        )
      }

      //更新燈號
      function updateTable(updateUrl, formData, callback) {
        servkit.ajax(
          {
            url: updateUrl,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
          },
          function (data) {
            console.log(data)
            callback(data)
          }
        )
      }

      function getDbDataCallback(datas) {
        var showDatas = []
        _.each(datas, function (ele) {
          var newArr = []
          newArr.push(filterUndefined(ele.light_id)) //燈號ID
          newArr.push(filterUndefined(ele.light_name)) //燈號名稱
          newArr.push(filterUndefined(ele.color)) //燈號顏色
          newArr.push(filterUndefined(ele.create_by)) //建立者
          newArr.push(filterUndefined(ele.create_time)) //建立日期
          newArr.push(filterUndefined(ele.modify_by)) //更新者
          newArr.push(filterUndefined(ele.modify_time)) //更新日期
          newArr.push(filterUndefined(ele.color)) //更新按鈕(傳入燈號顏色)
          showDatas.push(newArr)
        })
        //濾掉undefined的資料
        function filterUndefined(value) {
          if (_.isUndefined(value)) {
            return ''
          } else {
            return value
          }
        }
        renderMachineLightTable(showDatas)
        initUpdateBtn()
      }

      function initUpdateBtn() {
        $machineLightTableTag
          .find('tbody')
          .on('click', '.update-light', function () {
            //$('#table tbody').on("click", ".update-light", function() {
            var theDom = $(this)
            //取得更新button上設置的顏色當預設值
            var theColor = theDom.attr('name')
            //預設色票
            $swatches.css('background', theColor)
            //預設色票代碼
            $updateColor.val(theColor)
            //將colorpicker上的顏色也改成預設值(不改的話會有顏色亂掉的嚴重後果)
            $updateColor.colorpicker('setValue', theColor)
            var rowObj = theDom.parents('tr')
            var theLightId = rowObj.find('td.lightId').text()
            var theLightName = rowObj.find('td.lightName').text()
            $updateLightName.val(theLightName)

            var plantId = theDom.attr('name')
            $updateLightDialog.dialog({
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
                    $updateColor.val(theColor)
                    $updateLightDialog.dialog('close')
                  },
                },
                {
                  html: `<i class='fa fa-check'></i>&nbsp; ${i18n('Ok')}`,
                  class: 'btn btn-success',
                  click: function () {
                    //取得目前選取的顏色
                    var currentUpdateColor = $updateColor.val()
                    var currentUpdateLightName = $updateLightName.val()
                    var updateParamObj = {
                      light_id: theLightId,
                      light_name: currentUpdateLightName,
                      color: currentUpdateColor,
                    }

                    updateTable(
                      'api/machinelight/update',
                      updateParamObj,
                      updateTableCallback
                    )

                    function updateTableCallback(data) {
                      updateMachineLight() //更新table
                      $updateLightDialog.dialog('close')
                    }
                  },
                },
              ],
            })
            $updateLightDialog.dialog('open')
          })
      }
    }

    // 佈署查無資料時的提示視窗
    $('#content').append(
      $('<div id="dialog-no-data" title="Dialog No Data"></div>')
    )
    $('#dialog-no-data').dialog({
      autoOpen: false,
      width: 200,
      resizable: false,
      modal: true,
      title: 'No Data',
      buttons: [
        {
          html: "<i class='fa fa-frown-o'></i>&nbsp; OK",
          class: 'btn btn-default',
          click: function () {
            $(this).dialog('close')
          },
        },
      ],
    })

    // load datatable plugins
    servkit.requireJs(
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        '/js/plugin/colorpicker/bootstrap-colorpicker.min.js', //色票
      ],
      initMachineLight
    )
  })()
}
