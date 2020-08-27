package com.servtech.servcloud.app.controller.ennoconn;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.app.controller.storage.util.QRCodeImpl;
import com.servtech.servcloud.app.controller.storage.util.SQRCode;
import com.servtech.servcloud.app.controller.storage.util.XLQRCode;
import com.servtech.servcloud.core.util.*;
import com.servtech.servcloud.app.model.ennoconn.SMTStationDetail;
import com.servtech.servcloud.app.model.storage.BillStockOutMain;
import com.servtech.servcloud.app.model.storage.StorePosition;
import com.servtech.servcloud.app.model.strongLED.BillStockOutDetail;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.sun.jna.Library;
import com.sun.jna.Native;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.lang.reflect.Type;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.app.controller.ennoconn.TSCQRCodeController.checkTSCStatus;
import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/ennoconn/smt")
public class SMTController {
    private static final Logger LOG = LoggerFactory.getLogger(SMTController.class);
    private static Gson gson = new Gson();
    private static SimpleDateFormat yyyyMMddHHmmss = new SimpleDateFormat("yyyyMMddHHmmss");

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "device/qrcode-by-tsc", method = RequestMethod.GET)
    public RequestResult<?> printQrcodeByTSC(@RequestParam("print_info") String jsonInfo,
                                 @RequestParam("key_order[]") String[] key_order,
                                 @RequestParam(value = "delimiter", required = false) String delimiter,
                                 @RequestParam(value = "prefix", required = false) String prefix) {

        return ActiveJdbc.operTx(() -> {

            Type type = new TypeToken<List<Map<String, String>>>() {
            }.getType();
            System.out.println("jsonInfo : " + jsonInfo);
            List<Map<String, String>> infos = gson.fromJson(jsonInfo, type);
            String prefixDelimiter = "@@";
            Boolean hasPrefix = prefix != null;

            List<Map<String, String>> fileContentList = new ArrayList<>();
            for (int i = 0; i < infos.size(); i++) {
                Map<String, String> map = infos.get(i);
                StringJoiner sj = new StringJoiner(delimiter);
                String codeStr;
                String codeStrWithPrefix;
                for (String key : key_order) {
                    sj.add(map.get(key));
                }
                codeStr = sj.toString();
                if (hasPrefix) {
                    codeStrWithPrefix = prefix + prefixDelimiter + codeStr;
                } else {
                    codeStrWithPrefix = codeStr;
                }
                Map<String, String> fileContent = new HashMap<>();
                fileContent.put(codeStrWithPrefix, codeStr);
                fileContentList.add(fileContent);
            }
            //怕有運算的時間差，所以處理好後，產生temp_code檔案前在檢查
            String temp_code_file_name = checkTSCStatus();
            if (temp_code_file_name != null) {
                return RequestResult.fail(temp_code_file_name);
            }

            temp_code_file_name = writeFileAndCallCMD(gson.toJson(fileContentList), "device");
            if(temp_code_file_name == null){
                return RequestResult.fail("CMD fail..");
            }
            return RequestResult.success(temp_code_file_name);
        });

    }

    static String writeFileAndCallCMD(String content, String type) {
        String temp_code_file_name = type +"_"+ yyyyMMddHHmmss.format(new Date()) + ".json";

        String TSCPrinterPath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/TSCPrinter/temp_code";
        File folder = new File(TSCPrinterPath);
        if (!folder.exists()) {
            folder.mkdir();
        }
        File temp_code_file = new File(TSCPrinterPath, temp_code_file_name);
        BufferedWriter bf = null;
        try {
            FileOutputStream writerStream = new FileOutputStream(temp_code_file);
            bf = new BufferedWriter(new OutputStreamWriter(writerStream, "UTF-8"));
            bf.write(content);
            bf.close();
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            if(bf != null) {
                try {
                    bf.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                String[] commands = new String[]{"cmd", "/c", "start", "run.bat"};
                String commandPath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/TSCPrinter";
                RunCmd runCmd = new RunCmd(commands, null, new File(commandPath));
                runCmd.execAndReturn();
            }
        };
        new Thread(runnable).start();
        return temp_code_file_name;
    }

    @RequestMapping(value = "device/qrcode", method = RequestMethod.GET)
    public void genQRCodeDoc(@RequestParam("print_info") String jsonInfo,
                             @RequestParam("key_order[]") String[] key_order,
                             @RequestParam(value = "delimiter", required = false) String delimiter,
                             @RequestParam("size") String size,
                             @RequestParam(value = "prefix", required = false) String prefix) {

        ActiveJdbc.operTx(() -> {
            //雖說有三種size，但樺漢只用鶴屋標籤紙(3*11)，所以前端只會給Std
            QRCodeImpl QRCode = null;
            switch (size) {
                case "S":
                    QRCode = new SQRCode();
                    break;
                case "Std":
                    QRCode = new QRCodeImpl();
                    break;
                case "XL":
                    QRCode = new XLQRCode();
                    break;
                default:
                    QRCode = new QRCodeImpl();
            }
            Type type = new TypeToken<List<Map<String, String>>>() {
            }.getType();
            System.out.println("jsonInfo : " + jsonInfo);
            List<Map<String, String>> infos = new Gson().fromJson(jsonInfo, type);
            String prefixDelimiter = "@@";
            Boolean hasPrefix = prefix != null;
            QRCode.genDoc(infos.size());

            for (int i = 0; i < infos.size(); i++) {
                Map<String, String> map = infos.get(i);
                StringJoiner sj = new StringJoiner(delimiter);
                String codeStr;
                String codeStrWithPrefix;
                for (String key : key_order) {
                    sj.add(map.get(key));
                }
                codeStr = sj.toString();
                if (hasPrefix) {
                    codeStrWithPrefix = prefix + prefixDelimiter + codeStr;
                } else {
                    codeStrWithPrefix = codeStr;
                }

                QRCode.addImg(i, codeStrWithPrefix); // 一定要比 addFiffSizeTexts 先執行
                QRCode.addDiffSizeTexts("big", codeStr);
                QRCode.next();
            }
            QRCode.write(response);
            QRCode.delete();
            return null;
        });

    }

    @RequestMapping(value = "/create-main-and-detail-by-smt", method = RequestMethod.POST)
    public RequestResult<?> createBillStockOutMainDetailBySMT(@RequestBody Map data) {
        Optional<String> stock_out_date = Optional.of(data.get("stock_out_date").toString());
        Optional<String> ware_id = Optional.of(data.get("ware_id").toString());
        Optional<String> material_pca = Optional.of(data.get("material_pca").toString());
        Optional<String> line = Optional.of(data.get("line").toString());
        Optional<String> version = Optional.of(data.get("version").toString());
        Optional<Double> work_qty = Optional.of(Double.valueOf(data.get("work_qty").toString()));
        Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        String smt_stn_id = material_pca.get() + "|" + line.get() + "|" + version.get();
        return ActiveJdbc.operTx(() -> {
            try {
                Long currentTime = getTimeLongFormat();
                Base.openTransaction();
                data.put("bill_no", createBillNo());
//                data.put("bill_date", new Date());
                data.put("bill_date", new SimpleDateFormat("yyyyMMdd").format(new Date()));
                data.put("create_by", user);
                data.put("create_time", currentTime);
                data.put("modify_by", user);
                data.put("modify_time", currentTime);
                BillStockOutMain billStockOutMain = new BillStockOutMain();
                billStockOutMain.fromMap(data);
                billStockOutMain.set(
                        "column_1", data.get("work_id"),
                        "remark", material_pca.get(),
                        "column_2", work_qty.get(),
                        "column_3", user,
                        "column_4", line.get(),
                        "smt_stn_id", smt_stn_id,
                        "status", 0
                );
                if (!billStockOutMain.insert())
                    throw new RuntimeException("insert billStockOutMain fail...");

                List<SMTStationDetail> smtStationDetailList = SMTStationDetail.find("smt_stn_id = ?", smt_stn_id);
                if (smtStationDetailList == null || smtStationDetailList.size() == 0)
                    return fail("找不到對應的料站表明細..");
                int serialNumber = 0;
                for (SMTStationDetail smtStationDetail : smtStationDetailList) {
                    serialNumber++;
                    StringBuffer smtDetailPks = new StringBuffer();
                    smtDetailPks.append(smt_stn_id);
                    smtDetailPks.append("|");
                    smtDetailPks.append(smtStationDetail.getString("machine"));
                    smtDetailPks.append("|");
                    smtDetailPks.append(smtStationDetail.getString("track"));
                    smtDetailPks.append("|");
                    smtDetailPks.append(smtStationDetail.getString("sub_track"));

                    BillStockOutDetail billStockOutDetail = new BillStockOutDetail();
                    billStockOutDetail.fromMap(data);
                    billStockOutDetail.set(
                            "bill_detail", String.format("%03d", serialNumber),
                            "material_id", smtStationDetail.getString("material_id"),
                            "material_sub", "0000",
                            "quantity", work_qty.get() * smtStationDetail.getDouble("qty_pcs"),
                            "column_1", work_qty.get(),
                            "column_2", smtStationDetail.getDouble("qty_pcs"),
                            "column_3", 0,
                            "smt_detail_pks", smtDetailPks.toString(),
                            "out_qty", 0,
                            "status", 0
                    );
                    if (!billStockOutDetail.insert())
                        throw new RuntimeException("insert billStockOutDetail fail...");
                }
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return fail(e.getMessage());
            }
            Base.commitTransaction();
            data.put("column_3", user);
            data.put("status", 0);
            return success(data);
        });
    }

    private Object createBillNo() {
        String newBillNo = "SMT_" + new SimpleDateFormat("yyyyMMdd").format(new Date());
        List<BillStockOutMain> billStockOutMainList = BillStockOutMain.find("bill_no like '" + newBillNo + "%' order by bill_no desc");
        if (billStockOutMainList == null || billStockOutMainList.size() == 0)
            return newBillNo + "_001" + String.format("%03d", new Random().nextInt(999) + 1);
        int serialNumber = Integer.valueOf(billStockOutMainList.get(0).getString("bill_no").split("_")[2].substring(0, 3)) + 1;
        return newBillNo + String.format("_%03d%03d", serialNumber, new Random().nextInt(999) + 1);
    }

    public static long getTimeLongFormat() {
        long timeMillis = System.currentTimeMillis();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
        Date date = new Date(timeMillis);
        return Long.parseLong(dateFormat.format(date));
    }
}
