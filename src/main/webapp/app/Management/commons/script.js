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
            '" style="display:none;" type="text" class="form-control" placeholder="Filter" /></th>'
        )
      } else {
        html.push(
          '<th><input filterkey="' +
            elem.key +
            '" type="text" class="form-control" placeholder="Filter" /></th>'
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

    $table.find('thead th > input[type=text]').on('keyup change', function () {
      $table
        .DataTable()
        .column($(this).parent().index() + ':visible')
        .search(this.value)
        .draw()
    })

    //沒有customDownloadSetting表示沒有要提供下載
    if (!customDownloadSetting) {
      return
    }
    /* 客製化download (sDom需要有custom-download的class) */
    var $customDownload = $($table.selector + '_wrapper').find(
      'div.custom-download'
    )
    var printFileName = customDownloadSetting.fileName
    var printHeadMatrix = customDownloadSetting.headMatrix
    var printColArr = customDownloadSetting.colIndexArr
    var printFormat = customDownloadSetting.excelColFormat

    //增加下載button
    $customDownload.html(
      "<button class='btn btn-default custom-csv'>CSV</button>"
    ) //<button class='btn btn-default custom-excel'>Excel</button><div id='custom-download-form' style='display:none;'></div>");
    /* 進行CSV下載 */
    $customDownload.on('click', '.custom-csv', function () {
      var oriDataMatrix = $table.DataTable().data() //取資料
      var rowIndexArr = $table.DataTable().rows().indexes() //取row順序index

      var dataMatrix = []
      _.each(printHeadMatrix, function (row) {
        //設置header
        dataMatrix.push(row)
      })
      if (oriDataMatrix.length > 0) {
        //datatables裡面要有資料
        _.each(rowIndexArr, function (rowIndex) {
          //根據datatables row index取值
          var tempArr = []
          _.each(printColArr, function (printIndex) {
            //只存要列印的欄位
            //過濾掉html tag和空格
            tempArr.push(
              oriDataMatrix[rowIndex][printIndex]
                .toString()
                .replace(/\n/g, ' ')
                .replace(/<.*?>/g, '')
                .replace(/&nbsp;/g, ' ')
            )
          })
          dataMatrix.push(tempArr)
        })
      }
      //轉成csv的格式
      var csv = ''
      var colSize = printColArr.length
      _.each(dataMatrix, function (row) {
        /*var record = [];
        for(var colIndex=0; colIndex<colSize; colIndex++){
          if(colIndex > 0){
            csv += ",";
          }
          //csv = csv + "\"" + row[colIndex].replace(/\"/g, "\"\"") + "\"";//若資料內有雙引號就做轉義
                    //csv = csv  + row[colIndex].replace(/\"/g, "\"\"");//若資料內有雙引號就做轉義
                    //csv = csv  + row[colIndex];
                    record.push(row[colIndex]);
        }*/
        var matrix = []
        //console.log(row);
        matrix.push(row)
        csv = csv + $.csv.fromArrays(matrix)
        //csv += "\r\n";
      })
      //console.log(csv);
      downloadTxt(printFileName + '.csv', csv)
    })
    /* 進行Excel下載 */
    var hiddenFormId //下載檔案用form
    var $downloadForm = $('#custom-download-form')
    $customDownload.on('click', '.custom-excel', function () {
      var oriDataMatrix = $table.DataTable().data() //取資料
      var rowIndexArr = $table.DataTable().rows().indexes() //取row順序index

      var dataMatrix = []
      if (oriDataMatrix.length > 0) {
        //datatables裡面要有資料
        _.each(rowIndexArr, function (rowIndex) {
          //根據datatables row index取值
          var tempArr = []
          _.each(printColArr, function (printIndex) {
            //只存要列印的欄位
            //過濾掉html tag和空格
            tempArr.push(
              oriDataMatrix[rowIndex][printIndex]
                .toString()
                .replace(/\n/g, ' ')
                .replace(/<.*?>/g, '')
                .replace(/&nbsp;/g, ' ')
            )
          })
          dataMatrix.push(tempArr)
        })
      }
      //使用excel
      //console.log(printHeadMatrix);
      downloadExcel({
        matrix: dataMatrix,
        fileName: printFileName,
        header: printHeadMatrix,
        format: printFormat,
      })
    })

    //download文字檔(csv)
    function downloadTxt(fileName, fileContent) {
      var text = fileContent
      var blob = new Blob([text], { type: 'text/txt' }) //;
      //辨識 ie
      var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
        ie11 =
          navigator.userAgent.match(/Trident\/7.0/) &&
          navigator.userAgent.match(/rv:11/),
        ieEDGE = navigator.userAgent.match(/Edge/g),
        ieVer = ie ? ie[1] : ie11 ? 11 : ieEDGE ? 12 : -1
      //ie版本小於10，送出升級ie訊息
      if (ie && ieVer < 10) {
        console.warn('No blobs on IE ver < 10')
        smallBox({
          selectColor: 'yellow',
          title: 'Please upgrade to version ie 10 or more',
          icon: 'fa fa-warning',
          timeout: 2000,
        })
        return
      }

      //ie 瀏覽器
      if (ieVer > -1) {
        window.navigator.msSaveBlob(blob, fileName)
      } else {
        //其他瀏覽器 (chrome、firefox)
        //***舊版 ie無法使用...
        var myURL = window.URL || window.webkitURL
        var csvUrl = myURL.createObjectURL(blob)

        var link = document.createElement('a')
        link.id = 'lnkDwnldLnk'
        document.body.appendChild(link)

        jQuery('#lnkDwnldLnk').attr({
          download: fileName,
          href: csvUrl,
        })
        jQuery('#lnkDwnldLnk')[0].click()
        document.body.removeChild(link)
      }
    }

    //Excel submit form
    function downloadExcel(params) {
      hiddenFormId && $('#' + hiddenFormId).remove()
      hiddenFormId = 'download-rawdat-form-id-' + new Date().getTime()
      console.log('download excel form id: ' + hiddenFormId)
      var $submitForm = $('<form id="' + hiddenFormId + '"></form>')
      $submitForm.append(
        $('<input>').attr('name', 'data').val(JSON.stringify(params))
      )
      $submitForm.attr({
        action: 'api/datatables/excelDownload',
        method: 'POST',
        target: '_parent',
      })
      $downloadForm.after($submitForm.hide())
      $submitForm.submit()
    }

    //顯示ie更新訊息
    function smallBox(params) {
      //selectColor, title, icon, timeout
      var colors = { green: '#739E73', red: '#C46A69', yellow: '#C79121' }
      $.smallBox({
        title: params.title,
        content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
        color: colors[params.selectColor],
        iconSmall: params.icon,
        timeout: params.timeout,
      })
    }
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

//組出圖片或影片的html
exports.buildMediaHtml = function (filePath, setting) {
  if (!setting) {
    setting = {
      imgWidth: '140px',
      imgHeight: '140px',
      videoWidth: '320px',
      videoHeight: '140px',
      class: '',
    }
  }
  var defaultImg = 'img/custom/140x140.svg'
  var imgStart =
    '<img style="width:' +
    setting.imgWidth +
    '; height:' +
    setting.imgHeight +
    ';" class="' +
    setting.class +
    '" alt="140x140" src="'
  var imgEnd = '">'

  //var videoStart = '<video class="video-js vjs-default-skin" controls preload="none" width="' + setting.videoWidth + '" height="' + setting.videoHeight + '" data-setup="{}"><source src="';
  var videoStart =
    '<video class="video-js vjs-default-skin ' +
    setting.class +
    '" controls preload="none" style="width: ' +
    setting.videoWidth +
    '; height:' +
    setting.videoHeight +
    ';" data-setup="{}"><source src="'
  var videoEnd = '" type="video/mp4"></video>'

  var suffix = '.mp4' //影片

  if (filePath.length == 0) {
    return imgStart + defaultImg + imgEnd
  }
  if (filePath.indexOf(suffix, this.length - suffix.length) !== -1) {
    filePath = videoStart + filePath + videoEnd
  } else {
    //其他當圖片處理^^b
    filePath = imgStart + filePath + imgEnd
  }
  return filePath
}

//dateFormat:
exports.dateFormat = function (data) {
  return moment(new Date(data)).format('YYYY-MM-DD HH:mm:ss')
}

exports.drawChart = function ($chartEle, config) {
  var dataList = config.dataList,
    barValueIndex = config.barValueIndex,
    xAxisLabelValueIndex = config.xAxisLabelValueIndex,
    yAxisLabel = config.yAxisLabel

  if (!dataList || dataList.length === 0) {
    return
  }

  var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
    return {
      data: _.map(dataList, function (row, i) {
        return [i, row[barIndex].percentageToFloat()]
      }),
      bars: {
        align: 'center',
        show: true,
        barWidth: 0.2,
        order: barI + 1,
      },
    }
  })

  $.plot($chartEle, chartDatas, {
    colors: [servkit.colors.green, servkit.colors.blue, servkit.colors.orange],
    grid: {
      show: true,
      hoverable: true,
      clickable: true,
      tickColor: '#EFEFEF',
      borderWidth: 0,
      borderColor: '#EFEFEF',
    },
    xaxis: {
      ticks: function () {
        return _.map(dataList, function (ele, i) {
          var tick = _.map(xAxisLabelValueIndex, function (index) {
            return ele[index]
          }).join('</br>')
          return [i, tick]
        })
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      axisLabel: yAxisLabel,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Open Sans',
    },
    legend: true,
    tooltip: true,
    tooltipOpts: {
      content: "<b style='display:none;'>%x</b><span>%y.2%</span>",
      defaultTheme: false,
    },
  })
}
