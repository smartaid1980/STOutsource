import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()

      var headBgColor = '#e8e8e8' //head顏色
      var defaultLigthColor = '#F3F3F3' //燈號btn預設顏色

      var machineLightObj = {}
      var deviceMap = {}
      var deviceBoxObj = {}
      var machineCncBrandMap = {}
      var currentLights = {}
      var macroMap

      //demo時將假資料都變綠燈
      var demoLights = {}
      var boxArr = []

      /* selector */
      var $plantAreaTable = $('#plantAreaTable')
      var $plantAreaForm = $('#plantAreaForm')
      var $buildSearchTable = $('#buildSearchTable')
      var searchTableColumns = [
        {
          id: 'plant',
          name: `${i18n('Plant_Area')}`,
          format: {
            type: 'suffix',
            digit: 2,
            suffix: 'M',
          },
        },
        {
          id: 'machine',
          name: `${i18n('Machine')}`,
          format: {
            type: 'suffix',
            digit: 2,
            suffix: 'M',
          },
        },
        {
          id: 'status',
          name: `${i18n('Status')}`,
          format: {
            type: 'suffix',
            digit: 2,
            suffix: 'M',
          },
        },
      ]
      var searchTableOptions = {
        //"sDom":"t<'dt-toolbar-footer'>",
        paging: true,
        ordering: false,
        //"lengthChange": false,
        autoWidth: false,
      }

      //主要區域
      ;(function plant() {
        if (servkit.isDemoMonitor()) {
          _.each(servkit.getMachineMap(), function (ele, machineId) {
            if (ele.is_real_data == 0) {
              demoLights[machineId] = ele.demo_status
            }
          })
        }

        initMachineLightAndSubscrib()
        //取得 廠區內有有權限瀏覽的機台 的廠區
        context.getPlantMachineByGroupAndPlantList()
        //建立廠域清單
        $plantAreaForm.append(
          _.map(context.plantList, function (plant_id) {
            return (
              "<option style='padding:3px 0 3px 3px;' value='" +
              plant_id +
              "'>" +
              servkit.getPlantAreaName(plant_id) +
              '</option>'
            )
          })
        )
        //列表分頁
        initSearchTalbe()

        var macroPath =
          'app/' +
          document.location.hash.split('/').slice(1, 4).join('/') +
          '/macro.json'
        $.getJSON(macroPath)
          .done(function (macroObj) {
            macroMap = macroObj
          })
          .fail(function (d, textStatus, error) {
            console.error(
              'getJSON failed, status: ' + textStatus + ', error: ' + error
            )
          })

        //換廠域
        $plantAreaForm
          .on('change', function () {
            buildPlantAreaTable(plantAreaTableCallback)
          })
          .trigger('change')
      })()

      //列表分頁
      function initSearchTalbe() {
        var matrix = []
        updateInfoObj(context.preCon.getMachinePlantArea)
        _.each(context.plantMachinesByGroup, function (ele) {
          var statusColor
          if (currentLights[ele.device_id] != undefined) {
            statusColor =
              machineLightObj[currentLights[ele.device_id].status].color
          } else {
            statusColor = defaultLigthColor
          }
          var array = []
          array.push(servkit.getPlantAreaName(ele.plant_id))
          array.push(servkit.getMachineName(ele.device_id))
          array.push(
            '<td><span id="' +
              ele.device_id +
              '-table" class="btn machineLight" style="background: ' +
              statusColor +
              ';" machineid="' +
              ele.device_id +
              '" boxid="' +
              deviceBoxObj[ele.device_id] +
              '" cncbrand="' +
              machineCncBrandMap[ele.device_id] +
              '"></span></td>'
          )
          matrix.push(array)
        })
        searchTableOptions['data'] = matrix
        growPlantAreaDataTable(
          $buildSearchTable,
          searchTableColumns,
          searchTableOptions
        )
      }

      //初始化燈號
      function initMachineLightAndSubscrib() {
        machineLightObj = servkit.getMachineLightMap()
        var machineLigthDec = `<span>${i18n('Light_Status')}:</span>&nbsp;`
        _.each(machineLightObj, function (elem, light_id) {
          machineLigthDec =
            machineLigthDec +
            '<span class="btn" style="background:' +
            elem.color +
            ';"></span>&nbsp;<span>' +
            elem.light_name +
            '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
        })

        $('#machineLight').html($(machineLigthDec))
        $('#machineLightSearch').html($(machineLigthDec))
        subscribeUpdateDeviceStatus($plantAreaTable, $buildSearchTable)

        setTimeout(function () {
          var refreshMacro = servkit
            .schedule('refreshMacro')
            .freqMillisecond(20000)
            .action(refreshWorkMacro)
            .start()
        }, 3000)
      }

      function refreshWorkMacro() {
        servkit.ajax(
          {
            url: 'api/enzoymacroeditor/getLatestWorkMacro',
            type: 'GET',
          },
          {
            success: function (data) {
              _.each(data, function (elem, machineId) {
                if (!_.isUndefined(currentLights[machineId])) {
                  currentLights[machineId].macro = elem.macro
                  currentLights[machineId].duration = elem.macro_start_datetime
                    ? moment() - moment(elem.macro_start_datetime)
                    : 0
                }
              })
              console.debug(currentLights)
            },
          }
        )
        //      hippo.newSimpleExhaler()
        //          .space("work_macro")
        //          .index("machine_id", servkit.getMachineList())
        //          .indexRange("date", moment().add(-1, 'weeks').format('YYYY/MM/DD'), moment().format('YYYY/MM/DD'))
        //          .columns("machine_id", "start_time", "macro")
        //          .exhale(function (exhalable) {
        //            var latestMacroStatus = {};
        //            _.each(_.groupBy(_.sortBy(exhalable.exhalable, "start_time"), "machine_id"), function (dataList, machineId) {
        //              latestMacroStatus[machineId] = _.last(dataList);
        //            });
        //
        //            _.each(latestMacroStatus, function (elem, machineId) {
        //              if (!_.isUndefined(currentLights[machineId])) {
        //                currentLights[machineId].macro = elem.macro;
        //                currentLights[machineId].duration = moment().diff(moment(elem.start_time, 'YYYY/MM/DD HH:mm:ss'));
        //              }
        //            });
        //            console.log(currentLights);
        //          });
      }

      //建立廠域
      function buildPlantAreaTable(callback) {
        //取廠域matrix
        servkit.ajax(
          {
            url: 'api/plantarea/readAreaById',
            type: 'GET',
            contentType: 'application/json',
            data: {
              id: $plantAreaForm.val(),
            },
          },
          {
            success: function (data) {
              callback(data)
            },
          }
        )
      }

      //根據後端回傳資料建立廠域
      function plantAreaTableCallback(data) {
        updateInfoObj(data) //初始化deviceMap、deviceBoxObj、machineCncBrandMap
        //初始化廠區
        if (data.area != undefined) {
          var $tbody = $('<tbody></tbody>')
          _.each(data.area, function (record, rowKey) {
            var $tr = $('<tr align="center"></tr>')
            if (rowKey == 0) {
              $tr.attr('bgcolor', headBgColor)
            }
            _.each(record, function (col, colKey) {
              var $td = $(
                '<td id="row' +
                  rowKey +
                  '-col' +
                  colKey +
                  '" style="height:45px;border: 1px solid #cecece;"></td>'
              )
              if (
                col != '' &&
                rowKey != 0 &&
                colKey != 0 &&
                context.preCon.getMachineByGroup[col]
              ) {
                var machineId = col
                $td.attr('machineId', machineId)
                $td.attr('boxId', deviceBoxObj[machineId])
                $td.attr('cncBrand', machineCncBrandMap[machineId])
                if (deviceBoxObj[machineId] && currentLights[machineId]) {
                  var status
                  if (
                    !isTimeoutDeviceStatus(
                      machineId,
                      currentLights[machineId].dateTime
                    )
                  ) {
                    status =
                      machineLightObj[currentLights[machineId].status].color
                  } else {
                    status = machineLightObj['0'].color
                  }
                  $td.append(
                    '<span class="btn machineLight" style="background:' +
                      status +
                      ';"' +
                      '  rel="tooltip" data-placement="top" data-original-title="<img src=\'/ServCloud/public/frontend/img/avatars/3.png\'>" data-html="true" ></span>'
                  )
                } else {
                  $td.append(
                    '<span class="btn machineLight" style="background: ' +
                      defaultLigthColor +
                      ';"></span>'
                  )
                }
              } else if (rowKey == 0 || colKey == 0) {
                $td.append(col)
              }
              $td.append('<br>')
              //沒找到device對映的name就顯示原來的
              if (deviceMap[machineId] == undefined) {
                $td.append(machineId)
              } else {
                //將id換成name
                $td.append(deviceMap[machineId])
              }
              $tr.append($td)
            })
            $tbody.append($tr)
          })
          $plantAreaTable.html('') //先清空之前的
          $plantAreaTable.append(
            '<col style="background-color:' + headBgColor + '"/>'
          ) //第一欄是row head要灰底
          $plantAreaTable.append($tbody) //長出廠域

          //綁定監控頁面
          bindTarget2Monitor()
        }
      }

      //定期更新燈號
      function subscribeUpdateDeviceStatus($plantAreaTable, $buildSearchTable) {
        //*************************
        // 使用subscribe
        //*************************
        //    console.log(boxArr);
        servkit.subscribe('DeviceStatus', {
          machines: boxArr, //["IntraD01", "IntraD02"],
          handler: function (data) {
            //console.log(data);
            var machinesMap = deviceStatusData(data)
            _.each(machinesMap, function (ele, machineId) {
              var status = ele['G_CONS()'] == 'B' ? '0' : ele['G_CONS()'] //B表示離線
              if (_.isArray(status)) {
                //有時候是陣列....
                status = status[0] //陣列就取第一個值
              }
              if (_.isUndefined(currentLights[machineId])) {
                currentLights[machineId] = {}
              }
              currentLights[machineId].dateTime = ele['info']['date']
              currentLights[machineId].boxId = ele['info']['boxId']
              currentLights[machineId].machineId = machineId
              currentLights[machineId].status = status
            })
            //demo假資料換燈號
            var currentTime = new Date()
            //					var demoIndex = 0;
            _.each(demoLights, function (demoStatus, demoMachineId) {
              currentLights[demoMachineId] = {}
              currentLights[demoMachineId].dateTime = currentTime
              currentLights[demoMachineId].boxId = 'BoxD01'
              currentLights[demoMachineId].machineId = demoMachineId
              currentLights[demoMachineId].status = demoStatus
              if (demoStatus == '12') currentLights[demoMachineId].macro = 'M3'
              currentLights[demoMachineId].duration = 165918
            })
            updateTableStatus($plantAreaTable, $buildSearchTable)
          },
        })
      }

      //根據table更新燈號
      function updateTableStatus($plantAreaTable, $buildSearchTable) {
        if (currentLights) {
          $plantAreaTable.find('.macro-hint').remove()
          _.each(currentLights, function (ele, machineId) {
            var machineLight = machineLightObj[ele.status]
            var color = machineLight.color
            var status = ele.status
            var macro = ele.macro
            var macroTCNT = ele.duration //millisecond
            var $plantAreaTd = $plantAreaTable.find(
              "td[machineId='" + machineId + "']"
            )
            if (!isTimeoutDeviceStatus(ele.machineId, ele.dateTime)) {
              $plantAreaTd
                .find('.machineLight')
                .attr('style', 'background:' + color)
              $buildSearchTable
                .find('#' + machineId + '-table')
                .attr('style', 'background:' + color)

              //            $plantAreaTd.find(".macro-hint").remove();
              if (macro && macro !== '' && macroMap) {
                $plantAreaTd.append(
                  '<h6 class="txt-color-purple macro-hint">' +
                    (macroMap[macro] || macro) +
                    (macro == 'M2'
                      ? ' ' + macroTCNT.millisecondToDHHmmss()
                      : '') +
                    '</h6>'
                )
              }
            } else {
              $plantAreaTd
                .find('.machineLight')
                .attr('style', 'background:' + machineLightObj['0'].color)
              $buildSearchTable
                .find('#' + machineId + '-table')
                .attr('style', 'background:' + machineLightObj['0'].color)
            }
          })
        } else {
          console.warn('DeviceStatus file not found!!')
        }
      }

      /* util區 */

      //初始化deviceMap、deviceBoxObj、machineCncBrandMap
      function updateInfoObj(data) {
        //初始化machine id與 name的對映
        if (data.machines != undefined) {
          _.each(data.machines, function (value) {
            deviceMap[value.device_id] = value.device_name
          })
        }
        //初始化box與machine的對映
        if (data.boxs != undefined) {
          _.each(data.boxs, function (value) {
            boxArr.push(value.box_id) //***給deviceStatus subscribe取box資料用的
            if (value.devices != undefined) {
              _.each(value.devices, function (device) {
                deviceBoxObj[device.device_id] = value.box_id
              })
            }
          })
        }
        //初始化machine cnc brand
        if (data.machineCncBrands != undefined) {
          _.each(data.machineCncBrands, function (value) {
            machineCncBrandMap[value.device_id] = value.cnc_id
          })
        }
      }

      //因為device status是讀取檔案，若檔案一直沒有更新的話就會一直讀到舊的狀態，所以要比較資料寫入的時間
      function isTimeoutDeviceStatus(deviceId, deviceStatusDate) {
        var preDate = new Date(deviceStatusDate)
        if (preDate) {
          //檔案一分鐘沒有更新就timeout
          preDate.setMinutes(preDate.getMinutes() + 1)
          if (new Date() < preDate) {
            return false //沒有timeout
          } else {
            return true //超過一分鐘沒更新，timeout了
          }
        } else {
          return true
        }
      }

      //***protobuf轉成machine map
      function deviceStatusData(data) {
        var machinesMap = {} //機台map，用來存全部的機台
        //console.log("--------------------");
        //console.log(data);
        //console.log("--------------------");
        _.each(data, function (boxStr) {
          var box
          try {
            box = JSON.parse(boxStr)
          } catch (e) {
            console.warn('boxStr: ', e, ', msg: ', boxStr)
            return
          }
          var boxId = box.from
          var stringValues = box.result.stringValues //取値
          _.each(stringValues, function (ele) {
            var gCode = ele.signal.id //取得gCode
            var systems = ele.values //多系統陣列
            _.each(systems, function (system) {
              var matrix
              try {
                matrix = JSON.parse(system.array) //單個系統的值(是matrix:[[machine,value]])
              } catch (e1) {
                console.warn(
                  'system.array: ',
                  e1,
                  ', gCode: ',
                  gCode,
                  ', msg: ',
                  system.array
                )
                return
              }
              _.each(matrix, function (machineValue) {
                if (!machinesMap[machineValue[0]]) {
                  //沒機台就建
                  machinesMap[machineValue[0]] = {}
                }
                if (!machinesMap[machineValue[0]][gCode]) {
                  //機台沒gCode就建
                  machinesMap[machineValue[0]][gCode] = []
                }
                machinesMap[machineValue[0]]['info'] = {
                  boxId: boxId,
                  date: new Date(),
                }
                machinesMap[machineValue[0]][gCode].push(machineValue[1]) //將數值放入陣列中
              })
            })
          })
        })
        return machinesMap
      }

      //按鈕綁定監控頁面(info)
      function bindTarget2Monitor() {
        var lang = servkit.getCookie('lang')
        var url = '#app/EquipMonitor/function/' + lang + '/01_info.html'
        $('.machineLight')
          .off('click')
          .on('click', function () {
            var boxId
            var machineId
            var cncBrand
            //grid
            var parentNode = $(this).parent()
            boxId = parentNode.attr('boxid')
            machineId = parentNode.attr('machineid')
            cncBrand = parentNode.attr('cncbrand')
            if (machineId == undefined) {
              //table
              var node = $(this)
              boxId = node.attr('boxid')
              machineId = node.attr('machineid')
              cncBrand = node.attr('cncbrand')
            }

            if (boxId != undefined) {
              var encodeBoxId = encodeURIComponent(boxId)
              var encodeMachineId = encodeURIComponent(machineId)
              var encodeCncBrand = encodeURIComponent(cncBrand)
              window.location.replace(
                url +
                  '?boxId=' +
                  encodeBoxId +
                  '&machineId=' +
                  encodeMachineId +
                  '&cncBrand=' +
                  encodeCncBrand
              )
            } else {
              $.smallBox({
                title:
                  `${i18n('Machine')} ` +
                  machineId +
                  ` ${i18n('Not_Yet_Bound_Any_One_Box')}`,
                content:
                  "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                color: '#C46A69',
                iconSmall: 'fa fa-warning swing animated',
                timeout: 4000,
              })
              console.log('machine not bind box!')
            }
          })
      }

      function growPlantAreaDataTable($table, columns, options) {
        /***************** render table html ******************/
        var html = []

        html.push('<thead><tr>')
        _.each(columns, function (elem) {
          var temp = '<th'
          temp = elem.dataHide
            ? temp + " data-hide='" + elem.dataHide + "'"
            : temp
          temp = elem.tooltip
            ? temp +
              " data-placement='top' data-original-title='" +
              elem.tooltip +
              "'> <i class='fa fa-question-circle'></i> "
            : temp + '>'
          html.push(temp + elem.name + '</th>')
        })
        html.push('</tr></thead><tbody></tbody>')

        $table.html(html.join(''))
        //$table.closest(".jarviswidget").find(".fa-plus").click(); // 不先把縮起來的 widget 打開無法繪圖...

        /***************** render datatable ******************/
        var responsiveHelper,
          breakpointDefinition = {
            tablet: 1024,
            phone: 480,
          }

        $table.dataTable().fnDestroy()

        var table = $table.DataTable(
          $.extend(
            {},
            {
              sDom:
                options.sDom ||
                "<'dt-toolbar'r>" +
                  't' +
                  "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs table-info'i><'col-xs-12 col-sm-4'p>>",
              //                autoWidth: false,
              headerCallback: function (thead, data, start, end, display) {
                $(thead).find('th').removeClass('sorting_asc')
              },
              preDrawCallback: function () {
                // Initialize the responsive datatables helper once.
                if (!responsiveHelper) {
                  responsiveHelper = new ResponsiveDatatablesHelper(
                    $table,
                    breakpointDefinition
                  )
                }
              },
              rowCallback: function (nRow) {
                responsiveHelper.createExpandIcon(nRow)
              },
              drawCallback: function (oSettings) {
                responsiveHelper.respond()
                $table.find('th').tooltip({
                  container: 'body',
                })
              },
            },
            options
          )
        )

        $table.data('datatable', table)

        //綁定監控頁面
        bindTarget2Monitor()
      }
    },
    util: {
      plantMachinesByGroup: undefined, //[{}, {}, ...]
      plantList: undefined,
      getPlantMachineByGroupAndPlantList: function () {
        var context = this
        context.plantMachinesByGroup = _.filter(
          context.preCon.getMachinePlantArea.machines,
          function (machineObj) {
            return context.preCon.getMachineByGroup[machineObj.device_id]
          }
        )
        context.plantList = _.uniq(
          _.pluck(context.plantMachinesByGroup, 'plant_id')
        )
      },
    },
    preCondition: {
      getMachineByGroup: function (done) {
        this.commons.getMachineByGroup(done)
      },
      getMachinePlantArea: function (done) {
        servkit.ajax(
          {
            url: 'api/plantarea/getMachinePlantArea',
            type: 'GET',
          },
          {
            success: function (data) {
              console.log(data)
              done(data)
            },
          }
        )
      },
    },
    delayCondition: ['machineList', 'machineLightList', 'machineBrandList'],
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
