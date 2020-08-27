import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  pageSetUp()

  //初始化查詢列表
  ;(function () {
    var $detailDialog = $('#dialog-detail')

    var $startDate = $('#start-date')
    var $endDate = $('#end-date')
    var $selectDevice = $('#select-device')
    var $selectTool = $('#select-tool')
    var $submitBtn = $('#submit-btn')

    var $toolTableTag = $('#toolTable')
    var $toolDetailTableTag = $('#detailTable')

    var $toolChar = $('#bar-chart-tool')
    var $detailChar = $('#bar-chart-detail')

    var toolTable
    var toolDetailTable

    var renderToolTable
    var renderToolDetailTable

    //畫圖用設定
    var chartOption = {
      colors: ['#6595B4', '#7E9D3A'],
      grid: {
        show: true,
        hoverable: true,
        clickable: true,
        tickColor: '#EFEFEF',
        borderWidth: 0,
        borderColor: '#EFEFEF',
      },
      series: {
        bars: {
          show: true,
          barWidth: 0.5,
          align: 'center',
        },
      },
      xaxis: {
        //ticks:ticks,
        axisLabel: 'Sequence',
        axisLabelFontSizePixels: 14,
        axisLabelFontFamily: 'Open Sans',
        axisLabelPadding: 30,
      },
      yaxis: {
        min: 0,
        axisLabel: 'Minutes',
        axisLabelFontSizePixels: 14,
        axisLabelFontFamily: 'Open Sans',
        axisLabelPadding: 30,
      },
      legend: true,
      tooltip: true,
      tooltipOpts: {
        content: '%y',
        defaultTheme: false,
      },
    }

    //畫tool
    var drawToolChart = function (data) {
      var data1 = []
      var ticks = new Array()
      var ds = new Array()

      $.each(data, function (i) {
        data1.push([i, this[2] * 1])
        var temp = this[0]
        ticks.push([i, temp])
      })

      ds.push({
        data: data1,
        bars: {
          show: true,
          barWidth: 0.5,
          order: 1,
        },
      })
      var newChartOption = $.extend(true, {}, chartOption)
      newChartOption.xaxis.ticks = ticks
      //Display graph
      $.plot($toolChar, ds, newChartOption)
    }

    //畫tool detail
    var drawToolDetailChart = function (data) {
      var data1 = []
      var ticks = new Array()
      var ds = new Array()

      $.each(data, function (i) {
        data1.push([i, this[5] * 1])
        var temp = this[0]
        ticks.push([i, temp])
      })

      ds.push({
        data: data1,
        bars: {
          show: true,
          barWidth: 0.5,
          order: 1,
        },
      })

      var newChartOption = $.extend(true, {}, chartOption)
      newChartOption.xaxis.ticks = ticks
      //Display graph
      $.plot($detailChar, ds, newChartOption)
    }

    //初始化日期
    var initDate = function ($startDate, $endDate) {
      var html = {
          faGear: '<i class="fa fa-gear fa-2x fa-spin"></i>',
          faChevronLeft: '<i class="fa fa-chevron-left"></i>',
          faChevronRight: '<i class="fa fa-chevron-right"></i>',
        },
        excludeDataPathNames = ['startDate', 'endDate', 'dataName'],
        todayStr = function () {
          return new Date().toISOString().slice(0, 10).replace(/-/g, '/')
        }
      $startDate
        .datepicker({
          changeMonth: $startDate.attr('datepicker-format') === 'yy/mm',
          dateFormat: $startDate.attr('datepicker-format'),
          prevText: html.faChevronLeft,
          nextText: html.faChevronRight,
        })
        .val(todayStr())
      $endDate
        .datepicker({
          changeMonth: $startDate.attr('datepicker-format') === 'yy/mm',
          dateFormat: $endDate.attr('datepicker-format'),
          prevText: html.faChevronLeft,
          nextText: html.faChevronRight,
        })
        .val(todayStr())
    }
    //初始化機台
    var initDevices = function ($selectDevice, $selectTool) {
      var selectValue = $selectDevice.attr('stk-getdata-column-value'),
        selectText = $selectDevice.attr('stk-getdata-column-text')
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: $selectDevice.attr('stk-getdata-name'),
            columns: [selectValue, selectText],
          }),
        },
        function (data) {
          $selectDevice.append(
            _.map(data, function (row) {
              return (
                "<option style='padding:3px 0 3px 3px;' value='" +
                row[selectValue] +
                "'>" +
                row[selectText] +
                '</option>'
              )
            })
          )
          initToolNumber($selectDevice, $selectTool)
        }
      )
    }

    initDate($startDate, $endDate)

    //初始化第一台機台的刀具
    var initToolNumber = function ($selectDevice, $selectTool) {
      var deviceId = $selectDevice.find(':selected').val()
      //console.log(deviceId);
      updateToolNumber(deviceId, $selectTool, $startDate.val(), $endDate.val())
    }

    initDevices($selectDevice, $selectTool)
    //換機台時觸發換刀列表
    $selectDevice.on('change', function () {
      var deviceId = $selectDevice.find(':selected').val()
      updateToolNumber(deviceId, $selectTool)
    })

    //送出查詢
    $submitBtn.on('click', function () {
      var paramMap = {
        startDate: $startDate.val(),
        endDate: $endDate.val(),
        selectDevice: $selectDevice.val(),
        selectTool: $selectTool.val(),
      }
      updateToolResult(paramMap, toolDataTables)
      return false
    })

    $('#showdemo').on('click', function (e) {
      e.preventDefault()
      $startDate.val('2015/05/01')
      $endDate.val('2015/05/28')
      $selectDevice.val('Machine01')
      updateToolNumber('Machine01', $selectTool, function () {
        $selectTool.val('22')
        $submitBtn.click()
      })
    })

    var toolrecords = []

    //取toolNumber file
    function updateToolNumber(deviceId, $selectTool, callback) {
      toolrecords = []

      hippo
        .newSimpleExhaler()
        .space('tool_used')
        .index('machine_id', servkit.getMachineList())
        .indexRange('date', $startDate.val(), $endDate.val())
        .columns('timestamp', 'tool', 'cutting_milli_second')
        .exhale(function (data) {
          console.log(data)

          $selectTool.html('')
          //console.log(data);
          $selectTool.append(
            _.map(data.exhalable, function (elm) {
              //console.log(row);
              return (
                "<option style='padding:3px 0 3px 3px;' value='" +
                elm.tool +
                "'>" +
                elm.tool +
                '</option>'
              )
            })
          )
          if (callback && typeof callback == 'function') {
            callback()
          }
        })

      /*
    servkit.ajax({
      url: 'api/getdata/file',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        type: "tool_used/tool_number",
        pathPattern: "{device}",
        pathParam: {device: [deviceId]}
      })
    }, {
      success: function (data) {
        $selectTool.html("");
        //console.log(data);
        $selectTool.append(_.map(data, function (row) {
          //console.log(row);
          return "<option style='padding:3px 0 3px 3px;' value='" + row[0] + "'>" + row[0] + "</option>";
        }));
        if (callback && typeof callback == "function"){
          callback();
        }
      }
    });*/
    }

    //get result file
    function updateToolResult(paramMap, callback) {
      //console.log(paramMap);

      if (paramMap.selectTool == null) {
        console.log('not select tool')
        return
      }

      servkit.ajax(
        {
          url: 'api/getdata/file',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            type: 'tool_used/result',
            pathPattern: '{device}/{YYYY}/{MM}/{YYYY}{MM}{DD}.csv',
            pathParam: { device: [paramMap.selectDevice] },
            //startDate: '2015/05/01',
            startDate: paramMap.startDate,
            endDate: paramMap.endDate,
          }),
        },
        {
          success: function (data) {
            //console.log(data);
            var selectToolFileArr = []
            $.each(data, function (row) {
              //console.log(this);
              if (this[0] == paramMap.selectTool) {
                //console.log(this);
                selectToolFileArr.push(this)
                //return false;
              }
            })
            callback(selectToolFileArr, paramMap)
          },
        }
      )
    }

    //初始化talbe
    var initToolDatatables = function () {
      //初始化tool table
      var responsiveHelper = undefined,
        breakpointDefinition = {
          tablet: 1024,
          phone: 480,
        }

      toolTable = $toolTableTag.DataTable({
        sDom:
          "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r>" +
          't' +
          "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
        autoWidth: true,
        preDrawCallback: function () {
          // Initialize the responsive datatables helper once.
          if (!responsiveHelper) {
            responsiveHelper = new ResponsiveDatatablesHelper(
              $toolTableTag,
              breakpointDefinition
            )
          }
        },
        rowCallback: function (row, data) {
          responsiveHelper.createExpandIcon(row)
          // 顯示格式調整
          _.each(row.querySelectorAll('td'), function (ele, i) {
            ele.style.textAlign = 'right'
            //ele.textContent = value.toFixed(matchResult[1].length) + "%";
            //console.log(i);
            if (i == 3) {
              var value = ele.textContent
              ele.style.textAlign = 'center'
              ele.innerHTML =
                '<button id="' +
                value +
                `" class="btn btn-success theToolDetail">${i18n(
                  'Details'
                )}</button>`
              //console.log(value);
              //console.log(ele);
            }
          })
        },
        drawCallback: function (settings) {
          responsiveHelper.respond()
          var datas = this.api().rows({ page: 'current' }).data()
          //drawToolChart = configObj.drawChart;
          // 畫畫
          if (drawToolChart && datas.length) {
            drawToolChart(datas)
          }
        },
        footerCallback: function (row, data, start, end, display) {
          var htmlStr
          var api = this.api()
          var recordSize = api.column(2).data().length
          if (recordSize > 0) {
            var total = api
              .column(2)
              .data()
              .reduce(function (a, b) {
                return parseFloat(a) + parseFloat(b)
              })
            total = Math.round(total * 100) / 100
            htmlStr =
              'total: ' +
              total +
              ', days:' +
              recordSize +
              ', avg: ' +
              Math.round((total / recordSize) * 100) / 100
          } else {
            htmlStr = 'total: 0, days: 0, avg: 0'
          }

          var thisHtml =
            '<table class="table table-bordered table-striped" style="clear: both">' +
            '<tbody>' +
            '<tr>' +
            '<td style="width:40%;"></td>' +
            `<td align="center" style="width:10%;"><font style="font-weight:900" size="2">${i18n(
              'Total_Minutes'
            )}</font></td>` +
            '<td align="right" style="width:10%"><font color="green" style="font-weight:900" size="2">' +
            total +
            '</font></td>' +
            `<td align="center" style="width:10%"><font style="font-weight:900" size="2">${i18n(
              'Number_Of_Tool_Changes'
            )}</font></td>` +
            '<td align="right" style="width:10%"><font color="green" style="font-weight:900" size="2">' +
            recordSize +
            '</font></td>' +
            `<td align="center" style="width:10%"><font style="font-weight:900" size="2">${i18n(
              'Total_Average_Minutes'
            )}</font></td>` +
            '<td align="right" style="width:10%"><font color="green" style="font-weight:900" size="2">' +
            Math.round((total / recordSize) * 100) / 100 +
            '</font></td>' +
            '</tr>' +
            '</tbody>' +
            '</table>'
          $('#total-avg-footer').html(thisHtml)
        },
      })

      renderToolTable = function (data) {
        if (data.length > 0) {
          $('.jarviswidget-ctrls .fa-plus').click() // 不先把縮起來的 widget 打開無法繪圖...
          toolTable.clear().rows.add(data).draw()
        } else {
          $('#dialog-no-data').dialog('open')
        }
      }

      //過濾欄位事件綁定
      $toolTableTag
        .find('thead th > input[type=text]')
        .on('keyup change', function () {
          toolTable
            .column($(this).parent().index() + ':visible')
            .search(this.value)
            .draw()
        })

      // excel 下載按鈕
      $toolTableTag
        .prev()
        .prepend(
          "<div class='col-xs-12 col-sm-6'>" +
            "<button class='btn btn-success stk-excel-btn' title='Download data as excel' style='margin-right:5px'><span class='fa fa-file-excel-o fa-lg'></span></button>" +
            '</div>'
        )

      ////////////////////////////////////////////////////////////////////////
      //初始化tool detail table
      var detailResponsiveHelper = undefined

      toolDetailTable = $toolDetailTableTag.DataTable({
        sDom:
          "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r>" +
          't' +
          "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
        autoWidth: true,
        preDrawCallback: function () {
          // Initialize the responsive datatables helper once.
          if (!detailResponsiveHelper) {
            detailResponsiveHelper = new ResponsiveDatatablesHelper(
              $('#detailTable'),
              breakpointDefinition
            )
          }
        },
        rowCallback: function (row, data) {
          detailResponsiveHelper.createExpandIcon(row)
          // 顯示格式調整
          _.each(row.querySelectorAll('td'), function (ele, i) {
            ele.style.textAlign = 'right'
            //ele.textContent = value.toFixed(matchResult[1].length) + "%";
          })
        },
        drawCallback: function (settings) {
          detailResponsiveHelper.respond()
          var datas = this.api().rows({ page: 'current' }).data()
          //drawToolDetailChart = configObj.drawChart;
          // 畫畫
          if (drawToolDetailChart && datas.length) {
            drawToolDetailChart(datas)
          }
        },
      })
      renderToolDetailTable = function (data) {
        if (data.length > 0) {
          $('.jarviswidget-ctrls .fa-plus').click() // 不先把縮起來的 widget 打開無法繪圖...
          toolDetailTable.clear().rows.add(data).draw()
        } else {
          $('#dialog-no-data').dialog('open')
        }
      }
      //過濾欄位事件綁定
      $('#detailTable')
        .find('thead th > input[type=text]')
        .on('keyup change', function () {
          toolDetailTable
            .column($(this).parent().index() + ':visible')
            .search(this.value)
            .draw()
        })

      // excel 下載按鈕
      $toolDetailTableTag
        .prev()
        .prepend(
          "<div class='col-xs-12 col-sm-6'>" +
            "<button class='btn btn-success stk-excel-btn' title='Download data as excel' style='margin-right:5px'><span class='fa fa-file-excel-o fa-lg'></span></button>" +
            '</div>'
        )

      $('.stk-excel-btn').on('click', function () {
        //TODO 目前無法下載EXCEL
      })
    }

    //顯示table 資料
    function toolDataTables(dataArr, paramMap) {
      //console.log(paramMap);
      var showDatas = []
      $.each(dataArr, function (index) {
        var newArr = []
        newArr.push(index + 1) //編號
        newArr.push(str2DateFormat(this[1])) //換刀時間
        newArr.push((parseInt(this[2]) / 1000 / 60).toFixed(2)) //刀具加工總時間(分)
        newArr.push(buildDetailFilePath(paramMap.selectDevice, this[1])) //詳細資訊 (檔案路徑)
        showDatas.push(newArr)
      })
      //tool_used/result/1LA01/2015/03/detail;20150312111248.csv
      //console.log(showDatas);
      //initToolDatatables(showDatas);
      renderToolTable(showDatas)
    }

    //顯示detail table 資料
    function toolDetailDataTables(dataArr) {
      var showDatas = []
      $.each(dataArr, function (index) {
        var newArr = []
        newArr.push(index + 1) //加工次數
        newArr.push(this[1]) //加工程式
        newArr.push(this[5]) //產品編號
        newArr.push(this[6]) //"製令號碼"
        newArr.push(str2DateFormat(this[0])) //"加工開始時間"
        newArr.push((parseInt(this[4]) / 1000 / 60).toFixed(2)) //"刀具加工時間(分)"
        showDatas.push(newArr)
      })
      renderToolDetailTable(showDatas)
      openDialog()
    }

    //組合日期
    function str2DateFormat(dateStr) {
      return (
        dateStr.substring(0, 4) +
        '/' +
        dateStr.substring(4, 6) +
        '/' +
        dateStr.substring(6, 8) +
        ' ' +
        dateStr.substring(8, 10) +
        ':' +
        dateStr.substring(10, 12) +
        ':' +
        dateStr.substring(12, 14)
      )
    }

    //組合detail檔案
    function buildDetailFilePath(deviceId, date) {
      //tool_used/result/1LA01/2015/03/detail;20150312111248.csv
      return (
        'tool_used/result/' +
        deviceId +
        '/' +
        date.substring(0, 4) +
        '/' +
        date.substring(4, 6) +
        '/detail/' +
        date +
        '.csv'
      )
    }

    //detail datatables
    function detailDatatables(detailFilePath) {
      //detailFilePath: "tool_used/result/C150507139B01M01/2015/07/detail/20150720222739830.csv"
      servkit.ajax(
        {
          url: 'api/getdata/file',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            type: detailFilePath,
            pathPattern: '',
          }),
        },
        {
          success: function (data) {
            //$.each(data, function(row){
            //  console.log(this);
            //});
            toolDetailDataTables(data)
          },
        }
      )
    }

    function openDialog() {
      $detailDialog.dialog({
        autoOpen: false,
        width: '80%',
        modal: true,
        title: `${i18n('Details')}`,
        buttons: [
          {
            html: `<i class='fa fa-times'></i>&nbsp; ${i18n('Close')}`,
            class: 'btn btn-primary',
            click: function () {
              $(this).dialog('close')
            },
          },
        ],
      })
      $detailDialog.dialog('open')
    }

    $(document).on('click', '.theToolDetail', function () {
      var detailToolId = $(this).attr('id')
      //alert(detailToolId);
      detailDatatables(detailToolId)
    })

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

    servkit.requireJsAsync(
      [
        [
          '/js/plugin/flot/jquery.flot.cust.min.js',
          '/js/plugin/flot/jquery.flot.resize.min.js',
          '/js/plugin/flot/jquery.flot.fillbetween.min.js',
          '/js/plugin/flot/jquery.flot.orderBar.min.js',
          '/js/plugin/flot/jquery.flot.pie.min.js',
          '/js/plugin/flot/jquery.flot.tooltip.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
        ],
        [
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        ],
      ],
      initToolDatatables
    )
  })()
}
