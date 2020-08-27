;((global, exports) => {
  class Table {
    constructor(config) {
      this.config = config
      this.rt = createReportTable(config)
      this.$table = config.$tableElement
    }
    getSelectedRow() {
      return this.$table
        .find('tbody td:first-child :checked')
        .closest('tr')
        .toArray()
    }
  }
  class Warning {
    constructor(no, totalUseQty, bind_qty, isPlastic) {
      this.no = no
      this.totalUseQty = totalUseQty
      this.bind_qty = bind_qty
      this.isPlastic = isPlastic
      this.getElement()
    }
    minusNo() {
      this.no--
      this.getElement()
    }
    change(no, totalUseQty) {
      this.no = no
      this.totalUseQty = totalUseQty
      this.getElement()
    }
    getElement() {
      const { no, totalUseQty, bind_qty, isPlastic } = this
      const unit = isPlastic ? '支' : 'KG'
      if (this.$el) {
        this.$el.data('no', no)
        this.$el.text(
          `*項次${no.replace(/_/g, ', ')} 總領用數 ${totalUseQty.toFixed(
            2
          )}${unit} 已超過綁定數 ${bind_qty}${unit}`
        )
      } else {
        const $el = $(
          `<div class="warnings" style="color: red;" data-no="${no}">*項次${no.replace(
            /_/g,
            ', '
          )} 總領用數 ${totalUseQty.toFixed(
            2
          )}${unit} 已超過綁定數 ${bind_qty}${unit}</div>`
        )
        this.$el = $el
      }
      return this.$el
    }
  }
  class MaterialToAssignTable extends Table {
    constructor($tableElement, statusMap, $el, preCon) {
      let self
      const config = {
        $tableElement,
        showNoData: false,
        autoWidth: false,
        columns: [
          {
            name: 'no',
            data: 'no',
          },
          {
            name: 'mstock_name',
            data: 'mstock_name',
          },
          {
            name: 'po_no',
            data: 'po_no',
          },
          {
            name: 'shelf_time',
            data: 'shelf_time',
            render(data) {
              return data.toFormatedDatetime()
            },
          },
          {
            name: 'sup_id',
            data: 'sup_id',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return preCon.supplier ? preCon.supplier[data] || data : data
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'mat_code',
            data: 'mat_code',
          },
          {
            name: 'location',
            data: 'location',
          },
          {
            name: 'mat_length',
            data: 'mat_length',
          },
          {
            name: 'mat_color',
            data: 'mat_color',
          },
          {
            name: 'use_piece',
            data: null,
            render(data, type, rowData) {
              const { use_piece, use_qty, unit } = rowData
              let isPlastic = false
              if (unit !== undefined) {
                isPlastic = unit === '支' ? true : false
              } else {
                isPlastic = use_piece == use_qty ? true : false
              }
              return `${use_piece}支` + (isPlastic ? '' : `(${use_qty}KG)`)
            },
          },
          {
            name: 'use_remark',
            data: 'use_remark',
          },
          {
            name: 'item_status',
            data: 'item_status',
            render(data, type, rowData) {
              const { isCancel } = rowData
              const item_status = isCancel ? 99 : data
              return item_status !== undefined ? statusMap[item_status] : ''
            },
          },
          {
            name: 'cancel',
            data: null,
            render(data, type, rowData) {
              const { item_status, isCancel, isNew } = rowData
              let isDisable = isNew ? false : true
              let btnClass = isNew ? 'btn-danger' : 'btn-primary'
              let btnText = isNew ? '刪除' : '取消'
              if (item_status === 0 && !isCancel && !isNew) {
                isDisable = false
              }
              return `<button class="btn ${btnClass} cancel-location-detail" ${
                isDisable ? 'disabled' : ''
              }>${btnText}</button>`
            },
          },
        ],
        onRow(tr, rowData) {
          // const {
          //   no
          // } = rowData;
          // if (!self.warnings[no]) {
          //   self.renderWarningMsg(rowData);
          // }
          self.updateDataGroupByPoFile(rowData)
        },
      }
      super(config)
      this.$el = $el
      this.groupedData = this._initGroupedData($el.materialWarning)
      self = this
      // self.warnings = {};
    }
    _initGroupedData(warningsContainer) {
      // const groupedData = {};
      // Object.defineProperty(groupedData, )
      class BindData {
        constructor(pks, warningsContainer) {
          this.pks = pks
          this.bind_qty = 0
          this.currBindQty = 0
          this.data = {}
          this.warningsContainer = warningsContainer
          this.warning
        }
        add(rowData) {
          const { bind_qty, use_qty, unit } = rowData
          const pk = this.getMatStockPk(rowData)
          if (Object.prototype.hasOwnProperty.call(this.data, pk)) {
            return
          }
          if (bind_qty !== undefined && this.bind_qty === 0) {
            this.bind_qty = bind_qty
          }
          this.data[pk] = rowData
          this.currBindQty += use_qty
          this.renderWarningMsg(unit === '支')
        }
        renderWarningMsg(isPlastic) {
          const isRender =
            this.bind_qty !== 0 && this.bind_qty < this.currBindQty
          if (isRender && this.warning) {
            this.warning.change(this.getWarningPk(), this.currBindQty)
          } else if (isRender && !this.warning) {
            this.warning = new Warning(
              this.getWarningPk(),
              this.currBindQty,
              this.bind_qty,
              isPlastic
            )
            this.warningsContainer.append(this.warning.$el)
          }
        }
        reset() {
          if (this.warning) {
            this.warning.$el.remove()
          }
        }
        getWarningPk() {
          return _.pluck(Object.values(this.data), 'no').sort().join('_')
        }
        getMatStockPk(rowData) {
          return rowData.shelf_time + '_' + rowData.mat_code
        }
      }
      class GroupedData {
        constructor(warningsContainer) {
          this.data = {}
          this.warningsContainer = warningsContainer
          this._pksOrder = ['mstock_name', 'po_no', 'mat_code', 'sup_id']
        }
        add(rowData) {
          const pks = this.getPks(rowData)
          if (!Object.prototype.hasOwnProperty.call(this.data, pks)) {
            this.data[pks] = new BindData(pks, this.warningsContainer)
          }
          this.data[pks].add(rowData)
        }
        // remove (rowData) {
        //   const pks = this.getPks(rowData);
        //   if (Object.prototype.hasOwnProperty.call(this.data, pks)) {
        //     this.data[pks].remove(pks);
        //   }
        // }
        getPks(rowData) {
          return this._pksOrder.map((column) => rowData[column] || '').join('_')
        }
        reset() {
          _.each(this.data, (bindData) => {
            bindData.reset()
          })
          this.data = {}
        }
      }
      return new GroupedData(warningsContainer)
    }
    updateDataGroupByPoFile(rowData) {
      // if (!Object.prototype.hasOwnProperty.call(rowData, 'bind_qty')) {
      //   return;
      // }
      const self = this
      const { groupedData } = self
      groupedData.add(rowData)
    }
    resetGroupedData() {
      this.groupedData.reset()
    }
    // renderWarningMsg (rowData) {
    //   const self = this;
    //   if (Object.prototype.hasOwnProperty.call(rowData, 'bind_qty')) {
    //     const {
    //       bind_qty = 0,
    //       use_qty,
    //       no,
    //       unit
    //     } = rowData;
    //     const isPlastic = unit === '支';
    //     const isExceedBindQty = use_qty > bind_qty;
    //     if (isExceedBindQty) {
    //       const warning = new Warning(no, use_qty, bind_qty, isPlastic);
    //       self.warnings[warning.no] = warning;
    //       self.$el.materialWarning.append(warning.$el);
    //     }
    //   }
    // }
  }
  class TempStockMaterialTable extends Table {
    constructor($tableElement, statusMap, preCon) {
      let self
      const config = {
        $tableElement,
        showNoData: false,
        autoWidth: false,
        columns: [
          {
            name: 'mstock_name',
            data: 'mstock_name',
          },
          {
            name: 'po_no',
            data: 'po_no',
          },
          {
            name: 'shelf_time',
            data: 'shelf_time',
            render(data) {
              return data.toFormatedDatetime()
            },
          },
          {
            name: 'sup_id',
            data: 'sup_id',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return preCon.supplier ? preCon.supplier[data] || data : data
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'mat_code',
            data: 'mat_code',
          },
          {
            name: 'location',
            data: 'location',
          },
          {
            name: 'mat_length',
            data: 'mat_length',
          },
          {
            name: 'mat_color',
            data: 'mat_color',
          },
          {
            name: 'shelf_qty',
            data: 'shelf_qty',
            render(data, type, rowData) {
              const { shelf_piece, shelf_qty, unit } = rowData
              const isPlastic = unit === '支'
              return `${shelf_piece}支` + (isPlastic ? '' : ` (${shelf_qty}KG)`)
            },
          },
          {
            name: 'status',
            data: 'status',
            render(data) {
              return data ? statusMap[data] || data : ''
            },
          },
        ],
      }
      super(config)
      self = this
    }
  }
  class AssignableMaterialTable extends Table {
    constructor($tableElement, preCon) {
      let self
      const config = {
        $tableElement,
        showNoData: false,
        autoWidth: false,
        customBtns: [
          `<button class="btn btn-primary" id="material-assign-btn">新增</button>`,
          `<button class="btn btn-default material-to-assign active" data-bind="true" title="綁定物料"><span class="fa fa-filter"></span>綁定物料</button>`,
          `<button class="btn btn-default material-to-assign" data-bind="false" title="未綁定物料"><span class="fa fa-filter"></span>未綁定物料</button>`,
        ],
        order: [[3, 'asc']],
        columnDefs: [
          {
            orderable: false,
            targets: [0, 10],
          },
        ],
        columns: [
          {
            name: 'checkbox',
            data: null,
            render(data, type, rowData) {
              return `<input type="checkbox" class="form-control">`
            },
          },
          {
            name: 'mstock_name',
            data: 'mstock_name',
          },
          {
            name: 'po_no',
            data: 'po_no',
          },
          {
            name: 'shelf_time',
            data: 'shelf_time',
            render(data) {
              return data.toFormatedDatetime()
            },
          },
          {
            name: 'sup_id',
            data: 'sup_id',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return preCon.supplier ? preCon.supplier[data] || data : data
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'mat_code',
            data: 'mat_code',
          },
          {
            name: 'location',
            data: 'location',
          },
          {
            name: 'mat_length',
            data: 'mat_length',
          },
          {
            name: 'mat_color',
            data: 'mat_color',
          },
          {
            name: 'mstock_qty',
            data: null,
            render(data, type, rowData) {
              const {
                stock_piece,
                mstock_qty,
                lock_qty = 0,
                lock_piece = 0,
                unit,
              } = rowData
              const isPlastic = unit === '支'
              const assignableQty = mstock_qty - lock_qty
              const assignablePiece = Number(stock_piece) - lock_piece
              return (
                `${assignablePiece}支` +
                (isPlastic ? '' : ` / ${assignableQty.round(2)}KG`)
              )
            },
          },
          {
            name: 'use_piece',
            data: null,
            render(data, type, rowData) {
              const { stock_piece, lock_piece = 0 } = rowData
              const assignablePiece = Number(stock_piece) - lock_piece
              return `<form>
              <div class="input-group" style="width: 100%;">
                <span class="input-group-addon">
                  <label class="checkbox-inline">
                    <input type="checkbox" class="checkbox" checked name="is_collect_all">
                    <span> 全領</span>
                  </label>
                </span>
                <input class="form-control" name="use_piece" type="text" readonly data-assignable-piece="${assignablePiece}" value="${assignablePiece}">
                <span class="input-group-addon">
                  支
                </span>
              </div>
              </form>`
            },
          },
        ],
      }
      super(config)
      self = this
    }
  }
  class MaterialAssign {
    constructor(config, commons, preCon) {
      this.config = config
      this.auth = Object.assign(
        {
          canEdit: true,
        },
        config.auth || {}
      )
      this.statusMap = commons.statusMap
      this.mstockNameMap = commons.mstockNameMap
      this.preCon = preCon
      this._initHtml()
      this._initReportTable()
      this._initEvent()
      this.setValidateMsg()
    }
    _initHtml() {
      /**
       * 1. append html
       * 2. store all related elements
       */
      const self = this
      const modalId = 'location-detail-modal-widget'
      const modalTitle = '物料明細'
      const formId = 'material-assignment-info-form'
      const orderIdTagId = 'wo-to-assign'
      const machineIdTagId = 'machine-to-assign'
      const materialToAssignTableId = 'material-to-assign-table'
      const tempStockMaterialTableId = 'temp-stock-material-table'
      const assignableMaterialTableId = 'assignable-material-table'
      const returnMainPageBtnId = 'return-main-page-btn'
      const cancelEditBtnId = 'cancel-edit-btn'
      const updateMaterialAssignmentBtnId = 'update-material-assignment-btn'
      const edtiMaterialAssignmentBtnId = 'edit-material-assignment-btn'
      const materialQuantityId = 'material-quantity'
      const materialQuantityUnitId = 'material-quantity-unit'
      const materialWarningId = 'material-warning'
      const recommendSupplyPieceId = 'recommend-supply-piece'
      const html = `<div class="modal fade ${
        self.config.isCreate ? 'edit' : ''
      }" id="${modalId}" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document" style="width: 1200px">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h3 class="modal-title">${modalTitle}</h3>
            </div>
            <div class="modal-body" style="border:none !important">
              <form class="form-horizontal" id="${formId}">
                <fieldset>
                  <div class="form-group col-lg-6 col-sm-12">
                    <div class="row">
                      <label class="control-label col-lg-4">生產指令</label>
                      <div class="col-lg-8">
                        <span id="${orderIdTagId}" class="form-control" style="border: none;"></span>
                      </div>
                    </div>
                  </div>
                  <div class="form-group col-lg-6 col-sm-12">
                    <div class="row">
                      <label class="control-label col-lg-4">機台</label>
                      <div class="col-lg-8">
                        <span id="${machineIdTagId}" class="form-control" style="border: none;"></span>
                      </div>
                    </div>
                  </div>
                  <div class="form-group col-lg-6 col-sm-12">
                    <div class="row">
                      <label class="control-label col-lg-4">材料條碼</label>
                      <div class="col-lg-8">
                        <input type="text" name="mat_code" class="form-control">
                        <label class="error hide">格式錯誤</label>
                      </div>
                    </div>
                  </div>
                  <div class="form-group col-lg-6 col-sm-12">
                    <div class="row">
                      <label class="control-label col-lg-4" for="prepend">修尾尺寸(mm)</label>
                      <div class="col-lg-8">
                        <div class="row">
                          <div class="col-sm-12">
                              <div class="input-group">
                                <span class="input-group-addon">
                                  <span class="checkbox">
                                    <label>
                                      <input type="checkbox" name="is_rework" class="checkbox style-0" checked>
                                      <span></span>
                                    </label>
                                  </span>
                                </span>
                                <input class="form-control vld-rework-size" name="rework_size" placeholder="" type="text">
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </form>
              <hr>
              <table id="${materialToAssignTableId}" class="table table-striped table-bordered table-hover" width="100%">
                <thead>
                  <tr>
                    <th>項次</th>
                    <th>材料庫</th>
                    <th>採購單號</th>
                    <th>上架時間</th>
                    <th>廠商</th>
                    <th>材料條碼</th>
                    <th>位置</th>
                    <th>長度</th>
                    <th>顏色</th>
                    <th>派工數</th>
                    <th>派工備註</th>
                    <th>執行狀態</th>
                    <th>取消 / 刪除</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
              <div id="material-to-assign-info">
                <div class="font-md" style="margin: 10px 10px 0;">
                  此次領料總計<span class="padding-5" id="${materialQuantityId}"></span><span id="${materialQuantityUnitId}"></span>
                </div>
                <div id="${materialWarningId}" class="font-md" style="margin: 10px 10px 0;">
                  <div id="${recommendSupplyPieceId}"></div>
                </div>
              </div>
              <div id="assignable-material-container">
                <hr>
                <h3>可派工物料</h3>
                <table id="${assignableMaterialTableId}" class="table table-striped table-bordered table-hover" width="100%">
                  <thead>
                    <tr>
                      <th style="width: 3%;"><input type="checkbox" class="form-control stk-all-checkbox"></th>
                      <th style="width: 5%;">材料庫</th>
                      <th style="width: 8%;">採購單號</th>
                      <th style="width: 8%;">上架時間</th>
                      <th style="width: 12%;">廠商</th>
                      <th style="width: 12%;">材料條碼</th>
                      <th style="width: 6%;">位置</th>
                      <th style="width: 8%;">長度</th>
                      <th style="width: 6%;">顏色</th>
                      <th style="width: 10%;">庫存</th>
                      <th style="width: 15%;">派工數</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
              <div id="temp-stock-material-container">
                <hr>
                <h3>暫入上架物料</h3>
                <table id="${tempStockMaterialTableId}" class="table table-striped table-bordered table-hover" width="100%">
                  <thead>
                    <tr>
                      <th>材料庫</th>
                      <th>採購單號</th>
                      <th>上架時間</th>
                      <th>廠商</th>
                      <th>材料條碼</th>
                      <th>位置</th>
                      <th>長度</th>
                      <th>顏色</th>
                      <th>暫入庫存</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default btnClass" id="${returnMainPageBtnId}" data-toggle="modal" data-target="#location-detail-modal-widget">返回</button>
              <button type="button" class="btn btn-default btnClass" id="${cancelEditBtnId}">取消</button>
              <button type="button" class="btn btn-success btnClass" id="${updateMaterialAssignmentBtnId}">儲存</button>
              <button type="button" class="btn btn-primary btnClass" id="${edtiMaterialAssignmentBtnId}">修改</button>
            </div>
          </div>
        </div>
      </div>`

      $('#widget-grid').children('.row').append(html)

      const modal = $(`#${modalId}`)
      const form = $(`#${formId}`)
      const orderId = $(`#${orderIdTagId}`)
      const machineId = $(`#${machineIdTagId}`)
      const isRework = modal.find('[name=is_rework]')
      const reworkSize = modal.find('[name=rework_size]')
      const matCode = modal.find('[name=mat_code]')
      const matCodeError = matCode.next()
      const materialToAssignTable = $(`#${materialToAssignTableId}`)
      const tempStockMaterialTable = $(`#${tempStockMaterialTableId}`)
      const assignableMaterialTable = $(`#${assignableMaterialTableId}`)
      const returnMainPageBtn = $(`#${returnMainPageBtnId}`)
      const cancelEditBtn = $(`#${cancelEditBtnId}`)
      const edtiMaterialAssignmentBtn = $(`#${edtiMaterialAssignmentBtnId}`)
      const updateMaterialAssignmentBtn = $(`#${updateMaterialAssignmentBtnId}`)
      const materialQuantity = $(`#${materialQuantityId}`)
      const materialQuantityUnit = $(`#${materialQuantityUnitId}`)
      const materialWarning = $(`#${materialWarningId}`)
      const recommendSupplyPiece = $(`#${recommendSupplyPieceId}`)

      self.$el = {
        modal,
        form,
        orderId,
        machineId,
        isRework,
        reworkSize,
        matCode,
        matCodeError,
        materialToAssignTable,
        tempStockMaterialTable,
        assignableMaterialTable,
        returnMainPageBtn,
        cancelEditBtn,
        edtiMaterialAssignmentBtn,
        updateMaterialAssignmentBtn,
        materialQuantity,
        materialQuantityUnit,
        materialWarning,
        recommendSupplyPiece,
      }
    }
    _initReportTable() {
      /**
       * 1. createReportTable - materialToAssignTable
       * 2. createReportTable - tempStockMaterialTable
       * 3. createReportTable - assignableMaterialTable
       */
      const { preCon } = this
      this.materialToAssignTable = new MaterialToAssignTable(
        this.$el.materialToAssignTable,
        this.statusMap.item_status,
        { materialWarning: this.$el.materialWarning },
        preCon
      )
      this.tempStockMaterialTable = new TempStockMaterialTable(
        this.$el.tempStockMaterialTable,
        this.statusMap.tempStockMaterial,
        preCon
      )
      this.assignableMaterialTable = new AssignableMaterialTable(
        this.$el.assignableMaterialTable,
        preCon
      )
    }
    _initEvent() {
      const self = this
      const matCodeHandlerDecounced = _.debounce(self.matCodeHandler, 500)
      self.$el.matCode.on('keyup', function () {
        matCodeHandlerDecounced.call(self, this)
      })
      self.$el.edtiMaterialAssignmentBtn.on('click', function () {
        self.edit()
      })
      self.$el.cancelEditBtn.on('click', function () {
        self.cancelEdit()
      })
      self.$el.modal
        .on('click', '#material-assign-btn', function () {
          self.add()
        })
        .on('click', '.material-to-assign', function () {
          self.changeAssignableMaterialTableTab(this)
        })
        .on('click', '#update-material-assignment-btn', function () {
          self.saveMaterialAssignment()
        })
        .on('click', '.stk-all-checkbox', function (e) {
          self.$el.assignableMaterialTable
            .find('tbody tr td:first-child')
            .each(function (i) {
              this.firstElementChild &&
                (this.firstElementChild.checked = e.target.checked)
            })
        })
      self.$el.materialToAssignTable.on(
        'click',
        '.cancel-location-detail',
        function () {
          const isDelete = this.classList.contains('btn-danger')
          if (isDelete) {
            self.delete(this)
          } else {
            self.cancel(this)
          }
        }
      )
      self.$el.assignableMaterialTable.on(
        'click',
        '.checkbox-inline',
        function () {
          self.toggleCollectAll(
            this.querySelector('.checkbox[name=is_collect_all]')
          )
        }
      )
    }
    show(rowData, tr) {
      const self = this
      const {
        machine_id,
        order_id,
        wo_m_time,
        m_mat_time,
        m_mat_status,
        type,
      } = rowData
      const { isCreate, isSupplement } = self.config

      if (!isCreate) {
        const canEdit = m_mat_status === 0 && self.auth.canEdit
        self.$el.edtiMaterialAssignmentBtn.toggleClass('hide', !canEdit)
        self.$el.matCode.prop('disabled', true)
        self.$el.isRework.prop('disabled', true)
        self.$el.reworkSize.prop('disabled', true)
      }
      self.$el.orderId.text(order_id)
      self.$el.machineId.text(servkit.getMachineName(machine_id))
      self.$el.matCodeError.toggleClass('hide', true)
      self.$el.modal.toggleClass('edit', isCreate).data({
        rowData,
        tr,
      })

      const getAssignmentRecord = new Promise((res) => {
        if (isCreate) {
          return res()
        }
        const whereClause =
          'order_id=? AND machine_id=? AND wo_m_time=? AND m_mat_time=?'
        const whereParams = [
          order_id,
          machine_id,
          wo_m_time.toFormatedDatetime(),
          m_mat_time.toFormatedDatetime(),
        ]
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              res(data)
            },
          }
        )
      })
      const getBindableMaterial = new Promise((res) => {
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_m_mat',
            type: 'GET',
            data: {
              order_id,
            },
          },
          {
            success(data) {
              res(data)
            },
          }
        )
      })

      Promise.all([getAssignmentRecord, getBindableMaterial]).then(
        ([assignmentRecord = [], bindableMaterial]) => {
          // 填入最後一次材料派工得修尾尺寸，或是清空
          const hasReworkSize = !!(
            assignmentRecord.length && assignmentRecord[0].rework_size
          )
          self.$el.isRework.prop('checked', hasReworkSize)
          self.$el.reworkSize.val(
            hasReworkSize ? assignmentRecord[0].rework_size : ''
          )

          self.$el.matCode.val(bindableMaterial.mat_codes[0]).data({ order_id })
          self.tempStockMaterialTable.rt.drawTable(bindableMaterial.temp_stocks)

          self.bindedAssignableMaterial = bindableMaterial.binding_mats
          self.unbindAssignableMaterial = bindableMaterial.unbinding_mats
          self.matAssignmentRecord = assignmentRecord
          self.undo()

          self.materialToAssignTable.rt.table
            .column('cancel:name')
            .visible(isCreate)

          // 修改補料紀錄時，不用顯示建議支數
          if (isSupplement) {
            self.renderRecommendSupplyPiece(rowData)
          }
          self.$el.modal.modal('show')
        }
      )
    }
    undo() {
      const self = this
      const { isCreate } = self.config

      // reset validator
      const infoFormValidator = self.$el.form.data('validator')
      if (infoFormValidator) {
        infoFormValidator.resetForm()
      }

      self.$el.recommendSupplyPiece.empty().siblings().remove()

      // 重畫此次(已)派工物料表格
      self.materialToAssignNumber = 1
      self.matAssignmentRecord = self.matAssignmentRecord.map((d) =>
        _.extend(d, { no: self.materialToAssignNumber++ })
      )
      self.materialToAssignTable.resetGroupedData()
      self.materialToAssignTable.rt.drawTable(self.matAssignmentRecord)
      // self.materialToAssignTable.warnings.length = 0;

      // 過濾已被綁過的物料
      const assignmentRecordPks = _.map(self.matAssignmentRecord, (value) =>
        _.pick(value, ['shelf_time', 'mat_code'])
      )
      self.bindedAssignableMaterial = self.getBindableMaterial(
        self.bindedAssignableMaterial,
        assignmentRecordPks
      )
      self.unbindAssignableMaterial = self.getBindableMaterial(
        self.unbindAssignableMaterial,
        assignmentRecordPks
      )
      self.changeAssignableMaterialTableTab(null, true)

      // 計算已派材料重量 / 支數
      let isPlastic = false
      self.assignedMatTotalQty = self.matAssignmentRecord.reduce((a, data) => {
        isPlastic =
          isPlastic || data.use_qty === data.use_piece || !data.use_qty
        return a + (data.use_qty || data.use_piece)
      }, 0)
      self.changeTotalQuantityText(
        self.assignedMatTotalQty.toFixed(2),
        isPlastic
      )

      if (isCreate) {
        self.tempMaterialToAssignData = {
          cancel: [],
          insert: [],
        }
      }
    }
    getUnbindMaterial(mstock_name, mat_code) {
      return new Promise((res) =>
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_m_mat/unbindingData',
            type: 'GET',
            data: {
              mstock_name,
              mat_code,
            },
          },
          {
            success(data) {
              res(data)
            },
          }
        )
      )
    }
    changeAssignableMaterialTableTab(btn, changeTo) {
      const self = this
      if (btn) {
        const $btn = $(btn)
        const isBind = $btn.data('bind')
        const $anotherBtn = self.$el.modal.find(
          `.material-to-assign[data-bind=${isBind ? false : true}]`
        )
        $btn.toggleClass('active', true)
        $anotherBtn.toggleClass('active', false)
        self.drawAssignableMaterialTable(isBind)
      } else {
        const $btn = self.$el.modal.find(
          `.material-to-assign[data-bind=${changeTo}]`
        )
        const $anotherBtn = self.$el.modal.find(
          `.material-to-assign[data-bind=${!changeTo}]`
        )
        $btn.toggleClass('active', true)
        $anotherBtn.toggleClass('active', false)
        self.drawAssignableMaterialTable(changeTo)
      }
    }
    drawAssignableMaterialTable(isBind) {
      const self = this
      const tableData = isBind
        ? self.bindedAssignableMaterial
        : self.unbindAssignableMaterial
      const filterTableData = tableData.filter((data) => {
        return !data.isAssign
      })
      if (isBind) {
        self.assignableMaterialTable.rt.drawTable(filterTableData)
      } else {
        self.assignableMaterialTable.rt.drawTable(filterTableData.slice(0, 3))
      }
    }
    matCodeHandler(input) {
      const self = this
      const mat_code = input.value
      const order_id = $(input).data('order_id')
      const mstock_name = self.mstockNameMap[order_id[0]]
      let isValid = false
      const matCodeRegex = /^M-(.{1,10})-([A-Z])-(\d{0,2}(?:\.\d{0,3})?)$/
      isValid = matCodeRegex.test(mat_code)
      if (isValid) {
        self.getUnbindMaterial(mstock_name, mat_code).then((data) => {
          const assignmentRecordPks = _.map(self.matAssignmentRecord, (value) =>
            _.pick(value, ['shelf_time', 'mat_code'])
          )
          self.unbindAssignableMaterial = self.getBindableMaterial(
            data,
            assignmentRecordPks
          )
          self.changeAssignableMaterialTableTab(null, false)
        })
      }
      self.$el.matCodeError.toggleClass('hide', isValid)
    }
    toggleCollectAll(checkbox) {
      const isCollectAll = checkbox.checked
      const input = checkbox
        .closest('td')
        .querySelector('input[name=use_piece]')
      const { assignablePiece } = input.dataset
      if (isCollectAll) {
        input.value = assignablePiece
        input.readOnly = true
      } else {
        input.value = 0
        input.readOnly = false
      }
    }
    calcRecommendSupplyPiece(rowData) {
      const {
        m_qty, // 派工
        m_pqty, // 生產
        m_bqty, // 不良
        place_count, // 機料架可放置數
        singleProduct, // 單支可生產數
        feeding_count, // 剩餘材料數
      } = rowData
      const unproducedQty = Number(m_qty) - Number(m_pqty)
      const unproducedRequiredMatPiece = Math.ceil(
        (unproducedQty + Number(m_bqty)) / singleProduct
      )
      let recommendSupplyPiece
      let msg
      if (unproducedRequiredMatPiece <= feeding_count) {
        recommendSupplyPiece = 0
        msg = `(架上剩料：${feeding_count} > (未生產：${unproducedQty} + 不良：${m_bqty}) / 單支可生產量：${singleProduct})`
      } else if (unproducedRequiredMatPiece > place_count) {
        recommendSupplyPiece = place_count - feeding_count
        msg = `(料機架可放置數：${place_count} - 架上剩料：${feeding_count})`
      } else {
        recommendSupplyPiece = unproducedRequiredMatPiece - feeding_count
        msg = `((未生產：${unproducedQty} + 不良：${m_bqty}) / 單支可生產量：${singleProduct} - 架上剩料：${feeding_count})`
      }
      return _.extend(
        {
          recommendSupplyPiece,
          unproducedQty,
          msg,
        },
        rowData
      )
    }
    renderRecommendSupplyPiece(rowData) {
      const self = this
      const recommendSupplyPiece = self.calcRecommendSupplyPiece(rowData)
      self.$el.recommendSupplyPiece.text(
        `*建議補料： ${recommendSupplyPiece.recommendSupplyPiece}支 ${recommendSupplyPiece.msg}`
      )
    }
    setValidateMsg() {
      $.validator.messages.maxlength = $.validator.format('長度不能超過{0}')
      $.validator.messages.minlength = $.validator.format('長度不能低於{0}')
      $.validator.messages.digits = $.validator.format('請輸入正整數')
      $.validator.messages.min = $.validator.format('最小值為{0}')
      $.validator.messages.max = $.validator.format('最大值為{0}')
      $.validator.messages.date = $.validator.format('請輸入正確的日期格式')
      $.validator.messages.number = $.validator.format('請輸入數字')
    }
    validateUsePiece(selectedRow) {
      const self = this
      let form
      let input
      let assignablePiece
      let isEqualToAssignablePiece
      return selectedRow
        .map((tr) => {
          form = tr.querySelector('form')
          input = tr.querySelector('input[type=text]')
          assignablePiece = Number(input.dataset.assignablePiece)
          isEqualToAssignablePiece = Number(input.value) === assignablePiece
          if (isEqualToAssignablePiece && assignablePiece > 0) {
            input
              .closest('td')
              .querySelector('.checkbox[name=is_collect_all]').checked = true
            return true
          } else {
            return $(form)
              .validate({
                rules: {
                  use_piece: {
                    required: true,
                    digits: true,
                    min: 1,
                    max: assignablePiece,
                  },
                },
                errorPlacement(error, $el) {
                  const $td = $el.closest('td')
                  $td.children('.error').remove()
                  $td.append(error)
                },
              })
              .form()
          }
        })
        .every((isValid) => isValid)
    }
    validateReworkSize() {
      const self = this
      const { form, isRework } = self.$el
      const validator = form.data('validator')
      const isValidate = isRework.prop('checked')
      if (isValidate && !validator) {
        return form
          .validate({
            rules: {
              rework_size: {
                required: true,
                digits: true,
                min: 1,
              },
            },
            errorPlacement(error, $el) {
              const $div = $el.closest('.col-sm-12')
              $div.children('.error').remove()
              $div.append(error)
            },
          })
          .form()
      } else if (isValidate && validator) {
        return validator.form()
      } else {
        return true
      }
    }
    changeTotalQuantityText(qty, isPlastic) {
      const self = this
      self.$el.materialQuantity.text(qty)
      self.$el.materialQuantityUnit.text(isPlastic ? '支' : 'KG')
    }

    add() {
      /**
       * 1. 取得目前是綁定或未綁定的物料
       * 2. 取得要變動的TableData
       * 3. 取得selectedRow
       * 4. 迭代selectedRow
       * 5. put 項次 / isNew / isBind 進一筆筆data
       * 6. 轉移一筆筆data
       * 7. render兩個Table
       */
      const self = this
      const dtApi = self.assignableMaterialTable.rt.table
      const isBind = self.$el.modal
        .find(`.material-to-assign.active`)
        .data('bind')
      const selectedRow = self.assignableMaterialTable.getSelectedRow(
        self.$el.assignableMaterialTable
      )
      const rowDatas = []
      let assignedMatTotalQty = 0
      let isPlastic = false
      // TODO: 若新增的物料有塑膠有金屬會有問題
      if (self.validateUsePiece(selectedRow)) {
        selectedRow.forEach((tr, i) => {
          const td = dtApi.cell(tr, 'use_piece:name').node()
          const rowApi = dtApi.row(tr)
          const rowData = rowApi.data()
          const use_piece = td.querySelector('[type=text]').value
          const isCollectAll = td.querySelector('[name=is_collect_all]').checked
          const use_remark = isCollectAll ? '儲位全領' : ''
          // 儲位全領直接用庫存數減去鎖定數，非儲位全領才需要從支數計算重量(如果是塑膠料就沒有單支重量，領用重量等於領用支數)
          const use_qty = isCollectAll
            ? rowData.mstock_qty - (rowData.lock_qty || 0)
            : rowData.p_weight
            ? (use_piece * Number(rowData.p_weight)).round(2)
            : Number(use_piece)
          isPlastic = isPlastic || rowData.unit === '支'
          assignedMatTotalQty += use_qty
          if (isBind) {
            self.bindedAssignableMaterial.forEach((data) => {
              if (
                data.shelf_time === rowData.shelf_time &&
                data.mat_code === rowData.mat_code
              ) {
                data.isAssign = true
              }
            })
          } else {
            self.unbindAssignableMaterial.forEach((data) => {
              if (
                data.shelf_time === rowData.shelf_time &&
                data.mat_code === rowData.mat_code
              ) {
                data.isAssign = true
              }
            })
          }
          _.extend(rowData, {
            isAssign: true,
            use_piece,
            use_remark,
            use_qty,
            no: self.materialToAssignNumber++,
            isNew: true,
            isBind,
          })
          rowDatas.push(rowData)
        })
        self.tempMaterialToAssignData.insert.push(...rowDatas)
        self.materialToAssignTable.rt.table.rows.add(rowDatas).draw(false)
        self.changeAssignableMaterialTableTab(null, isBind)

        self.assignedMatTotalQty += assignedMatTotalQty
        self.changeTotalQuantityText(
          self.assignedMatTotalQty.toFixed(2),
          isPlastic
        )
      }
    }
    saveMaterialAssignment() {
      const self = this
      if (self.config.isCreate) {
        const { rowData, tr } = self.$el.modal.data()
        const { order_id, machine_id, wo_m_time } = rowData
        const { isSupplement } = self.config
        const rework_size = self.$el.isRework[0].checked
          ? self.$el.reworkSize.val()
          : ''
        const dateTimeCols = ['mstock_time', 'shelf_time']

        // 擋住tempMaterialToAssignData.insert.length = 0 (可能勾了但沒有按派工，isCreate === true時)
        if (
          self.tempMaterialToAssignData.insert.length &&
          self.validateReworkSize()
        ) {
          servkit.ajax(
            {
              url: 'api/huangliangMatStock/wo_m_mat',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                order_id,
                machine_id,
                type: isSupplement ? 2 : 1,
                wo_m_time: wo_m_time.toFormatedDatetime(),
                rework_size,
                materials: self.tempMaterialToAssignData.insert.map((mat) =>
                  _.mapObject(mat, (value, key) =>
                    dateTimeCols.includes(key)
                      ? value.toFormatedDatetime()
                      : value
                  )
                ),
              }),
            },
            {
              success(data) {
                if (
                  self.config.onCreate &&
                  _.isFunction(self.config.onCreate)
                ) {
                  // draw queryResultTable
                  self.config.onCreate(tr)
                }
                self.$el.modal.modal('hide')
              },
            }
          )
        }
      } else {
        const rowData = self.$el.modal.data('rowData')
        const { order_id, machine_id, wo_m_time, m_mat_time, type } = rowData
        const $rework_size = self.$el.modal.find('[name=rework_size]')
        const $is_rework = self.$el.modal.find('[name=is_rework]')
        const rework_size = $is_rework[0].checked ? $rework_size.val() : ''
        const dateTimeCols = ['shelf_time']
        const insertData = self.tempMaterialToAssignData.insert.map((data) => {
          return _.chain(data)
            .pick([
              'shelf_time',
              'location',
              'mat_code',
              'mstock_name',
              'use_piece',
              'use_qty',
              'use_remark',
              'po_no',
              'sup_id',
            ])
            .mapObject((value, key) =>
              dateTimeCols.includes(key) ? value.toFormatedDatetime() : value
            )
        })
        const cancelData = self.tempMaterialToAssignData.cancel
        servkit.ajax(
          {
            // url: 'api/huangliangMatStock/wo_m_mat',
            url: 'api/huangliangMatStock/woMMatList/first-edit',
            // type: 'POST',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              order_id,
              machine_id,
              wo_m_time: wo_m_time.toFormatedDatetime(),
              m_mat_time: m_mat_time.toFormatedDatetime(),
              cancel: cancelData,
              insert: insertData,
            }),
          },
          {
            success(data) {
              self.materialToAssignTable.rt.table
                .column('cancel:name')
                .visible(false)
              self.tempMaterialToAssignData = {
                insert: [],
                cancel: [],
              }
              self.materialToAssignNumber = 1
              self.matAssignmentRecord = data.map((d) =>
                _.extend(d, { no: self.materialToAssignNumber++ })
              )
              self.materialToAssignTable.rt.drawTable(self.matAssignmentRecord)
              // 若是cancelData.length > 0 ，檢查(未)綁定的資料有沒有一樣的，把isAssign改回false
              if (cancelData.length) {
                const assignmentRecordPks = _.map(
                  self.matAssignmentRecord,
                  (value) => _.pick(value, ['shelf_time', 'mat_code'])
                )
                // 還原已被綁過的物料
                self.bindedAssignableMaterial = self.getBindableMaterial(
                  self.bindedAssignableMaterial,
                  assignmentRecordPks
                )
                self.unbindAssignableMaterial = self.getBindableMaterial(
                  self.unbindAssignableMaterial,
                  assignmentRecordPks
                )
              }
              self.changeAssignableMaterialTableTab(null, true)
              self.$el.modal.removeClass('edit')
            },
          }
        )
      }
    }
    delete(btn) {
      /**
       * 1. 若isBind === true，拿掉此data，塞入bindedAssignableMat
       * 2. 若isBind === false，檢查mat_code與目前input[name=mat_code]的值是否一樣，若一樣才塞回unbindAssignableMat，最後拿掉此data
       * 3. render兩個table
       */
      const self = this
      const tr = btn.closest('tr')
      const dtApiRow = self.materialToAssignTable.rt.table.row(tr)
      const rowData = dtApiRow.data()
      const { isBind, shelf_time, mat_code, no, use_qty } = rowData
      const tableData = isBind
        ? self.bindedAssignableMaterial
        : self.unbindAssignableMaterial
      const currentSearchingMatCode = self.$el.matCode.val()
      self.assignedMatTotalQty -= use_qty
      self.$el.materialQuantity.text(self.assignedMatTotalQty.toFixed(2))
      if (isBind || (!isBind && currentSearchingMatCode === mat_code)) {
        tableData.forEach((data) => {
          if (data.shelf_time === shelf_time && data.mat_code === mat_code) {
            data.isAssign = false
          }
        })
        self.changeAssignableMaterialTableTab(null, isBind)
      }
      self.tempMaterialToAssignData.insert = self.tempMaterialToAssignData.insert.filter(
        (data) => {
          return !(data.shelf_time === shelf_time && data.mat_code === mat_code)
        }
      )

      // delete warning msg(if exist)
      const table = self.materialToAssignTable.rt.table
      // const warnings = self.materialToAssignTable.warnings;
      table
        .rows()
        .indexes()
        .each((i) => {
          const row = table.row(i)
          const rowData = row.data()
          const noCurr = rowData.no
          // const warning = warnings[noCurr];
          if (noCurr > no) {
            table.cell(i, 'no:name').data(noCurr - 1)
            // if (warning) {
            //   warning.minusNo();
            // }
          }
          // else if (noCurr === no && warning) {
          //   warning.$el.remove();
          // }
        })
      self.materialToAssignTable.resetGroupedData()
      self.materialToAssignNumber--
      // warnings.splice(no, 1);
      dtApiRow.remove().draw(false)
    }
    // 只有修改紀錄才有的行為
    cancel(btn) {
      /**
       * 取消已派工的單(只有在 開立狀態:0 才可執行)
       * 1. data加入屬性 isCancel: true
       * 2. render row
       */
      const self = this
      const tr = btn.closest('tr')
      const rowApi = self.materialToAssignTable.rt.table.row(tr)
      const rowData = rowApi.data()
      rowApi.data(_.extend({ isCancel: true }, rowData)).draw(false)
      self.tempMaterialToAssignData.cancel.push(
        rowData.shelf_time.toFormatedDatetime()
      )
    }
    edit() {
      /**
       * 1. init requestBody
       * 2.
       */
      const self = this
      self.$el.modal.addClass('edit')
      self.materialToAssignTable.rt.table.column('cancel:name').visible(true)
      self.tempMaterialToAssignData = {
        cancel: [],
        insert: [],
      }
      self.$el.matCode.prop('disabled', false)
      self.$el.isRework.prop('disabled', false)
      self.$el.reworkSize.prop('disabled', false)
    }
    cancelEdit() {
      /**
       * 1. 有isCancel的data去掉此屬性
       * 2. 有isNew的data，檢查是否有isBind
       * 3. 若isBind === true，拿掉此data，塞入bindedAssignableMat
       * 4. 若isBind === false，檢查mat_code與目前input[name=mat_code]的值是否一樣，若一樣才塞回unbindAssignableMat，最後拿掉此data
       * 5. render兩個table
       */
      const self = this
      self.$el.modal.removeClass('edit')
      self.undo()
      self.materialToAssignTable.rt.table.column('cancel:name').visible(false)
      self.$el.matCode.prop('disabled', true)
      self.$el.isRework.prop('disabled', true)
      self.$el.reworkSize.prop('disabled', true)
    }
    getBindableMaterial(bindableMaterial, assignmentRecordPks) {
      const self = this
      return bindableMaterial
        .filter((data) => (data.stock_piece || 1) - (data.lock_piece || 0) > 0)
        .map((data) => {
          const { shelf_time, mat_code } = data
          let isAssign = false
          for (let pks of assignmentRecordPks) {
            if (pks.shelf_time === shelf_time && pks.mat_code === mat_code) {
              isAssign = true
            }
          }
          return _.extend(data, { isAssign })
        })
    }
  }
  const initMaterialAssign = (config, commons, preCon) =>
    new MaterialAssign(config, commons, preCon)
  if (exports) {
    exports.initMaterialAssign = initMaterialAssign
  } else {
    global.initMaterialAssign = initMaterialAssign
  }
})(window, typeof exports === 'undefined' ? null : exports)
