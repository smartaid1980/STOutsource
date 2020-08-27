export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      console.log('hi')
      context.series = _.chain(context.preCon.columnInfo)
        .pluck('series')
        .uniq()
        .sort()
        .value()
      context.modelMap = context.preCon.columnInfo.reduce((a, x) => {
        if (Object.prototype.hasOwnProperty.call(a, x.series)) {
          a[x.series][x.model] = JSON.parse(x.content)
          a[x.series].modelList.push(x.model)
        } else {
          a[x.series] = {
            modelList: [x.model],
          }
          a[x.series][x.model] = JSON.parse(x.content)
        }
        return a
      }, {})
      $('#series-select').html(
        context.series.map((m) => `<option value="${m}">${m}</option>`).join('')
      )
      console.log(context.series)
      $('#series-select')
        .on('change', function (e) {
          let series = $(this).val(),
            modelList = context.modelMap[series].modelList
          $('#model-select').html(
            modelList.map((m) => `<option value="${m}">${m}</option>`).join('')
          )
        })
        .change()
      $('#model-select').on('change', function (e) {})
      context.reportTable = createReportTable({
        $tableElement: $('#query-result'),
        showNoData: false,
        // hideCols: [0],
        onRow: function (row, data) {
          console.log(data)
          $(row)
            .find('td')
            .eq(1)
            .html(
              `<span class="label label-${data[1] ? 'success' : 'default'}">${
                data[1] ? '是' : '否'
              }</span>`
            )
          $(row)
            .find('td')
            .eq(2)
            .html(
              _.map(
                data[2],
                (o) => `<span class="label label-primary">${o}</span>`
              )
            )
          // $(row).eq(3).html(`<button class="btn btn-xs btn-primary stk-edit-btn" title="Edit"><i class="fa fa-pencil"></i></button>`)
        },
      })

      $('#submit-btn').on('click', function (e) {
        e.preventDefault()
        context.drawColumnsTable()
      })
      $('#query-result').on('click', '.stk-edit-btn', function () {
        let { series, model, column } = $(this).data(),
          columnInfo = context.modelMap[series][model][column]

        $('#edit-column-form')
          .find('input[name="required"]')
          .prop('checked', columnInfo.required)
        $('#edit-column-form').find('input[name="name"]').val(columnInfo.name)
        $('#edit-column-form').find('.bootstrap-tagsinput input').val('')
        $('#edit-column-form')
          .find('input[name="options"]')
          .tagsinput('removeAll')
        console.log(series, model, column)
        console.log(columnInfo)
        $('#edit-column-form')
          .find('input[name="options"]')
          .tagsinput('add', columnInfo.options.join(','))

        $('#confirm-column-btn').data({
          series,
          model,
          column,
        })
        $('#edit-column-modal-widget').modal('show')
      })
      $('#confirm-column-btn').on('click', function (e) {
        let { series, model, column } = $(this).data(),
          columnInfo,
          required =
            $('#edit-column-form')
              .find('input[name="required"]')
              .prop('checked') + 0,
          name = $('#edit-column-form').find('input[name="name"]').val(),
          options = $('#edit-column-form')
            .find('input[name="options"]')
            .tagsinput('items')
            .slice(0) // 不能參照，不然removeAll時會被刪光

        columnInfo = {
          required,
          name,
          options,
        }

        context.modelMap[series][model][column] = columnInfo

        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.RfqColumns',
              model,
              content: JSON.stringify(context.modelMap[series][model]),
            }),
          },
          {
            success: function (data) {
              console.log(data)
              console.log(series, model, column)
              console.log(
                context.modelMap[series][model][column],
                options,
                columnInfo
              )
              context.drawColumnsTable()
              $('#edit-column-modal-widget').modal('hide')
            },
          }
        )
      })
    },
    util: {
      submitBtn: servkit.loadingButton(document.querySelector('#submit-btn')), // 初始按鈕loading的功能
      detailReportTable: null,
      thisGroup: JSON.parse(window.sessionStorage.getItem('loginInfo'))
        .user_group,
      loginInfo: JSON.parse(window.sessionStorage.getItem('loginInfo')),
      queryCondition: undefined,
      discountHistoryTable: null,
      series: null,
      modelMap: null,
      drawColumnsTable: function () {
        let series = $('#series-select').val(),
          model = $('#model-select').val(),
          tableData = [],
          rowData,
          context = this

        for (var column in _.omit(context.modelMap[series][model], 'order')) {
          rowData = [
            context.commons.rfqColumnI18nMap[column] || column,
            // context.modelMap[series][model][column].name,
            context.modelMap[series][model][column].required,
            context.modelMap[series][model][column].options || [],
            `<button class="btn btn-sm btn-primary stk-edit-btn" title="Edit" data-series="${series}" data-model="${model}" data-column="${column}"><i class="fa fa-pencil"></i></button>`,
          ]
          tableData.push(rowData)
        }

        context.reportTable.drawTable(tableData)
      },
    },
    preCondition: {
      columnInfo: function (done) {
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.RfqColumns',
            },
          },
          {
            success: function (data) {
              done(data)
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
      ['/js/plugin/bootstrap-tags/bootstrap-tagsinput.min.js'],
    ],
  })
}
