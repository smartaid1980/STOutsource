export default function () {
  GoGoAppFun({
    gogo(ctx) {
      $('#insert-all').on('click', () => ctx.callByPathIndex(0))
      $('#clear-all').on('click', () => ctx.callByPathIndex(1))
      $('#insert-map').on('click', () => ctx.callByPathIndex(2))
      $('#clear-map').on('click', () => ctx.callByPathIndex(3))
      $('#insert-report').on('click', () => ctx.callByPathIndex(4))
      $('#clear-report').on('click', () => ctx.callByPathIndex(5))
      $('#insert-dashboard').on('click', () => ctx.callByPathIndex(6))
      $('#clear-dashboard').on('click', () => ctx.callByPathIndex(7))
    },
    util: {
      insertAllLoadingButton: servkit.loadingButton(
        document.querySelector('#insert-all')
      ),
      clearAllLoadingButton: servkit.loadingButton(
        document.querySelector('#clear-all')
      ),
      insertMapLoadingButton: servkit.loadingButton(
        document.querySelector('#insert-map')
      ),
      clearMapLoadingButton: servkit.loadingButton(
        document.querySelector('#clear-map')
      ),
      insertReportLoadingButton: servkit.loadingButton(
        document.querySelector('#insert-report')
      ),
      clearReportLoadingButton: servkit.loadingButton(
        document.querySelector('#clear-report')
      ),
      insertDashboardLoadingButton: servkit.loadingButton(
        document.querySelector('#insert-dashboard')
      ),
      clearDashboardLoadingButton: servkit.loadingButton(
        document.querySelector('#clear-dashboard')
      ),
      callByPathIndex(type) {
        let ctx = this
        let loadingBtns = [
          ctx.insertAllLoadingButton,
          ctx.clearAllLoadingButton,
          ctx.insertMapLoadingButton,
          ctx.clearMapLoadingButton,
          ctx.insertReportLoadingButton,
          ctx.clearReportLoadingButton,
          ctx.insertDashboardLoadingButton,
          ctx.clearDashboardLoadingButton,
        ]
        loadingBtns[type].doing()

        servkit.ajax(
          {
            url: 'api/externalApp/callByPathIndex',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              appPathIndex: type,
            }),
          },
          {
            success(data) {
              $.smallBox({ title: data, color: servkit.colors.green })
            },
            fail(data) {
              $.smallBox({ title: data, color: servkit.colors.red })
            },
            always() {
              loadingBtns[type].done()
            },
          }
        )
      },
    },
  })
}
