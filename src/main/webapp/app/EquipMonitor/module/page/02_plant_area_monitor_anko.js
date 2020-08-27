import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      ;(function () {
        var dateIndex = 0
        var boxIdIndex = 1
        var machineIdIndex = 2
        var machineStatusIndex = 3

        var headBgColor = '#e8e8e8' //head顏色
        var defaultLigthColor = '#F3F3F3' //燈號btn預設顏色

        var machineLightObj = {}
        var deviceMap = {}
        var deviceBoxObj = {}
        var machineCncBrandMap = {}
        var currentLights = {}

        //demo時將假資料都變綠燈
        var demoLights = {}

        var boxArr = []

        /* selector */
        var $machineLigth = $('#machineLigth')
        var $machineLigthSearch = $('#machineLigthSearch')

        var $plantAreaTable = $('#plantAreaTable')
        var $plantAreaForm = $('#plantAreaForm')

        var $buildSearchTable = $('#buildSearchTable')

        var $myTab = $('#myTab')

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
        var plant = function () {
          if (servkit.isDemoMonitor()) {
            getDbData(
              'm_device',
              ['device_id', 'is_real_data', 'demo_status'],
              demoMachineLightCallback
            )
          }
          getDbData(
            'm_device_light',
            ['light_id', 'light_name', 'color'],
            machineLightCallback
          )
          //一開始先初始化廠域選單
          getDbData('m_plant', ['plant_id'], allPlantIdCallback)

          //換廠域
          $plantAreaForm.change(function () {
            buildPlantAreaTable($plantAreaForm.val(), plantAreaTableCallback)
          })
        }

        function initSearchTalbe() {
          //getDbData("m_plant_area", ["device_id", "plant_id"], initSearchTalbeCallback);
          servkit.ajax(
            {
              url: 'api/plantarea/getMachinePlantArea',
              type: 'GET',
              contentType: 'application/json',
            },
            {
              success: function (data) {
                initSearchTalbeCallback(data)
              },
            }
          )
        }

        //初始化燈號
        function machineLightCallback(data) {
          var machineLigthDec = `<span>${i18n('Light_Status')}:</span>&nbsp;`
          _.each(data, function (value) {
            machineLightObj[value.light_id] = value
            machineLigthDec =
              machineLigthDec +
              '<span class="btn" style="background:' +
              value.color +
              ';"></span>&nbsp;<span>' +
              value.light_name +
              '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
          })

          $machineLigth.html($(machineLigthDec))
          $machineLigthSearch.html($(machineLigthDec))
          subscribeUpdateDeviceStatus($plantAreaTable, $buildSearchTable)
        }

        //建立廠域
        function buildPlantAreaTable(plantId, callback) {
          //取廠域matrix
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
                callback(data)
              },
            }
          )
        }

        //定期更新燈號
        function subscribeUpdateDeviceStatus(
          $plantAreaTable,
          $buildSearchTable
        ) {
          //*************************
          // 使用subscribe
          //*************************
          console.log(boxArr)
          servkit.subscribe('xml_device_status', {
            machines: boxArr, //["IntraD01", "IntraD02"],
            handler: function (data) {
              //console.log(data);
              var machinesMap = deviceStatusData(data)
              _.each(machinesMap, function (ele, key) {
                var status = ele['G_CONS()']
                if (status == 'B') {
                  //B表示離線
                  status = '0'
                }
                //格式:currentLights["Machine02"] = ["2015/08/07 14:40:40", "BoxD01", "Machine02", "11"];
                currentLights[key] = [
                  ele['info']['date'],
                  ele['info']['boxId'],
                  key,
                  status,
                ]
              })
              //demo假資料換燈號
              var currentTime = new Date()
              var demoIndex = 0
              _.each(demoLights, function (demoStatus, demoMachineId) {
                //console.log(demoMachineId + ":" + demoStatus);
                //if(demoIndex == 1){//Demo時，一台idle，一台alarm
                //  currentLights[demoMachineId] = [currentTime, "BoxD01", demoMachineId, "12"];
                //}else if(demoIndex == 2){
                //  currentLights[demoMachineId] = [currentTime, "BoxD01", demoMachineId, "13"];
                //}else{
                currentLights[demoMachineId] = [
                  currentTime,
                  'BoxD01',
                  demoMachineId,
                  demoStatus,
                ]
                //}
                //demoLights["Machine02"] = "12";
                //demoLights["Machine03"] = "13";
                demoIndex++
              })
              //kevin test fake data
              //TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST
              /*function ran(){
                var min = 11, max=13
                var a = Math.floor(Math.random() * (max - min + 1)) + min;
                return "" + a;
              }
              currentLights["Machine01"] = ["2015/11/20 12:41:20", "BoxD01", "Machine01", ran()];
              currentLights["Machine02"] = [new Date(), "BoxD01", "Machine02", ran()];
              currentLights["Machine03"] = [new Date(), "BoxD01", "Machine03", ran()];
              currentLights["Machine04"] = [new Date(), "BoxD01", "Machine04", ran()];
              currentLights["Machine05"] = [new Date(), "BoxD01", "Machine05", ran()];*/
              //TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST=TEST
              updateTableStatus($plantAreaTable, $buildSearchTable)
            },
          })
        }

        //根據table更新燈號
        function updateTableStatus($plantAreaTable, $buildSearchTable) {
          if (currentLights) {
            console.log('update device status.')
            _.each(currentLights, function (ele) {
              var machineLight = machineLightObj[ele[machineStatusIndex]]
              var color = machineLight.color
              var status = machineLight.light_id
              var $plantAreaTd = $plantAreaTable.find(
                "td[machineId='" + ele[machineIdIndex] + "']"
              )
              //var $buildSearchTd = $buildSearchTable.find("td[machineId='"+ ele[machineIdIndex]+"-table']");
              if (!isTimeoutDeviceStatus(ele[machineIdIndex], ele[dateIndex])) {
                $plantAreaTd
                  .find('.machineLight')
                  .attr('style', 'background:' + color)
                $buildSearchTable
                  .find('#' + ele[machineIdIndex] + '-table')
                  .attr('style', 'background:' + color)
              } else {
                $plantAreaTd
                  .find('.machineLight')
                  .attr('style', 'background:' + machineLightObj['0'].color)
                $buildSearchTable
                  .find('#' + ele[machineIdIndex] + '-table')
                  .attr('style', 'background:' + machineLightObj['0'].color)
              }
            })
          } else {
            console.log('Not find deviceStatus file!!')
          }
        }

        //建立廠域清單
        function allPlantIdCallback(data) {
          $plantAreaForm.append(
            _.map(data, function (row) {
              return (
                "<option style='padding:3px 0 3px 3px;' value='" +
                row['plant_id'] +
                "'>" +
                servkit.getPlantAreaName(row['plant_id']) +
                '</option>'
              )
            })
          )
          //清單一建完就建立清單上第一個廠區
          buildPlantAreaTable($plantAreaForm.val(), plantAreaTableCallback)
          initSearchTalbe()
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
                if (col != '' && rowKey != 0 && colKey != 0) {
                  var machineId = col
                  $td.attr('machineId', machineId)
                  $td.attr('boxId', deviceBoxObj[machineId])
                  $td.attr('cncBrand', machineCncBrandMap[machineId])
                  if (
                    deviceBoxObj[machineId] != undefined &&
                    currentLights[machineId] != undefined
                  ) {
                    var status
                    if (
                      !isTimeoutDeviceStatus(
                        machineId,
                        currentLights[machineId][dateIndex]
                      )
                    ) {
                      status =
                        machineLightObj[
                          currentLights[machineId][machineStatusIndex]
                        ].color
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

        //建立列表
        function initSearchTalbeCallback(data) {
          var matrix = []
          updateInfoObj(data)
          _.each(data.machines, function (ele) {
            var statusColor
            if (currentLights[ele.device_id] != undefined) {
              statusColor =
                machineLightObj[
                  currentLights[ele.device_id][machineStatusIndex]
                ].color
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

        /* demo區 */
        function demoMachineLightCallback(data) {
          //console.log(data);
          //servkit.filterMachine(function (machine, id) { return !machine.is_real_data; });
          var currentTime = new Date()
          _.each(data, function (ele) {
            console.log(ele)
            if (ele.is_real_data == 0) {
              demoLights[ele.device_id] = ele.demo_status
            }
          })
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

        //取db資料
        function getDbData(tableName, columnArr, callback) {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: tableName,
                columns: columnArr,
              }),
            },
            {
              success: function (data) {
                callback(data)
              },
            }
          )
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
          /* xml_device_status 格式使用*/
          _.each(data, function (boxStr, boxId) {
            var box = JSON.parse(boxStr)
            _.each(box, function (machines, gCode) {
              _.each(machines, function (machineVal, machineId) {
                if (!machinesMap[machineId]) {
                  //沒機台就建
                  machinesMap[machineId] = {}
                }
                machinesMap[machineId]['info'] = {
                  boxId: boxId,
                  date: new Date(),
                }
                machinesMap[machineId][gCode] = machineVal
              })
            })
          })
          /*_.each(data, function(boxStr){
            var box = JSON.parse(boxStr);
            var boxId = box.from;
            var stringValues = box.result.stringValues;//取?
            _.each(stringValues, function(ele){
              var gCode = ele.signal.id;//取得gCode
              var systems = ele.values;//多系統陣列
              _.each(systems, function(system){
                var matrix = JSON.parse(system.array);//單個系統的值(是matrix:[[machine,value]])
                _.each(matrix, function(machineValue){
                  if(!machinesMap[machineValue[0]]){//沒機台就建
                    machinesMap[machineValue[0]] = {};
                  }
                  if(!machinesMap[machineValue[0]][gCode]){//機台沒gCode就建
                    machinesMap[machineValue[0]][gCode] = []
                  }
                  machinesMap[machineValue[0]]["info"] = {"boxId":boxId, "date": new Date()};
                  machinesMap[machineValue[0]][gCode].push(machineValue[1]);//將數值放入陣列中
                });
              });
            });
          });*/
          //console.log(machinesMap);
          return machinesMap
        }

        //按鈕綁定監控頁面(info)
        function bindTarget2Monitor() {
          var lang = getCookie('lang')
          console.log(lang)
          var url = '#app/EquipMonitor/function/' + lang + '/01_info_anko.html'
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
                    encodeCncBrand +
                    '&preAppId=EquipMonitor&prePage=02_plant_area_monitor_anko'
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

        function getCookie(cname) {
          var name = cname + '='
          var ca = document.cookie.split(';')
          for (var i = 0; i < ca.length; i++) {
            var c = ca[i]
            while (c.charAt(0) == ' ') c = c.substring(1)
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
          }
          return ''
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
          var setupDataTable = function () {
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

          servkit.requireJs(
            [
              '/js/plugin/datatables/jquery.dataTables.min.js',
              '/js/plugin/datatables/dataTables.colVis.min.js',
              '/js/plugin/datatables/dataTables.tableTools.min.js',
              '/js/plugin/datatables/dataTables.bootstrap.min.js',
              '/js/plugin/datatable-responsive/datatables.responsive.min.js',
            ],
            setupDataTable
          )
        }

        plant()
      })()
    },
    util: {},
    delayCondition: ['machineList'],
    dependencies: [
      /*[
      "/js/plugin/datatables/jquery.dataTables.min.js",
      "/js/plugin/datatables/dataTables.colVis.min.js",
      "/js/plugin/datatables/dataTables.tableTools.min.js",
      "/js/plugin/datatables/dataTables.bootstrap.min.js",
      "/js/plugin/datatable-responsive/datatables.responsive.min.js"
      ],
      [
      "/js/plugin/jquery-validate/jquery.validate.min.js",
      "/js/plugin/masked-input/jquery.maskedinput.min.js"
      ]*/
    ],
  })
}
