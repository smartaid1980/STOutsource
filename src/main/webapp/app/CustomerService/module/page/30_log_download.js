export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.init()

      var logTable = createReportTable({
        $tableWidget: $('#result-widget'),
        $tableElement: $('#table'),
        leftColumn: [0],
        rightColumn: [1],
        onRow: function (row, data) {},
        onDraw: function (tableData, pageData) {},
      })

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var params = {
          startDate: context.$startDate.val(),
          endDate: context.$endDate.val(),
          platformId: context.$plant.val(),
        }
        context.drawTable(params, logTable)
      })

      context.$table.on('click', '.download-log', function (e) {
        var fileName = this.id
        var $submitForm = $('<form name="' + fileName + '"></form>'),
          iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
        $submitForm.append($('<input>').attr('name', 'fileName').val(fileName))
        $submitForm.attr({
          action: 'api/customerservice/logdownload/download',
          method: 'get',
          target: 'download_target',
        })

        $(this).after($submitForm.hide())
        $submitForm.append(iframeHtml)
        document.querySelector('[name="' + fileName + '"]').submit()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $plant: $('#plant'),
      $submitBtn: $('#submit-btn'),
      $table: $('#table'),
      $tableWidget: $('#result-widget'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      init: function () {
        var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        }
        this.$startDate
          .datepicker(datepickerConfig)
          .val(moment(new Date()).format('YYYY/MM/DD'))
        this.$endDate
          .datepicker(datepickerConfig)
          .val(moment(new Date()).format('YYYY/MM/DD'))
        this.initPlantSelect()
      },
      initPlantSelect: function () {
        var context = this
        servkit.ajax(
          {
            url: 'api/customerservice/logdownload/getplants',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var plantSelectHtml
              _.each(data, function (plant) {
                plantSelectHtml +=
                  '<option style="padding:3px 0 3px 3px;" value="' +
                  plant +
                  '" selected>' +
                  plant +
                  '</option>'
              })
              context.$plant.append(plantSelectHtml)
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      drawTable: function (params, table) {
        var context = this
        table.clearTable()
        context.loadingBtn.doing()
        try {
          servkit.ajax(
            {
              url: 'api/customerservice/logdownload/getlogs',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var result = _.map(data, function (obj) {
                  return [
                    obj.fileName,
                    obj.fileSize,
                    obj.lastModify,
                    '<button class="btn btn-primary download-log" id="' +
                      obj.fileName +
                      '"><span class="glyphicon glyphicon-download-alt"></span>Download</button>',
                  ]
                })
                console.log(result)
                table.drawTable(result)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        } catch (e) {
          console.warn(e)
        } finally {
          context.loadingBtn.done()
        }
      },
    },
    // delayCondition: ['machineList'],
    preCondition: {},
    dependencies: [
      // [
      //   "/js/plugin/flot/jquery.flot.cust.min.js",
      //   "/js/plugin/flot/jquery.flot.resize.min.js",
      //   "/js/plugin/flot/jquery.flot.fillbetween.min.js",
      //   "/js/plugin/flot/jquery.flot.pie.min.js",
      //   "/js/plugin/flot/jquery.flot.tooltip.min.js",
      //   "/js/plugin/flot/jquery.flot.axislabels.js"
      // ],
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
