export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.sumTable = createReportTable({
        $tableWidget: $('#date-table-widget'),
        $tableElement: $('#date-table'),
        rightColumn: [2, 3, 4, 5, 6, 7, 8],
        order: [[0, 'asc']],
        onRow: function (row, data) {
          var total = Number($(row).find('td').eq(8).text())
          var target = Number($(row).find('td').eq(7).text())
          if (total < target) {
            $(row).find('td').eq(8).css('color', servkit.colors.red)
          }
        },
        excel: {
          fileName: '30_oee',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
          ],
        },
      })

      context.$dateTable.on('click', '[name=dayUse]', function (evt) {
        evt.preventDefault()
        context.gogoAnother({
          appId: 'KuoChuanServTrack',
          funId: '40_device_use',
          currentTab: false,
          graceParam: {
            shift_day: $(this).parent().parent().find('td').eq(1).text(),
            line_id: $(this).attr('value'),
            lineName: $(this).parent().parent().find('td').eq(0).text(),
            oee: $(this).parent().parent().find('td').eq(6).text(),
          },
        })
      })

      servkit.initDatePicker(context.$startDate, context.$endDate, true)
      servkit.initSelectWithList(
        context.preCon.processMap,
        context.$selectProcess
      )
      servkit.initSelectWithList(context.preCon.lineMap, context.$selectLine)
      context.$selectProcess.select2()
      context.$selectLine.select2()
      context.$type.eq(0).click()

      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault() //防止氣泡事件
        context.$submitBtn.click()
      })

      servkit.validateForm($('#main-form'), context.$submitBtn)

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var startDate = context.$startDate.val(),
          endDate = context.$endDate.val(),
          type = $('input[name="type"]:checked').val()
        context.$queryInfo.html(
          context.queryInfoTemplate({
            startDate: startDate,
            endDate: endDate,
            lineName:
              type == 'line'
                ? context.$selectLine.find('option:selected').text()
                : '',
          })
        )
        context.readoee({
          startDate: startDate,
          endDate: endDate,
          line_id: type == 'line' ? context.$selectLine.val() : '',
          process_code: type == 'process' ? context.$selectProcess.val() : '',
        })
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $selectProcess: $('#process'),
      $selectLine: $('#line'),
      $type: $('input[name="type"]'),
      $dateTable: $('#date-table'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#demo-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      $queryInfo: $('.queryInfo'),
      queryInfoTemplate: _.template(
        '    <dl class="dl-horizontal">' +
          ' <dt>班次日期</dt>' +
          ' <dd><%= startDate %> ~ <%= endDate %></dd>' +
          ' <dt>設備</dt>' +
          ' <dd><%= lineName %></dd>' +
          ' <dt>查詢時間</dt>' +
          ' <dd><%- moment().format("YYYY/MM/DD HH:mm:ss") %></dd>' +
          '</dl>'
      ),
      readoee: function (param) {
        var context = this
        context.sumTable.clearTable()
        servkit.ajax(
          {
            url: 'api/kuochuan/servtrack/oee/readoee',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(param),
          },
          {
            success: function (data) {
              context.drawTable(data)
            },
          }
        )
      },
      drawTable: function (datas) {
        var that = this
        var oeeArray = []
        var oeeResultData
        _.map(datas, function (data) {
          var subArray = []
          subArray.push(data.line_name)
          subArray.push(data.shift_day)
          subArray.push(
            data.op_duration == null
              ? '--'
              : parseFloat(data.op_duration / 60).toFixed(2)
          )
          subArray.push(data.output_sp == null ? '--' : data.output_sp)
          subArray.push(data.output == null ? '--' : data.output)
          subArray.push(data.go_quantity == null ? '--' : data.go_quantity)
          subArray.push(
            data.aval == null ? '--' : parseFloat(data.aval).toFixed(2)
          )
          subArray.push(parseFloat(data.oee_sp).toFixed(2))
          subArray.push(
            data.oee == null ? '--' : parseFloat(data.oee).toFixed(2)
          )
          subArray.push(
            '<button class="btn btn-primary" name="dayUse" title="當日利用度" value="' +
              data.line_id +
              '" style="margin-right:5px">當日利用度</button>'
          )
          oeeArray.push(subArray)
        })
        oeeResultData = oeeArray
        that.sumTable.drawTable(oeeResultData)
        that.sumTable.showWidget()
      },
    },
    preCondition: {
      processMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: 'process_code <> ? and is_open = ?',
              whereParams: ['invalid', 'Y'],
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  function (memo, elem) {
                    memo[elem.process_code] = elem.process_name
                    return memo
                  },
                  {}
                )
              )
            },
          }
        )
      },
      lineMap: function (done) {
        servkit.ajax(
          {
            url: 'api/kuochuan/servtrack/line/read',
            type: 'GET',
            data: { line_id: '' },
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  function (memo, elem) {
                    memo[elem.line_id] = elem.line_name
                    return memo
                  },
                  {}
                )
              )
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
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
