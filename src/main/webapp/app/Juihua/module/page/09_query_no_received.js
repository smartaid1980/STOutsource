export default function () {
  ;(function () {
    function renderNoReceivedView(data) {
      var result = ''
      _.each(data, function (noReceivedList, orderId) {
        result +=
          '<tr>' +
          '<td>' +
          '<span class="badge bg-color-red">' +
          orderId +
          '</span>' +
          '</td>' +
          '<td>' +
          _.map(noReceivedList, function (noReceived) {
            return (
              '<span class="badge" style="margin:0 10px 10px;float: left;">' +
              noReceived +
              '</span>'
            )
          }).join('') +
          '</td>' +
          '</tr>'
      })

      if (!result) {
        result =
          '<tr>' +
          '<td colspan="2">' +
          '<h2><i class="fa fa-thumbs-o-up"></i> 查無未交料資料</h2>' +
          '</td>' +
          '</tr>'
      }

      $('#result-table tbody').html(result)
    }

    $('#query-date')
      .datepicker({
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      })
      .val(moment().format('YYYY/MM/DD'))

    $('#query-btn').on('click', function (e) {
      e.preventDefault()

      servkit.ajax(
        {
          url: 'api/juihua/deliverOrder/noReceived',
          type: 'GET',
          data: {
            date: $('#query-date').val(),
          },
        },
        {
          success: renderNoReceivedView,
        }
      )
    })
  })()
}
