'use strict'

//使用BasePlatform長crud table的方式
exports.custDatatables = function (config) {
  var $table = config.selector
  var headColumns = config.headColumns
  var options = config.options
  var complexHeaderHtml = config.complexHeaderHtml
  var customDownloadSetting = config.customDownload
  /***************** render table html ******************/
  var html = []
  html.push('<thead>')
  var hasFilterCol = false
  _.each(headColumns, function (elem) {
    //看是否要增加filter column
    if (elem.notFilterCol) {
      hasFilterCol = true
    }
  })
  if (hasFilterCol) {
    html.push('<tr>')
    _.each(headColumns, function (elem) {
      //在header上加上一列 filter column
      if (elem.notFilterCol) {
        html.push(
          '<th><input filterkey="' +
            elem.key +
            '" style="display:none;" type="text" class="form-control"  /></th>'
        )
      } else {
        html.push(
          '<th><input filterkey="' +
            elem.key +
            '" type="text" class="form-control"  /></th>'
        )
      }
    })
    html.push('</tr>')
  }
  if (complexHeaderHtml) {
    //filter和真正的header中間加入客製化的複雜header (為了讓header多層)
    html.push(complexHeaderHtml)
  }
  html.push('<tr>')
  _.each(headColumns, function (elem) {
    var temp = '<th'
    temp = temp + " key='" + elem.key + "' "
    temp = elem.notData
      ? temp + " not-data='" + elem.notData + "' "
      : temp + " not-data='false'"
    temp = elem.dataHide ? temp + " data-hide='" + elem.dataHide + "'" : temp
    temp = elem.custAttr ? temp + ' ' + elem.custAttr + ' ' : temp //自訂義attr
    temp = elem.tooltip
      ? temp +
        " data-placement='top' data-original-title='" +
        elem.tooltip +
        " '> <i class='fa fa-question-circle'></i> &nbsp;"
      : temp + '>'
    html.push(temp + elem.name + '</th>')
  })
  html.push('</tr></thead><tbody></tbody>')

  $table.html(html.join(''))
  /***************** render datatable ******************/
  function setupDataTable() {
    var responsiveHelper,
      breakpointDefinition = {
        tablet: 1024,
        phone: 480,
      }
    $table.dataTable().fnDestroy() //清掉舊的
    $table.DataTable(
      $.extend(
        {},
        {
          sDom:
            options.sDom ||
            't' +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
          //          autoWidth: false,
          headerCallback: function headerCallback(
            thead,
            data,
            start,
            end,
            display
          ) {
            $(thead).find('th').removeClass('sorting_asc')
          },
          preDrawCallback: function preDrawCallback() {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper) {
              responsiveHelper = new ResponsiveDatatablesHelper(
                $table,
                breakpointDefinition
              )
            }
          },
          rowCallback: function rowCallback(nRow) {
            responsiveHelper.createExpandIcon(nRow)
          },
          drawCallback: function drawCallback(oSettings) {
            responsiveHelper.respond()
            $table.find('th').tooltip({
              container: 'body',
            })
          },
        },
        options
      )
    )

    $table.find('thead th > input[type=text]').on('keyup change', function () {
      $table
        .DataTable()
        .column($(this).parent().index() + ':visible')
        .search(this.value)
        .draw()
    })
  }
  setupDataTable()
}

//顯示query後的結果
exports.smallBox = function (params) {
  var colors = { green: '#739E73', red: '#C46A69', yellow: '#C79121' }
  $.smallBox({
    title: params.title,
    content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
    color: colors[params.selectColor],
    iconSmall: params.icon,
    timeout: params.timeout,
  })
}

//檢查資料: 若json中找不到的話，就補""
exports.check = function (data) {
  if (data == undefined) {
    return '' //補空字串，避免datatable因欄位不足而報錯
  } else {
    return data
  }
}

//dateFormat:
exports.dateFormat = function (data) {
  return moment(new Date(data)).format('YYYY-MM-DD HH:mm:ss')
}
