export default function () {
  ;(function () {
    function renderResultTable(orderDeliverIdList) {
      var contentHtml = _.map(orderDeliverIdList, function (id) {
        return (
          '<tr>' +
          '<td class="deliver-id" data-id="' +
          id +
          '">' +
          '<span class="btn btn-primary btn-lg">' +
          '<i class="fa fa-file-text-o"></i> ' +
          id +
          '</span>' +
          '</td>' +
          '</tr>'
        )
      }).join('')

      console.log(contentHtml)

      $('#download-table tbody').html(contentHtml)

      $('.deliver-id').each(function (i, ele) {
        servkit.downloadFile(
          ele,
          '/api/juihua/deliverOrder/downloadDeliverOrder',
          function () {
            return {
              deliverId: $(ele).attr('data-id'),
            }
          }
        )
      })
    }

    function padThree(num) {
      var s = num + ''
      while (s.length < 3) s = '0' + s
      return s
    }

    $('#order-query-btn').on('click', function (e) {
      e.preventDefault()

      var orderId = $('#order-id').val(), // 前8碼是日期，之後是供應商
        date =
          orderId.substring(0, 4) +
          '/' +
          orderId.substring(4, 6) +
          '/' +
          orderId.substring(6, 8),
        supplier = orderId.substring(8)

      // 非供應商帳號，擋！
      if (sessionStorage) {
        if (
          supplier !== JSON.parse(sessionStorage.getItem('loginInfo')).user_id
        ) {
          renderResultTable([])
          return
        }
      } else {
        return
      }

      servkit.ajax(
        {
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
        {
          success: function (data) {
            var orderDeliverIdList = _.chain(data)
              .map(function (row) {
                return row[0]
              })
              .uniq()
              .value()

            renderResultTable(orderDeliverIdList)
          },
        }
      )
    })
  })()
}
