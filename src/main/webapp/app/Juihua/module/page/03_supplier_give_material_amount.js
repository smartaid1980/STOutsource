export default function () {
  ;(function () {
    var tabIdPrefix = 'juihua-supplier-input-',
      $tableTabHeader = $('#table-header'),
      $tableBody = $('#table-body'),
      tableBodyHtml = $tableBody.html(),
      datatables

    // 內容已經記下來了可以砍掉了，查到後會動態長 tab
    ;(function () {
      $tableBody.html('')
    })()

    function padThree(num) {
      var s = num + ''
      while (s.length < 3) s = '0' + s
      return s
    }

    function tabsTitleHtml(tabsTitle) {
      return (
        '<ul class="nav nav-tabs pull-left in">' +
        _.map(tabsTitle, function (tabTitle, i) {
          return (
            '<li' +
            (i === 0 ? ' class="active"' : '') +
            '>' +
            '<a data-toggle="tab" href="#' +
            tabIdPrefix +
            (i + 1) +
            '"> ' +
            '<i class="fa fa-lg fa-file-text-o"></i> ' +
            '<span class="hidden-mobile hidden-tablet">' +
            tabTitle +
            '</span>' +
            '</a>' +
            '</li>'
          )
        }).join('') +
        '</ul>'
      )
    }

    function tabsContentHtml(count, tabContentBodyHtml) {
      return (
        '<div class="tab-content">' +
        _.map(_.range(count), function (count, i) {
          return (
            '<div class="tab-pane' +
            (i === 0 ? ' active' : '') +
            '" id="' +
            tabIdPrefix +
            (i + 1) +
            '">' +
            tabContentBodyHtml +
            '</div>'
          )
        }).join('') +
        '</div>'
      )
    }

    function queryByOrderIdThenDo(onData) {
      var orderId = $('#order-id').val(), // 前8碼是日期，之後是供應商
        date =
          orderId.substring(0, 4) +
          '/' +
          orderId.substring(4, 6) +
          '/' +
          orderId.substring(6, 8),
        supplier = orderId.substring(8),
        multiResult = {}

      // 非供應商帳號，擋！
      if (sessionStorage) {
        if (
          supplier !== JSON.parse(sessionStorage.getItem('loginInfo')).user_id
        ) {
          onData({})
          return
        }
      } else {
        return
      }

      var queryParams = {
        receiveBatch: {
          url: 'api/getdata/file',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            type: 'juihua_order_receive_batch',
            pathPattern: '{supplier}/{YYYY}/{MM}/{YYYY}{MM}{DD}{sequence}.csv',
            pathParam: {
              supplier: [supplier],
              sequence: _.map(_.range(1, 101), padThree),
            },
            startDate: date,
            endDate: date,
          }),
        },
        actualAmount: {
          url: 'api/getdata/file',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            type: 'juihua_order_actual_amount',
            pathPattern: '{supplier}/{YYYY}/{MM}/{YYYY}{MM}{DD}{sequence}.csv',
            pathParam: {
              supplier: [supplier],
              sequence: _.map(_.range(1, 101), padThree),
            },
            startDate: date,
            endDate: date,
          }),
        },
      }

      _.each(queryParams, function (param, key) {
        servkit.ajax(param, {
          success: function (data) {
            multiResult[key] = data
          },
        })
      })

      servkit
        .politeCheck('juihua-editable-report')
        .until(function () {
          for (var key in queryParams) {
            if (!multiResult[key]) return false
          }
          return true
        })
        .thenDo(function () {
          var data = mergeData(
            multiResult.receiveBatch,
            multiResult.actualAmount
          )
          onData(data)
        })
        .tryDuration(10)
        .start()
    }

    function mergeData(receiveBatch, actualAmount) {
      var result = {}
      var actualAmountIndex = 0
      _.each(receiveBatch, function (eachStaticData) {
        var receiveMaterialId = eachStaticData[0]

        if (!result[receiveMaterialId]) {
          result[receiveMaterialId] = []
        }

        if (
          eachStaticData[0] === actualAmount[actualAmountIndex][0] &&
          eachStaticData[1] === actualAmount[actualAmountIndex][1]
        ) {
          result[receiveMaterialId].push(
            eachStaticData.concat([actualAmount[actualAmountIndex][2]])
          )

          actualAmountIndex++
        } else {
          result[receiveMaterialId].push(eachStaticData.concat(['']))
        }
      })

      return result
    }

    function setupReportTable($table) {
      var responsiveHelper = undefined,
        breakpointDefinition = {
          tablet: 1024,
          phone: 480,
        }
      var resultDataTable = $table.DataTable({
        sDom:
          "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r>" +
          't' +
          "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
        autoWidth: true,
        preDrawCallback: function () {
          // Initialize the responsive datatables helper once.
          if (!responsiveHelper) {
            responsiveHelper = new ResponsiveDatatablesHelper(
              $table,
              breakpointDefinition
            )
          }
        },
        rowCallback: function (row, data) {
          responsiveHelper.createExpandIcon(row)
        },
        drawCallback: function (settings) {
          responsiveHelper.respond()
        },
      })

      return resultDataTable
    }

    function afterLoadLibrary() {
      $('#order-query-btn').on('click', function (e) {
        e.preventDefault()

        queryByOrderIdThenDo(function (data) {
          var tabsTitle = _.keys(data).sort()
          var btnHtml =
            '<label class="pull-right" style="height: 32px; margin-bottom: 0px; margin-right: 5px;">' +
            '<span class="btn btn-xs btn-danger edit-btn"><i class="fa fa-edit"></i> 編輯實收數量 </span>' +
            '</label>' +
            '<label class="pull-right" style="height: 32px; margin-bottom: 0px; margin-right: 5px;">' +
            '<span class="btn btn-xs btn-success save-btn hide">儲存</span>' +
            '</label>' +
            '<label class="pull-right" style="height: 32px; margin-bottom: 0px; margin-right: 5px;">' +
            '<span class="btn btn-xs btn-default cancel-btn hide">取消編輯</span>' +
            '</label>'

          $tableTabHeader.html(tabsTitleHtml(tabsTitle) + btnHtml)
          $tableBody.html(tabsContentHtml(tabsTitle.length, tableBodyHtml))

          datatables = []

          _.each(tabsTitle, function (tabTitle, i) {
            var tabPaneId = '#' + tabIdPrefix + (i + 1),
              $tabContentEle = $(tabPaneId).find('>:first-child'),
              datatable = setupReportTable($tabContentEle)

            datatable.rows.add(data[tabTitle]).draw()
            datatables.push(datatable)
          })

          // 編輯按下去
          $('.edit-btn').on('click', function (e) {
            $tableBody
              .find('.table>tbody>tr>td:nth-of-type(5)')
              .each(function (i, td) {
                var $td = $(td),
                  oldValue = td.textContent
                $td.html(
                  '<input class="form-control" value="' + oldValue + '" />'
                )
                $td.find('input')[0]._old_data_ = oldValue
              })
            $('.edit-btn, .save-btn, .cancel-btn').toggleClass('hide')
            $(
              '.dt-toolbar input[type="search"], .dt-toolbar-footer select'
            ).attr('disabled', 'disabled')
            $('.dt-toolbar-footer > div:last-child').css({
              visibility: 'hidden',
            })
          })

          // 取消按下去
          $('.cancel-btn').on('click', function (e) {
            $tableBody
              .find('.table>tbody>tr>td:nth-of-type(5)')
              .each(function (i, td) {
                var $td = $(td)
                $td.html($td.find('input')[0]._old_data_)
              })
            $('.edit-btn, .save-btn, .cancel-btn').toggleClass('hide')
            $(
              '.dt-toolbar input[type="search"], .dt-toolbar-footer select'
            ).removeAttr('disabled')
            $('.dt-toolbar-footer > div:last-child').css({
              visibility: 'visible',
            })
          })

          // 儲存按下去
          $('.save-btn').on('click', function (e) {
            var oldValues = {}
            _.each(datatables, function (datatable) {
              var zippedData = _.zip.apply(
                null,
                datatable.columns([0, 1, 4]).data()
              )
              _.each(zippedData, function (data) {
                var receiveMaterialId = data[0]
                var materialId = data[1]
                var changedActualAmount = data[2]
                if (!oldValues[receiveMaterialId]) {
                  oldValues[receiveMaterialId] = []
                }
                oldValues[receiveMaterialId].push([
                  receiveMaterialId,
                  materialId,
                  changedActualAmount,
                ])
              })
            })

            var newValues = {}
            _.each($tableBody.find('.table'), function (table, i) {
              $(table)
                .find('tbody tr')
                .each(function (i, tr) {
                  var receiveMaterialId = $(tr).find('td:nth-of-type(1)').text()
                  var materialId = $(tr).find('td:nth-of-type(2)').text()
                  var changedActualAmount = $(tr)
                    .find('td:nth-of-type(5) input')
                    .val()
                  if (!newValues[receiveMaterialId]) {
                    newValues[receiveMaterialId] = {}
                  }
                  newValues[receiveMaterialId][materialId] = [
                    receiveMaterialId,
                    materialId,
                    changedActualAmount,
                  ]
                })
            })

            var storeValues = {}
            _.each(oldValues, function (row, key) {
              _.each(row, function (data) {
                var receiveMaterialId = data[0]
                var path =
                  receiveMaterialId.substring(8, receiveMaterialId.length - 3) +
                  '/' +
                  receiveMaterialId.substring(0, 4) +
                  '/' +
                  receiveMaterialId.substring(4, 6) +
                  '/' +
                  receiveMaterialId.substring(0, 8) +
                  receiveMaterialId.substring(receiveMaterialId.length - 3) +
                  '.csv'
                var materialId = data[1]
                var newValue = newValues[receiveMaterialId][materialId]

                if (!storeValues[path]) {
                  storeValues[path] = ''
                }

                if (newValue) {
                  storeValues[path] += newValue.join('|')
                } else {
                  storeValues[path] += data.join('|')
                }
                storeValues[path] += '\n'
              })
            })

            servkit.ajax(
              {
                url: 'api/savedata/juihua_order_actual_amount',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(storeValues),
              },
              {
                success: function (data) {
                  _.each($tableBody.find('.table'), function (
                    table,
                    tableIndex
                  ) {
                    $(table)
                      .find('tbody tr')
                      .each(function (rowIndex, tr) {
                        var datatableRow = datatables[tableIndex].row(tr),
                          data = datatableRow.data()
                        data[4] = $(tr).find('td:nth-of-type(5) input').val()
                        datatableRow.data(data)
                      })
                    datatables[tableIndex].draw()
                  })
                  $('.edit-btn, .save-btn, .cancel-btn').toggleClass('hide')
                  $(
                    '.dt-toolbar input[type="search"], .dt-toolbar-footer select'
                  ).removeAttr('disabled')
                  $('.dt-toolbar-footer > div:last-child').css({
                    visibility: 'visible',
                  })
                },
              }
            )
          })
        })
      })
    }

    servkit.requireJs(
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      afterLoadLibrary
    )
  })()
}
