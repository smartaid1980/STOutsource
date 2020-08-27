import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')
      var datepickerConfig = {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }
      pageSetUp()
      servkit.initFuncBindMachineSelect(
        $('#machineId'),
        context.appId,
        context.funId
      )
      context.tempalteEngine = createTempalteEngine()
      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))

      context.$uploadReadTable = createReportTable({
        $tableElement: $('#upload-read'),
        customBtns: [],
        rightColumn: [2],
        centerColumn: [3],
        order: [[1, 'desc']],
      })

      context.initDropzone()
      context.$reload_read.click(event, function () {
        event.preventDefault()
        if (context.validateForm()) {
          context.uploadSearch()
          context.$searchTab.click()
        }
      })
      $('#upload-read').on('click', '.main-col', function (event) {
        console.log(event.target) //$(event.target).attr('content')
        let index = $(event.target).attr('content')
        context.showDetail(context.data[index].content)
      })
      // for demo
      context.$startDate.val('2018/07/26')
      $('#machineId').val('_FOXCONNP01D01M006')
      context.$mainProgram.val('O7004')
    },
    util: {
      $delBtn: $('#del-btn'),
      $startDate: $('#start-date'),
      $mainProgram: $('#main-program'),
      $machine: $('#machineId'),
      $selWork: $('#selWork'),
      $delWindows: $('#del_windows'),
      $reload: $('#reload-target'),
      $reload_read: $('#reload-read'),
      $errorDialog: $('<div id="error-dialog" style="margin:10px;"></div>'),
      $fileUploadZone: $('#fileupload-zone'),
      $searchArea: $('#search-area'),
      $uploadArea: $('#upload-area'),
      $uploadTab: $('#upload-tab'),
      $searchTab: $('#search-tab'),
      $uploadReadTable: null,
      fileLength: 0,
      data: [],
      validateForm: function () {
        let context = this
        if (context.$mainProgram.val() === '') {
          context.$mainProgram.parent().addClass('state-error')
          context.errorDialog(
            `${i18n('Main_Program_Time')} ${i18n('Stk_Required')}`
          )
          return false
        } else {
          context.$mainProgram.parent().removeClass('state-error')
          return true
        }
      },
      errorDialog: function (data) {
        $.smallBox({
          title: data,
          content: '<div>&nbsp<div>',
          color: servkit.colors.red,
          icon: 'fa fa-bell swing animated',
        })
      },
      showDetail: function (data) {
        var ctx = this
        ctx.$errorDialog.dialog({
          autoOpen: false,
          maxHeight: 600,
          width: 800,
          overflow: true,
          resizable: false,
          modal: true,
          title: `${i18n('Preview')}`,
          buttons: [
            {
              html: 'Close',
              class: 'btn btn-primary',
              click: function () {
                $(this).dialog('close')
                $(this).html('')
                ctx.firstSuccess = true
              },
            },
          ],
        })
        let result = []
        _.each(data, (val) => {
          result.push(`<span>${val}</span><br>`)
        })
        ctx.$errorDialog.html(result.join(''))
        ctx.$errorDialog.dialog('open')
      },
      initDropzone: function () {
        var context = this
        servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
          var acceptType = '.txt'
          Dropzone.autoDiscover = false
          context.dropzone = context.$fileUploadZone.dropzone({
            url: 'api/shzbg/single/upload',
            addRemoveLinks: true,
            maxFilesize: 20, // MB
            acceptedFiles: acceptType,
            accept: function (file, done) {
              if (
                file.name.match(/\.txt?/) == null ||
                !context.validateForm()
              ) {
                var $fileResult = $(file.previewElement)
                $fileResult.removeClass('dz-success').addClass('dz-error')
              } else {
                done()
                context.fileLength++
              }
            },
            dictResponseError: 'Error uploading file!',
            init: function () {
              this.on('sending', function (file, xhr, data) {
                data.append('main_program', context.$mainProgram.val())
                data.append('machine', context.$machine.val())
                data.append('date_time', context.$startDate.val())
              })
              this.on('success', function (file, res) {
                if (res.data) {
                  var $fileResult = $(file.previewElement)
                  switch (res.data) {
                    case 1:
                      break
                    case 0: //Fail
                      $fileResult.removeClass('dz-success').addClass('dz-error')
                      var errbtn = $(
                        '<center><button style="" class="btn btn-danger upload-error">show error</button></center>'
                      )
                      var msg = $(
                        '<span style="display:none;">' + res + '</span>'
                      )
                      $fileResult.find('.dz-details').after(msg)
                      context.errorDialog(res)
                      break
                    default:
                      $fileResult.removeClass('dz-success').addClass('dz-error')
                      $fileResult
                        .find('.dz-error-message span')
                        .text(res.data)
                        .css('color', '#fff')
                        .parent()
                        .css('background-color', 'rgba(0, 0, 0, 0.8)')
                      break
                  }
                }
                context.$uploadArea
                  .find("[name='date']")
                  .text(context.$startDate.val())
                context.$uploadArea
                  .find("[name='machine']")
                  .text(servkit.getMachineName(context.$machine.val()))
                context.$uploadArea
                  .find("[name='main_program']")
                  .text(context.$mainProgram.val())
              })
              this.on('complete', function (event) {
                if (context.fileLength > 0) context.fileLength--
                if (context.fileLength === 0) {
                  setTimeout(function () {
                    context.$searchTab.click()
                    context.uploadSearch(event.name.replace('.txt', ''))
                  }, 500)
                }
              })
            },
          })
        })
      },
      uploadSearch: function (param) {
        let context = this
        console.log('search')
        servkit.ajax(
          {
            url: 'api/shzbg/single/uploadRead',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              main_program: context.$mainProgram.val(),
              machine: context.$machine.val(),
              date_time: context.$startDate.val(),
            }),
          },
          {
            success: function (data) {
              if (data.length === 0) {
                context.errorDialog(`${i18n('No_Data')}`)
              }
              context.$uploadReadTable.clearTable()
              let result = _.map(data, (val, index) => {
                return [
                  val.name,
                  `${val.content[0] ? val.content[0] : ''}<br>
                ${val.content[1] ? val.content[1] : ''}<br>
                ${val.content[2] ? val.content[2] + '...' : ''}`,
                  val.last_modified,
                  `<div class="main-col btn btn-info" style="marrgin:auto" content="${index}">${i18n(
                    'Preview'
                  )}</div>`,
                ]
              })
              context.data = data
              context.$uploadReadTable.drawTable(result)
              context.$searchArea
                .find("[name='date']")
                .text(context.$startDate.val())
              context.$searchArea
                .find("[name='machine']")
                .text(servkit.getMachineName(context.$machine.val()))
              context.$searchArea
                .find("[name='main_program']")
                .text(context.$mainProgram.val())
              if (param) context.$uploadReadTable.getBlingRow(0, param)
            },
            fail: function (error) {
              context.errorDialog(`${i18n('No_Data')}`)
            },
          }
        )
      },
    },
    dependencies: [
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
  })
}
