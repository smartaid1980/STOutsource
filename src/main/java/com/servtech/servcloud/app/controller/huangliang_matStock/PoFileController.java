package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.controller.huangliang_matStock.util.RecordAfter;
import com.servtech.servcloud.app.controller.huangliang_matStock.util.WeightPieceConverter;
import com.servtech.servcloud.app.model.huangliang_matStock.MatStock;
import com.servtech.servcloud.app.model.huangliang_matStock.PoFile;
import com.servtech.servcloud.app.model.huangliang_matStock.PoTempStock;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/huangliangMatStock/poFile")
public class PoFileController {
    private static final Logger log = LoggerFactory.getLogger(PoFileController.class);

    @Autowired
    private HttpServletRequest request;

    // 材料入庫
    @RequestMapping(value = "inStock", method = RequestMethod.POST)
    public RequestResult<?> inStock(@RequestBody Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                // 依照入庫時間及廠商編號產生MRP批號(入庫時間日期加廠商編號)(PO_TEMP_STOCK& MAT_STOCK皆需存入)
                SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd");
                String mrp_bcode = df.format(new Date()) + data.get("sup_id").toString();
                data.put("mrp_bcode", mrp_bcode);

                PoTempStock poTempStock = PoTempStock.findByCompositeKeys(
                        data.get("mstock_name").toString(),
                        data.get("po_no").toString(),
                        data.get("sup_id").toString(),
                        data.get("mat_code").toString(),
                        data.get("location").toString(),
                        data.get("shelf_time").toString());
                if (poTempStock == null) {
                    return RequestResult.fail("Can't find po_temp_stock.mrp_bcode with" + data.toString() + ".");
                }

                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Long now = System.currentTimeMillis();
                RecordAfter.putCreateAndModify(data, login_user, now);
                poTempStock.set("mstock_time", new java.sql.Timestamp(now))
                        .set("mstock_by", login_user)
                        .set("mstock_qty", poTempStock.get("shelf_qty"))
                        .set("status", 4) // 已入庫
                        .set("mrp_bcode", mrp_bcode);
                if (!poTempStock.saveIt()) {
                    return RequestResult.fail("Update po_temp_stock failed.");
                }

                Map pts = poTempStock.toMap();
                data.putAll(pts);
                //若檢查驗料項目-外徑iqc_od內容為NG，則庫存表記錄暫入外徑=暫入記錄外徑檢驗值(MAT_STOCK.temp_od=PO_TEMP_STOCK.iqc_od_val)
                //若檢查驗料項目-長度iqc_length內容為NG，則庫存表記錄暫入長度=暫入記錄長度檢驗值(MAT_STOCK.temp_length= PO_TEMP_STOCK.iqc_length_val)
                if (poTempStock.get("iqc_result").toString().equals("NG")) {
                    data.put("temp_od", poTempStock.getString("iqc_od_val"));
                    data.put("temp_length", poTempStock.getString("iqc_length_val"));
                }

                if (poTempStock.get("unit").toString().equals("KG")) { // 如果是金屬才換算
                    WeightPieceConverter converter = new WeightPieceConverter(data.get("mat_code").toString());
                    double length = Double.parseDouble(poTempStock.getString("mat_length").replaceAll("m", "").replaceAll("M", ""));
                    int piece = converter.qtyToPiece(poTempStock.getDouble("shelf_qty"), length);
                    data.put("stock_piece", piece);
                } else { // 如果是塑膠
                    data.put("stock_piece", data.get("mstock_qty"));
                }
                log.info(data.toString());

                MatStock matStock = new MatStock();
                matStock.fromMap(data);
                if (matStock.insert()) {
                    // 加總入庫數量到採購單累計入庫數量(PO_FILE.pass_qty)
                    int count = PoFile.update("pass_qty=pass_qty+?, shelf_qty=shelf_qty-?", "mstock_name=? and po_no=? and sup_id=? and mat_code=?",
                            data.get("mstock_qty").toString(),
                            data.get("mstock_qty").toString(),
                            data.get("mstock_name").toString(),
                            data.get("po_no").toString(),
                            data.get("sup_id").toString(),
                            data.get("mat_code").toString());
                    if (count > 0) {
                        return RequestResult.success("入庫成功");
                    } else {
                        return RequestResult.fail("更新採購單入庫數量失敗");
                    }
                } else {
                    return RequestResult.fail("入庫失敗");
                }
            }
        });
    }
}
