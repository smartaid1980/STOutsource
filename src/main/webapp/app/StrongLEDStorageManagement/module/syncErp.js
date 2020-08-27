class SyncErp {
  constructor({ btn, syncBy, syncApiUrl, syncErpCallBack }) {
    this.btn = btn
    this.loadingButton = servkit.loadingButton(btn)
    this.syncBy = syncBy
    this.syncApiUrl = syncApiUrl
    this.syncErpCallBack = syncErpCallBack
    this._insertLastSyncTimeSpan()
    this.btn.addEventListener('click', this.syncErp.bind(this))
  }
  _insertLastSyncTimeSpan() {
    const outerSpan = document.createElement('span')
    const innerSpan = document.createElement('span')
    outerSpan.id = 'sync-info'
    outerSpan.textContent = i18n('Last_Synchronization_Time') + '：'
    outerSpan.appendChild(innerSpan)
    this.btn.insertAdjacentElement('afterend', outerSpan)
    this.lastSyncTimeSpan = innerSpan
  }
  syncErp() {
    const self = this
    self.loadingButton.doing()
    return self.getLatestSyncTime().then((lastSyncTime) => {
      const isLessThan30Min =
        +new Date() - +new Date(lastSyncTime) < 30 * 60 * 1000
      if (isLessThan30Min) {
        $.smallBox({
          sound: false,
          title: i18n('Cancel_Sync'),
          content: i18n('Sync_Alert'),
          color: servkit.colors.red,
          iconSmall: 'fa fa-times',
          timeout: 4000,
        })
      } else {
        servkit.ajax(
          {
            url: self.syncApiUrl,
            type: 'GET',
          },
          {
            success(data) {
              self.updateLastSyncTime().then(() => {
                self.loadingButton.done()
                console.log('sync finished')
                if (self.syncErpCallBack) {
                  self.syncErpCallBack()
                }
              })
            },
            fail(err) {
              $.smallBox({
                sound: false,
                title: i18n('Failure'),
                content: i18n('Please_Contact_Your_System_Administrator'),
                color: servkit.colors.red,
                iconSmall: 'fa fa-times',
                timeout: 4000,
              })
              console.warn('同步進貨單失敗', err)
              self.loadingButton.done()
            },
          }
        )
      }
    })
  }
  updateLastSyncTime() {
    return this.getLatestSyncTime().then(
      (lastSyncTime) => (this.lastSyncTimeSpan.textContent = lastSyncTime)
    )
  }
  getLatestSyncTime(syncBy = this.syncBy) {
    return new Promise((res) =>
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_strongled_synctime_stock_in',
            columns: ['MAX(sync_start) sync_start'],
            whereClause: `create_by = ?`,
            whereParams: [syncBy],
          }),
        },
        {
          success(data) {
            const lastSyncTime =
              data && data[0] && !_.isEmpty(data[0])
                ? data[0].sync_start.toFormatedDatetime()
                : ''
            res(lastSyncTime)
          },
        }
      )
    )
  }
}

export { SyncErp }
