export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()

      $.ajax({
        url: 'api/getdata/rawDownloadLastDate',
        type: 'GET',
        context: this,
        success: function (response) {
          $('#detail-info').append(response.data)
        },
      })

      var $startDate = $('input[name="startDate"]'),
        $endDate = $('input[name="endDate"]'),
        $machienSelect = $('select[name=device]'),
        datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        hiddenFormId

      $startDate
        .datepicker(datepickerConfig)
        .val(new Date().toISOString().slice(0, 10).replace(/-/g, '/'))

      $endDate
        .datepicker(datepickerConfig)
        .val(new Date().toISOString().slice(0, 10).replace(/-/g, '/'))

      var machineSelectHtml = ''
      servkit.eachMachine(function (id, name) {
        machineSelectHtml +=
          '<option style="padding:3px 0 3px 3px;" value="' +
          id +
          '">' +
          name +
          '</option>'
      })
      $machienSelect.append(machineSelectHtml)
      servkit.multiselectHeightOptimization($machienSelect[0])
      $machienSelect
        .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
        .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)

      $('#send-btn').on('click', function (e) {
        e.preventDefault()

        var enddt = moment($endDate.val(), 'YYYY/MM/DD')
        var startdt = moment($startDate.val(), 'YYYY/MM/DD')
        var diffDays = enddt.diff(startdt, 'days')

        if (diffDays > 7) {
          alert('date range over 7 days!!')
        } else {
          // use context to avoid success function use fail 'this'

          $.ajax({
            url: 'api/getdata/rawDownloadAllow',
            type: 'GET',
            context: this,
            data: {
              startDate: $startDate.val(),
              endDate: $endDate.val(),
            },
            success: function (response) {
              console.log(response)

              if (response.type == 0) {
                hiddenFormId && $('#' + hiddenFormId).remove()
                hiddenFormId =
                  'download-rawdat-form-id-' +
                  moment().format('YYYYMMDDHHmmssSSSS')

                var $submitForm = $('<form id="' + hiddenFormId + '"></form>'),
                  iframeHtml =
                    '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
                $submitForm.append(
                  $('<input>').attr('name', 'startDate').val($startDate.val())
                )
                $submitForm.append(
                  $('<input>').attr('name', 'endDate').val($endDate.val())
                )
                _.each($machienSelect.val(), function (machine) {
                  $submitForm.append(
                    $('<input>').attr('name', 'machines').val(machine)
                  )
                })
                $submitForm.attr({
                  action: 'api/getdata/rawDownloadBeforeDate',
                  method: 'get',
                  target: 'download_target',
                })
                $(this).after($submitForm.hide())
                $submitForm.append(iframeHtml)

                document.querySelector('#' + hiddenFormId).submit()
              } else {
                alert(response.data)
              }
            },
          })
        }
      })
    },
  })
}
