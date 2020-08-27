import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      $('[name=line-id]').select2()
      servkit.initSelectWithList(
        context.preCon.getLineData,
        $('[name=line-id]')
      )
      servkit.initDatePicker($('[name=start-date]'), $('[name=end-date]'))
      context.detailReportTable = createReportTable({
        $tableElement: $('#detail-table'),
        $tableWidget: $('#detail-table-widget'),
        rightColumn: [8],
        excel: {
          fileName: '71_record_inefficiency_report',
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
          ],
        },
      })
      context.detailReportTable.table.columns([7, 8]).visible(false)
      $('.dt-toolbar').addClass('hide')

      $('[name=query-type]').on('change', function () {
        if (this.value === 'date')
          $('#date-form>section').find('input, select').attr('disabled', false)
        else
          $('#date-form>section').find('input, select').attr('disabled', true)
      })

      servkit.validateForm($('#query-form'), $('#query-btn'))
      $('#query-btn').on('click', function (evt) {
        evt.preventDefault()
        var clause = ''
        if ($('[name=query-type]:checked').val() === 'date') {
          context.detailReportTable.table.columns([7, 8]).visible(true)
          var start = moment($('[name=start-date]').val()).format('YYYY-MM-DD')
          var end = moment($('[name=end-date]').val()).format('YYYY-MM-DD')
          if ($('[name=line-id]').val())
            clause = `line_id='${$('[name=line-id]').val()}' AND `
          clause += `natural_date BETWEEN '${start}' AND '${end}' GROUP BY line_id, line_status_start`
        } else {
          context.detailReportTable.table.columns([7, 8]).visible(false)
          clause = 'line_status_end IS NULL GROUP BY line_id'
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_view_invalid_line_status_log_detail',
              columns: [
                'natural_date',
                'line_id',
                'invalid_class',
                'process_code',
                'invalid_name',
                'create_by',
                'line_status_start',
                'line_status_end',
              ],
              whereClause: clause,
            }),
          },
          {
            success: function (data) {
              context.detailRenderTable(
                _.map(data, (val) => {
                  var diff = val.line_status_end
                    ? Math.abs(
                        new Date(val.line_status_end) -
                          new Date(val.line_status_start)
                      )
                    : 0
                  return [
                    val.natural_date || '---',
                    val.line_id
                      ? context.preCon.getLineData[val.line_id] || '---'
                      : '---',
                    val.invalid_class !== null
                      ? context.invalidClass[val.invalid_class]
                      : '---',
                    context.preCon.getProcess[val.process_code] || '---',
                    val.invalid_name || '---',
                    val.create_by || '---',
                    val.line_status_start
                      ? moment(val.line_status_start).format(
                          'YYYY/MM/DD HH:mm:ss'
                        )
                      : '---',
                    val.line_status_end
                      ? moment(val.line_status_end).format(
                          'YYYY/MM/DD HH:mm:ss'
                        )
                      : '---',
                    val.line_status_end
                      ? parseFloat(diff / 1000 / 60).toFixed(2)
                      : '---',
                  ]
                })
              )
            },
          }
        )
      })
    },
    util: {
      invalidClass: {
        0: `${i18n('ServTrack_Shared_Category')}`,
        1: `${i18n('ServTrack_Process_Specific')}`,
      },
      detailReportTable: null,
      detailRenderTable: function (data) {
        this.detailReportTable.drawTable(data)
      },
    },
    preCondition: {
      getLineData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_id', 'line_name'],
            }),
          },
          {
            success: function (data) {
              var lineData = {
                '': '',
              }
              _.each(data, (elem) => (lineData[elem.line_id] = elem.line_name))
              done(lineData)
            },
          }
        )
      },
      getProcess: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                if (elem.process_code == 'common_process') {
                  dataMap[elem.process_code] = '---'
                } else {
                  dataMap[elem.process_code] = elem.process_name
                }
              })
              done(dataMap)
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
