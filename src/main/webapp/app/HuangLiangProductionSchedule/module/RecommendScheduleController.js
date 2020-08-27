import {
  fetchCheckResult,
  fetchRearrangedData,
  fetchRecommendData,
} from './dataModel.js'
import { context } from './page/04_pre_scheduling.js'
import { DATETIME_FORMAT_WITHOUT_SEC } from './constans.js'
import { WoList } from './Work.js'

const codeMap = {
  D1:
    '產品廠務部歷史紀錄沒有此"管編"資料(productId)，請確認C:\\Servtech\\Servolution\\Platform\\zebraFoee\\orderhistory.csv',
  D2: '產品廠務部歷史紀錄沒有此"機型"資料',
  A3: '指定機台有空檔不符合交期，尋找其它同機型機台,沒有符合條件',
  B2: '指定機台沒有空檔，尋找其它同機型機台沒有符合條件',
  B3: '產品廠務部歷史紀錄沒有此"指定機台"資料，尋找其它同機型機台,沒有符合條件',
  B4:
    '查詢生產指令機台派工table(a_huangliang_view_wo_m_status_wo_list)沒有此指定機台、管編、製程順序資料，尋找其它同機型機台,沒有符合條件',
  C4:
    '無空檔機台，頗半沒有結果，找不到客戶權重較低的排程可以插單，沒有符合條件',
  E1: '指定機台，指定開始時間符合排程條件',
  E2:
    '指定機台，指定開始時間不符合排程條件，系統將重新計算開始時間，並回傳符合排程條件結果',
  E3: '指定機台沒有符合排程條件，推薦其他符合條件機台',
  F1: '智慧分析推薦，回傳一個最佳推薦機台條件',
  F2: '智慧分析推薦，將排程對半切，回傳兩個最佳推薦機台條件',
  F3: '智慧分析推薦，找到客戶權重較低的製程排程來插單，回傳最佳結果',
}
// 推薦排程、檢查衝突、檢查排程相關的模組
// 包含智慧推薦、編輯預排 / 派工modal的相關操作及背後流程
class RecommendScheduleController {
  constructor($container) {
    this.$container = $container
    this.codeMap = codeMap
  }
  getCheckResult() {
    if (!this.checkResult || !this.checkResult.checkResult) {
      return null
    }
    return Object.assign({}, this.checkResult.checkResult, {
      rearrangedData: this.rearrangedDataMap[
        this.checkResult.checkResult.machineId +
          '||' +
          this.checkResult.checkResult.expMdate.toFormatedDatetime()
      ],
    })
  }
  getRecommendData(keyList) {
    const keySet = new Set(keyList)
    return this.recommendResult.featureList
      .filter((data) => data && keySet.has(data.machineId))
      .map((data) =>
        Object.assign({}, data, {
          rearrangedData: this.rearrangedDataMap[
            data.machineId + '||' + data.expMdate.toFormatedDatetime()
          ],
        })
      )
  }
  resetData() {
    this.recommendData = null
    this.checkResult = null
    this.checkResultList = []
    this.rearrangedDataMap = {}
  }
  // 將檢查排程的response轉換成檢查衝突的request
  convertData(response, insertData) {
    const { checkStatus = {}, checkResult, status = {}, featureList } = response
    const result = {}
    if (checkResult && !checkStatus.code && checkResult.label === 'D') {
      result.insertData = {
        exp_mdate: checkResult.expMdate,
        exp_edate: checkResult.expEdate,
        schedule_time: checkResult.scheduleTime,
        order_id: checkResult.orderId,
        machine_id: checkResult.machineId,
        include_exp_time: checkResult.oldExpEdates || [],
      }
    }
    result.recommendData = featureList.map((data) =>
      data.label === 'D'
        ? {
            machine_id: data.machineId,
            order_id: data.orderId,
            schedule_time: insertData.schedule_time,
            exp_mdate: data.expMdate,
            exp_edate: data.expEdate,
            include_exp_time: data.oldExpEdates || [],
          }
        : null
    )
    return result
  }
  inspect(requestData) {
    this.resetData()
    return (
      fetchCheckResult(requestData)
        // .then(endTime => dataModel.fetchDemoData())
        // 轉換資料格式
        .then((response) => {
          this.checkResult = _.pick(response, ['checkResult', 'checkStatus'])
          this.recommendResult = _.pick(response, ['featureList', 'status'])
          return this.convertData(
            response,
            _.pick(requestData, ['machine_id', 'order_id', 'schedule_time'])
          )
        })
        // 取得衝突調整後排程
        .then(({ insertData, recommendData }) => {
          const requestDataList = [insertData, ...recommendData]
          return Promise.all(
            requestDataList.map((data) =>
              data ? fetchRearrangedData(data, 'ProductionScheduling') : null
            )
          )
        })
        // 畫出表格
        .then(([insert, ...recommend]) => {
          if (insert) {
            this.rearrangedDataMap[
              insert.request.machine_id +
                '||' +
                insert.request.exp_mdate.toFormatedDatetime()
            ] = insert.response
          }
          recommend.forEach((data) => {
            if (data) {
              this.rearrangedDataMap[
                data.request.machine_id +
                  '||' +
                  data.request.exp_mdate.toFormatedDatetime()
              ] = data.response
            }
          })
          this.renderCheckTable(insert, requestData.exp_date)
          this.renderRecommendTable(recommend, requestData.exp_date)
          context.editScheduleModal.changeStatus(
            'show-check-and-recommend-result'
          )
          // this.$container.show();
        })
    )
  }
  recommend(requestData) {
    this.resetData()
    return fetchRecommendData(requestData)
      .then((response) => {
        this.recommendResult = response
        return this.convertData(
          response,
          _.pick(requestData, ['machine_id', 'order_id'])
        )
      })
      .then((response) =>
        Promise.all(
          response.recommendData.map((data) =>
            data ? fetchRearrangedData(data, 'ProductionScheduling') : null
          )
        )
      )
      .then((recommend) => {
        recommend.forEach((data) => {
          if (data) {
            this.rearrangedDataMap[
              data.request.machine_id +
                '||' +
                data.request.exp_mdate.toFormatedDatetime()
            ] = data.response
          }
        })
        this.renderRecommendTable(recommend, requestData.exp_date)
        context.editScheduleModal.changeStatus('only-recommend')
        context.editScheduleModal.$modal.modal('show')
      })
  }
  getCheckTableHtml(checkData, rearrangedData) {
    const { checkResult, checkStatus = {} } = checkData
    let rearrangedInfo
    let rearrangedStart
    let rearrangedEnd
    let rearrangedOrderId
    let html

    // 有錯誤訊息
    if (checkStatus.code) {
      console.warn(checkStatus.codeMsg || this.codeMap[checkStatus.code])
      html = `<tr class="result-table-message">
              <td colspan="6"><span class="table-alert">查無管編歷史資料</span></td>
            </tr>`
      return html
    }
    // 無空檔插入或是剖半排程
    if (checkResult.label === 'C' || checkResult.label === 'Y') {
      html = `<tr class="result-table-message">
              <td colspan="6"><span class="table-alert">指定機台沒有空檔</span></td>
            </tr>`
      return html
    }

    const { machineId, expMdate, expEdate } = checkResult
    const inputValue = machineId + '||' + expMdate + '||' + expEdate
    if (rearrangedData && rearrangedData.response.before.length > 1) {
      rearrangedInfo = ''
      for (
        let index = 1;
        index < rearrangedData.response.before.length;
        index++
      ) {
        rearrangedStart = rearrangedData.response.before[
          index
        ].expMdate.toFormatedDatetime()
        rearrangedEnd = rearrangedData.response.before[
          index
        ].expEdate.toFormatedDatetime()
        rearrangedOrderId = rearrangedData.response.before[index].orderId
        rearrangedInfo += `<div class="table-alert">${rearrangedOrderId} : ${rearrangedStart} ~ ${rearrangedEnd}</div>`
      }
    } else {
      rearrangedInfo = 'X'
    }

    html = `<tr class="result-table-option">
            <td>
              <label class="radio">
                <input type="radio" name="" value="${inputValue}" data-label="${
      checkResult.label
    }" data-recommend="false" checked>
                <i></i>
              </label>
            </td>
            <td>${servkit.getMachineName(machineId)}</td>
            <td>${expMdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT_WITHOUT_SEC
            )}</td>
            <td>${expEdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT_WITHOUT_SEC
            )}</td>
            <td>${rearrangedInfo}</td>
          </tr>`

    return html
  }
  getRecommendTableHtml(recommendData, rearrangedDataList) {
    const { status = {}, featureList } = recommendData
    const halfQtyScheduleCount = featureList.reduce(
      (a, x) => a + (x.label === 'C'),
      0
    )

    let rearrangedInfo
    let rearrangedStart
    let rearrangedEnd
    let rearrangedOrderId
    let html

    // 有錯誤訊息
    if (status.code) {
      console.warn(status.codeMsg || this.status[status.code])
      html = `<tr class="result-table-message">
              <td colspan="7"><span class="table-alert">查無管編歷史資料</span></td>
            </tr>`
      return html
    }

    html = featureList
      .map((data, i) => {
        const { machineId, expMdate, expEdate, label, preQty } = data
        const inputValue = machineId + '||' + expMdate + '||' + expEdate
        // 過濾掉無空檔(Y) / 無生產(X) / 單一剖半排程
        if (
          label === 'Y' ||
          label === 'X' ||
          (halfQtyScheduleCount < 2 && label === 'C')
        ) {
          return ''
        }

        if (
          rearrangedDataList[i] &&
          rearrangedDataList[i].response.before.length > 1
        ) {
          rearrangedInfo = ''
          for (
            let index = 1;
            index < rearrangedDataList[i].response.before.length;
            index++
          ) {
            rearrangedStart = rearrangedDataList[i].response.before[
              index
            ].expMdate.toFormatedDatetime()
            rearrangedEnd = rearrangedDataList[i].response.before[
              index
            ].expEdate.toFormatedDatetime()
            rearrangedOrderId =
              rearrangedDataList[i].response.before[index].orderId
            rearrangedInfo += `<div class="table-alert">${rearrangedOrderId} : ${rearrangedStart} ~ ${rearrangedEnd}</div>`
          }
        } else {
          rearrangedInfo = 'X'
        }

        return `<tr class="result-table-option">
              <td>
                <label class="radio">
                  <input type="radio" name="" value="${inputValue}" data-label="${label}" data-recommend="true">
                  <i></i>
                </label>
              </td>
              <td>${servkit.getMachineName(machineId)}</td>
              <td>${expMdate.toFormatedDatetime(
                null,
                DATETIME_FORMAT_WITHOUT_SEC
              )}</td>
              <td>${expEdate.toFormatedDatetime(
                null,
                DATETIME_FORMAT_WITHOUT_SEC
              )}</td>
              <td>${
                label === 'C'
                  ? `<span class="table-alert">${preQty}</span>`
                  : preQty
              }</td>
              <td>${rearrangedInfo}</td>
            </tr>`
      })
      .join('')

    if (!html) {
      html = `<tr class="result-table-message">
              <td colspan="7"><span class="table-alert">沒有符合條件的機台</span></td>
            </tr>`
    }

    return html
  }
  renderCheckTable(rearrangedData, exp_date, checkResultList) {
    const isMultipleResult = _.isArray(rearrangedData)
    const $tbody = this.$container.find('table.inspect-result-table tbody')
    let html
    if (isMultipleResult) {
      html = checkResultList
        .map((data, i) => this.getCheckTableHtml(data, rearrangedData[i]))
        .join('')
    } else {
      html = this.getCheckTableHtml(this.checkResult, rearrangedData)
    }
    $tbody.html(html)
  }
  renderRecommendTable(rearrangedDataList, exp_date) {
    const $tbody = this.$container.find('table.recommend-result-table tbody')
    const html = this.getRecommendTableHtml(
      this.recommendResult,
      rearrangedDataList
    )

    $tbody.html(html)
  }
  showRecommendModal(btn) {
    const orderId = $(btn).closest('.card').data('order_id')
    const data = context.woList.getData(orderId)
    const $modal = $('#recommend-modal')
    let preQty = WoList.getQuantity(data)

    if (preQty <= 0) {
      $.smallBox({
        title: '已派工與已預排數量已超過訂單數',
        color: servkit.statusColors.alarm,
        timeout: 4000,
      })
      return
    }
    if (!data.exp_date) {
      $.smallBox({
        title: '無預計交期',
        content: '請生管於「生產指令狀態查詢」維護',
        color: servkit.statusColors.alarm,
        timeout: 4000,
      })
      return
    }

    this.recommend(
      Object.assign({}, data, {
        order_qty: preQty,
        // code: 'A2',
        // is_demo: true,
        exp_date: data.exp_date.replace(/\//g, '-'),
      })
    )
  }
}

export { RecommendScheduleController }
