export default function () {
  GoGoAppFun({
    gogo: function (context) {
      $('#stk-app-table')
        .find('tbody')
        .on('click', '.stk-cancel-btn', function (evt) {
          evt.preventDefault()
          $('#imgInput').find('input').val('')
          $('#imgInput').addClass('hide')
        })

      servkit.crudtable({
        tableSelector: '#stk-app-table',
        customBtns: [
          '<div id="imgInput" style="display: inline-block;">' +
            '<div class="smart-form">' +
            '<label for="file" class="input input-file" style="margin-top: 2px;">' +
            '<div class="button" style="background-color: #3276B1;">' +
            '<input type="file" id="imgFile" name="file" onchange="this.parentNode.nextSibling.value = this.value">' +
            'Browse</div>' +
            '<input type="text" placeholder="Input img file" style="padding-right: 80px;padding-bottom: 2px;">' +
            '</label></div></div>',
        ],
        create: {
          url: 'api/formeditor/app/create',
          start: function () {
            $('#imgInput').removeClass('hide')
          },
          send: function () {
            context.appId = $('[name=app_id]').val()
          },
          finalDo: function () {
            var formData = new FormData()
            formData.append('file', document.getElementById('imgFile').files[0])
            formData.append('data', context.appId)
            servkit.ajax(
              {
                url: 'api/formeditor/app/img',
                type: 'POST',
                contentType: false,
                processData: false,
                data: formData,
              },
              {
                success: function () {
                  $('#imgInput').find('input').val('')
                  $('#imgInput').addClass('hide')
                },
              }
            )
          },
        },
        read: {
          url: 'api/formeditor/app/read',
          finalDo: function () {
            $('#imgInput').addClass('hide')
          },
        },
        update: {
          unavailable: true,
        },
        delete: {
          unavailable: true,
        },
        validate: {
          1: function (td, table) {
            let input = td.querySelector('input')
            if (input.value === '') {
              return '此欄位必填'
            } else if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId === input.value
                })
              ) {
                return '索引欄位，不得重複'
              }
            }
          },
          2: function (td) {
            let input = td.querySelector('input')
            if (input.value === '') {
              return '此欄位必填'
            }
          },
          3: function () {
            if (
              $('#imgFile').val() &&
              $('#imgFile').val().split('.')[1] !== 'png'
            ) {
              return '僅能傳送png檔'
            }
          },
        },
      })
    },
    util: {
      appId: null,
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
