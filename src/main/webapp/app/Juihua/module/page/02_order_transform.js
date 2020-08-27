export default function () {
  ;(function () {
    var datePattern = /\d{4}\/\d{2}\/\d{2}/

    function renderOrderListView(data) {
      var result = ''
      _.each(data, function (sequenceList, orderId) {
        result +=
          '<tr>' +
          '<td>' +
          '<span class="badge bg-color-red">' +
          orderId +
          '</span>' +
          '</td>' +
          '<td>' +
          _.map(sequenceList, function (sequence) {
            return (
              '<span class="badge" style="margin:0 10px 10px;float: left;">' +
              sequence +
              '</span>'
            )
          }).join('') +
          '</td>' +
          '<td>' +
          '<span class="btn btn-primary btn-sm deliver-id" data-id="' +
          orderId +
          '">' +
          '<i class="fa fa-cloud-download"></i> 下載' +
          '</span>' +
          '</td>' +
          '</tr>'
      })

      if (!result) {
        result =
          '<tr>' +
          '<td colspan="3">' +
          '<h2><i class="fa fa-exclamation txt-color-red"></i> 無採購單</h2>' +
          '</td>' +
          '</tr>'
      }

      $('#download-table tbody').html(result)

      $('.deliver-id').each(function (i, ele) {
        servkit.downloadFile(
          ele,
          '/api/juihua/deliverOrder/downloadOrder',
          function () {
            return {
              orderId: $(ele).attr('data-id'),
            }
          }
        )
      })
    }

    $('#output-order-date')
      .on('change', function (e) {
        var date = $(this).val()
        if (datePattern.test(date)) {
          servkit.ajax(
            {
              url: 'api/juihua/deliverOrder/orderByDate',
              type: 'GET',
              data: {
                date: $('#output-order-date').val(),
              },
            },
            {
              success: renderOrderListView,
            }
          )
        }
      })
      .datepicker({
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      })
      .val(moment().format('YYYY/MM/DD'))
      .trigger('change')

    // transfer-order button function
    $('#translate').on('click', function (e) {
      e.preventDefault()

      servkit.ajax(
        {
          url: 'api/juihua/deliverOrder/translate',
          type: 'POST',
          data: {
            date: $('#output-order-date').val(),
          },
        },
        {
          success: renderOrderListView,
        }
      )
    })
  })()
}
