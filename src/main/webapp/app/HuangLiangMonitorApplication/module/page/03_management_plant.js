import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var $table = $('#stk-plant-table')
      var $dialog = $('#dialog-edit-plant-area')
      var $createPlantArea = $('#create-plant-area')
      var $dialogSettingPlantRowColumn = $('#dialog-setting-plant-row-column')
      var $selectEditPlant = $('#select-edit-plant')
      var $createPlantRow = $('#create-plant-row')
      var $createPlantColumn = $('#create-plant-column')
      var $createPlanAreatForm = $('#create-plan-areat-form')
      var $noPlantMachines = $('#no-plant-machines')
      var $plantAreaTable = $('#plant-area-table')
      var $errorMsg = $('#error-msg') // 顯示錯誤訊息的div

      var machineNameIdMap

      // 編輯廠域
      $table.on('click', '.edit-plant-area-btn', function () {
        var plantId = $(this).attr('name')

        setNoPlantMachine(plantId)

        $dialog.dialog({
          autoOpen: false,
          width: '95%',
          modal: true,
          resizable: false,
          title: `${i18n('Edit_Layer')}`,
          buttons: [
            {
              html: `${i18n('Cancel')}`,
              class: 'btn btn-default',
              click: function () {
                $(this).dialog('close')
              },
            },
            {
              html: `${i18n('Submit')}`,
              class: 'btn btn-primary',
              click: function () {
                createPlantAreaMatrix(plantId)
              },
            },
          ],
        })
        buildPlantAreaTable(plantId)
        $selectEditPlant.text(plantId)
        $dialog.dialog('open')
      })

      $createPlantArea.on('click', function () {
        // kevin dialog-setting-plant-row-column

        $dialogSettingPlantRowColumn.dialog({
          autoOpen: false,
          width: '50%',
          modal: true,
          resizable: false,
          title: `${i18n('Prompt')}`,
          buttons: [
            {
              html: `${i18n('Cancel')}`,
              class: 'btn btn-default',
              click: function () {
                $(this).dialog('close')
              },
            },
            {
              html: `${i18n('Ok')}`,
              class: 'btn btn-primary',
              click: function () {
                var plant = $selectEditPlant.text()
                // console.log("plant:" + plant);

                var rowSize = $createPlantRow.val()
                var colSize = $createPlantColumn.val()

                // console.log(rowSize + ":" + colSize);

                var $plantAreaMatrix = []

                for (var rowIndex = 0; rowIndex < rowSize; rowIndex++) {
                  var rowObj = []
                  for (var colIndex = 0; colIndex < colSize; colIndex++) {
                    rowObj.push('')
                  }
                  $plantAreaMatrix.push(rowObj)
                }

                buildTable($plantAreaMatrix)
                $dialogSettingPlantRowColumn.dialog('close')
                return false
              },
            },
          ],
        })
      })

      var $validator = $createPlanAreatForm.validate({
        rules: {
          row: {
            required: true,
            digits: true,
            minlength: 1,
            maxlength: 2,
          },
          column: {
            required: true,
            digits: true,
            minlength: 1,
            maxlength: 2,
          },
        },

        // Messages for form validation
        messages: {
          row: {
            required: `${i18n('Please_Enter_Number')}`,
            digits: `${i18n('Only_Enter_Number')}`,
            minlength: `${i18n('Number_Min')} 1`,
            maxlength: `${i18n('Number_Max')} 2`,
          },
          column: {
            required: `${i18n('Please_Enter_Number')}`,
            digits: `${i18n('Only_Enter_Number')}`,
            minlength: `${i18n('Number_Min')} 1`,
            maxlength: `${i18n('Number_Max')} 2`,
          },
        },

        highlight: function (element) {
          $(element)
            .closest('.form-group')
            .removeClass('has-success')
            .addClass('has-error')
        },
        unhighlight: function (element) {
          $(element)
            .closest('.form-group')
            .removeClass('has-error')
            .addClass('has-success')
        },
        submitHandler: function () {
          $dialogSettingPlantRowColumn.dialog('open')
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
          if (element.parent('.input-group').length) {
            error.insertAfter(element.parent())
          } else {
            error.insertAfter(element)
          }
        },
      })

      function createPlantAreaMatrix(plantId) {
        // var temp = $('#buildPlantArea');
        var noPlantMachinesArr = []
        var noExistMachines = []
        $.each($noPlantMachines.find('option'), function () {
          // console.log($(this).val());
          noPlantMachinesArr.push($(this).val())
        })

        var jsonMatrix = []
        var uniqueDevice = []
        var duplicateDevice = []

        $.each($('#buildPlantArea').find('tr'), function (rowKey) {
          var row = []
          $.each($(this).find('td'), function (columnKey) {
            var deviceId
            var head
            var deviceName
            if (rowKey === 0 || columnKey === 0) {
              head = $(this).text()
              // deviceId = machineNameIdMap[deviceId];
              // console.log("row or column = 0");
              // console.log(deviceName);
              // console.log(deviceId);
              console.log(deviceName)
            } else {
              deviceName = $(this).children().val()
              deviceId = machineNameIdMap[deviceName]
              // console.log("row or column != 0");
              // console.log(deviceName);
              // console.log(deviceId);
            }
            if (deviceId !== undefined) {
              row.push(deviceId)
            } else {
              if (head !== undefined) {
                row.push(head)
              } else {
                row.push('')
              }
            }
            // 防止使用者在同一個廠區設定多次同一機台
            if ($.inArray(deviceName, uniqueDevice) === -1) {
              uniqueDevice.push(deviceName)
            } else if (deviceName !== '') {
              if (rowKey === 0 || columnKey === 0) {
                // 第一行或第一列
              } else {
                duplicateDevice.push(deviceName)
              }
            }
            // 防止設置不存在的機台
            if (
              $.inArray(deviceName, noPlantMachinesArr) === -1 &&
              deviceName !== ''
            ) {
              if (rowKey === 0 || columnKey === 0) {
                // 第一行或第一列
              } else {
                noExistMachines.push(deviceName)
              }
            }
          })
          jsonMatrix.push(row)
        })

        if (duplicateDevice.length !== 0) {
          $errorMsg.html(
            `${i18n('Machine')} ` +
              duplicateDevice.join('、') +
              ` ${i18n('Repeat_Setting')}`
          )
          $errorMsg.show()
        } else if (noExistMachines.length !== 0) {
          $errorMsg.html(
            `${i18n('Machine')} ` +
              noExistMachines.join('、') +
              ` ${i18n('Not_Exist')}`
          )
          $errorMsg.show()
        } else {
          // 儲存廠域資訊
          // console.log(jsonMatrix);
          storePlantArea(plantId, jsonMatrix)
        }
      }

      function storePlantArea(plantId, areaMatrix) {
        console.log(
          JSON.stringify({
            id: plantId,
            area: areaMatrix,
          })
        )
        servkit.ajax(
          {
            url: 'api/plantarea/updateArea',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              id: plantId,
              area: areaMatrix,
            }),
          },
          {
            success: function (data) {
              // console.log(data);
              $dialog.dialog('close')
              $('.stk-refresh-btn').trigger('click') // 更新UI上的廠區資訊
            },
          }
        )
      }

      function buildPlantAreaTable(plantId) {
        // var $testMatrix = [["1", "2", "3"], ["4", "MA-1001", "MA-1560"], ["5", "MA-1002", "MA-1003"]];
        servkit.ajax(
          {
            url: 'api/plantarea/readAreaById',
            type: 'GET',
            contentType: 'application/json',
            data: {
              id: plantId,
            },
          },
          {
            success: function (data) {
              buildTable(data.area)
            },
            fail: function (data) {
              $.smallBox({
                title: data,
                content:
                  "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                color: '#C46A69',
                iconSmall: 'fa fa-warning swing animated',
                timeout: 4000,
              })
            },
          }
        )
      }

      function buildTable(data) {
        var $table = $(
          '<table id="buildPlantArea" class="table-bordered" width="100%" style="table-layout:fixed;"><col style="background-color:#F3F3F3"/></table>'
        )
        var $tbody = $('<tbody></tbody>')
        console.log(data)
        $.each(data, function (rowKey) {
          var $tr = $('<tr align="center"></tr>')
          if (rowKey == 0) {
            $tr.attr('bgcolor', '#F3F3F3')
          }
          $.each(this, function (colKey) {
            var $td = $('<td id="row' + rowKey + '-col' + colKey + '"></td>')
            if (colKey == 0 || rowKey == 0) {
              if (colKey != rowKey) {
                // 若不是table[0][0]，就可以編輯
                $td.attr('contenteditable', 'true')
              }
              $td.append(this)
            } else {
              $td.append(
                '<input type="text" list="productName" style="border:none;display:block;width:100%;" value="' +
                  servkit.getMachineName(this) +
                  '"/>'
              )
            }
            $tr.append($td)
          })
          $tbody.append($tr)
        })

        $table.append($tbody)
        $plantAreaTable.html($table)
      }

      function setNoPlantMachine(plantId) {
        servkit.ajax(
          {
            url: 'api/plantarea/readNoPlantMachineIdByPlantId',
            type: 'GET',
            contentType: 'application/json',
            data: {
              id: plantId,
            },
          },
          {
            success: function (data) {
              // console.log(data);
              var $machineList = $('<datalist id="productName"></datalist>')
              machineNameIdMap = {}
              _.each(data, function (ele) {
                $machineList.append(
                  '<option value="' +
                    servkit.getMachineName(ele.device_id) +
                    '">' +
                    ele.device_id +
                    '</option>'
                )
                machineNameIdMap[servkit.getMachineName(ele.device_id)] =
                  ele.device_id // key: machineName, value: machineId
              })
              $noPlantMachines.html($machineList)
            },
          }
        )
      }

      servkit.crudtable({
        tableSelector: '#stk-plant-table',
        create: {
          url: 'api/plant/create',
          end: {
            3: function (data) {
              console.log(data)
              return `<button class='btn btn-success edit-plant-area-btn'>${i18n(
                'Edite'
              )}</button>`
            },
          },
          finalDo: function () {
            $('.stk-refresh-btn').trigger('click') // 為了更新button
          },
        },
        read: {
          url: 'api/plant/read',
          end: {
            2: function (data) {
              return _.map(data, function (ele) {
                return servkit.getMachineName(ele.device_id)
              })
            },
            3: function (data) {
              // console.log(data);
              return (
                "<button class='btn btn-success edit-plant-area-btn' name='" +
                data +
                `'>${i18n('Edite')}</button>`
              )
            },
          },
        },
        update: {
          unavailable: true,
        },
        delete: {
          url: 'api/plant/delete',
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }

            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return `${i18n('Stk_Pk')}`
              }
            }
          },
        },
      })
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
