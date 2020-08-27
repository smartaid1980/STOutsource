package com.servtech.servcloud.app.controller.servtrack;

import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.servtrack.ServtrackManagementLineController.QRcodeService;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import com.servtech.servcloud.app.model.servtrack.view.WorkOpView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.lang.reflect.Type;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Raynard on 2017/6/22.
 */
@RestController
@RequestMapping("/servtrack/workop")
public class ServtrackWorkOpController {
    private static final Logger log = LoggerFactory.getLogger(ServtrackWorkOpController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/getworks", method = GET)
    public RequestResult<List<Map>> getWorks(@RequestParam("startDate") final String startDate,
                                         @RequestParam("endDate") final String endDate,
                                         @RequestParam("workId") final String workId,
                                         @RequestParam("productId") final String productId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT ");
                sb.append("works.work_id, ");
                sb.append("works.product_id, ");
                sb.append("works.e_quantity, ");
                sb.append("works.input, ");
                sb.append("works.status_id, ");
                sb.append("work_op.op, ");
                sb.append("work_op.qrcode_op, ");
                sb.append("work_op.remark, ");
                sb.append("work_op.is_open, ");
                sb.append("work_op.create_by, ");
                sb.append("work_op.create_time, ");
                sb.append("process.process_code, ");
                sb.append("process.process_name, ");
                sb.append("product.product_name, ");
                sb.append("work_op.std_hour, ");
                sb.append("users.user_name ");
                sb.append("FROM ");
                sb.append("a_servtrack_work AS works, ");
                sb.append("a_servtrack_work_op AS work_op, ");
                sb.append("a_servtrack_process AS process, ");
                sb.append("a_servtrack_product AS product, ");
                sb.append("m_sys_user AS users ");
                sb.append("WHERE ");
                sb.append("works.work_id = work_op.work_id  ");
                sb.append("AND ");
                sb.append("work_op.process_code = process.process_code ");
                sb.append("AND ");
                sb.append("works.product_id = product.product_id ");
                sb.append("AND ");
                sb.append("works.create_by = users.user_id ");

                sb.append("AND ");
                sb.append("works.create_time BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' ");
                if (!workId.equals("") && !workId.isEmpty()) {
                    sb.append("AND ");
                    sb.append("works.work_id = '" + workId + "' ");
                }
                if (!productId.equals("") && !productId.isEmpty()) {
                    sb.append("AND ");
                    sb.append("works.product_id = '"+ productId +"' ");
                }
                sb.append("AND ");
                sb.append("works.status_id not IN('2','9')");
                System.out.println(sb.toString());
                List<Map> result = Base.findAll(sb.toString());
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                for (Map map : result) {
                    map.put("create_time", sdf.format(map.get("create_time")));
                }
                return success(TrackCalcUtil.compareOpOrder(result));

            }
        });
    }

    @RequestMapping(value = "/getworkop", method = GET)
    public RequestResult<List<Map>> getWorkOp(@RequestParam("workId") final String workId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> workOps = WorkOp.find("work_id=?", workId).toMaps();
                for(Map workOp : workOps) {//自建pks給Hubert的crudtable使用
                    Map pks = new HashMap();
                    pks.put("work_id", workOp.get("work_id"));
                    pks.put("op", workOp.get("op"));
                    workOp.put("pks", pks);
                }
                return success(TrackCalcUtil.compareOpOrder(workOps));
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<Map> create(@RequestBody final Map data) {
        final Map msg = new HashMap();
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<Map>>() {
                @Override
                public RequestResult<Map> operate() {
                    data.put("qrcode_op", UUID.randomUUID().toString().replace("-", ""));
                    data.put("is_open", "Y");
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    WorkOp workOp = new WorkOp();
                    workOp.fromMap(data);
                    Map result = new HashMap();
                    result.put("op", data.get("op"));
                    result.put("work_id", data.get("work_id"));
                    if (workOp.insert()) {
                        return success(result);
                    } else {
                        msg.put("create status", "create fail, plz check....");
                        return fail(msg);
                    }
                }
            });
        } catch (Exception e) {
            msg.put("create status", e.getMessage());
            return fail(msg);
        }
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {

                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                WorkOp workOp = new WorkOp();
                workOp.fromMap(data);


                if (workOp.saveIt()) {
                    return success(workOp.getString("work_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<String> delete(@RequestBody final Object[] opList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    System.out.println(new Gson().toJson(opList));
                    int deleteSize = opList.length;
                    for (int count = 0; count < deleteSize; count++) {
                        Map pks = (Map) opList[count];
                        int deleteAmount = WorkOp.delete("work_id = ? AND op = ?",
                                pks.get("work_id"), pks.get("op"));
                    }
                    return success();
                } catch (Exception e) {
                    e.printStackTrace();
                    log.warn("delete fail: ", e.getMessage());
                    return fail(e.getMessage());
                }
            }
        });
    }

    @RequestMapping(value = "/printQRCode", method = POST)
    public void printQRCode(@RequestParam("works") final String jsonStr,
                            @RequestParam("uuid") final String uuid) {
        final List<WorkOpParam> paramsList = new ArrayList<WorkOpParam>();
        Type type =  new TypeToken<Map<String, List<String>>>(){}.getType();
        Map<String, List<String>> mapList = new Gson().fromJson(jsonStr, type);
        Map<String, List<String>> resultMap = new HashMap<String, List<String>>();
        for (Map.Entry<String, List<String>> entry : mapList.entrySet()) {
//            try {
//                System.out.println(entry.getKey());
//                resultMap.put(URLEncoder.encode(entry.getKey(), "UTF-8"), entry.getValue());
                resultMap.put(entry.getKey(), entry.getValue());
//            } catch (UnsupportedEncodingException e) {
//                e.printStackTrace();
//            }
        }
        for (Map.Entry<String, List<String>> entry : resultMap.entrySet()) {
            paramsList.add(new WorkOpParam(entry.getKey(), entry.getValue()));
        }

         ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {

             @Override
             public RequestResult<Void> operate() {
                 List<WorkOpView> resultMap = WorkOpView.where(sqlSplitBy("OR ", paramsList), getLinkVal(paramsList));
                 if (resultMap.size() > 0) {
                     final int MAX_COUNT = 33;
                     XWPFDocument document = null;
                     String modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/form.docx";
                     final String outputFolder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/" + uuid;
                     if (!new File(outputFolder).exists()) {
                         new File(outputFolder).mkdirs();
                     }

                     try {
                         int pageCount = 0;
                         FileInputStream input = new FileInputStream(modelPath);
                         FileInputStream imgInput = null;
                         document = new XWPFDocument(input);
                         XWPFTable module = document.getTables().get(0);
                         FileOutputStream output = new FileOutputStream(outputFolder + "/" + uuid + ".docx");
                         if (resultMap.size() > MAX_COUNT) {
                             pageCount = getPageCount(resultMap.size());
                             for (int i = 0; i < pageCount; i++) {
                                 document.createTable();
                                 document.setTable((i + 1), module);
                             }
                             document.write(output);
                             output.close();
                             input.close();
                             input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                             document = new XWPFDocument(input);
                         }
                         int tableIndex = 0;
                         int rowIndex = 0;
                         int cellIndex = 0;
                         List<XWPFTable> tableList = document.getTables();
                         XWPFTable table = null;
                         XWPFTableCell cell = null;
                         XWPFParagraph paragraph = null;
                         XWPFRun r = null;

                         for (int i = 0; i < resultMap.size(); i++) {
                             WorkOpView workOp = resultMap.get(i);
                             table = tableList.get(tableIndex);
                             String work_id = workOp.get("work_id").toString();
                             String product_name = workOp.get("product_name").toString();
                             String op = workOp.get("op").toString();
                             String process_name = workOp.get("process_name").toString();
                             String qrcode_op = workOp.get("qrcode_op").toString();
                             String content = op + ", " + process_name;
                             String imgPath = outputFolder + "/" + i + ".png";
                             QRcodeService.create(qrcode_op, imgPath);
                             cell = table.getRow(rowIndex).getCell(cellIndex);
                             paragraph = cell.getParagraphs().get(0);
                             r = paragraph.createRun();
                             imgInput = new FileInputStream(imgPath);
                             r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(68.2), Units.toEMU(68.2));
                             imgInput.close();
                             cell = table.getRow(rowIndex).getCell(cellIndex += 1);
                             cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
                             paragraph = cell.getParagraphs().get(0);
                             r = paragraph.createRun();
                             r.setFontSize(8);
                             r.addBreak();
                             r.setText(work_id);
                             r.addBreak();
                             r.setText(product_name);
                             r.addBreak();
                             r.setText(content);

                             if (cellIndex == 5) {
                                 if (rowIndex == 10) {
                                     tableIndex++;
                                     rowIndex = 0;
                                     cellIndex = 0;
                                 } else {
                                     rowIndex++;
                                     cellIndex = 0;
                                 }
                             } else {
                                 cellIndex++;
                             }
                         }
                         SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");

                         String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                         String headerKey = "Content-Disposition";
                         String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".docx\"";

                         response.setContentType(mimeType);
                         response.setHeader(headerKey, headerValue);
                         ServletOutputStream out = response.getOutputStream();
                         document.write(out);
                         output.close();
                         out.flush();
                         out.close();
                         input.close();
                         imgInput.close();

                         File path = new File(outputFolder);
                         if (path.isDirectory()) {
                             for (File file : path.listFiles()) {
                                 file.delete();
                             }
                             path.delete();
                         }
                     } catch (FileNotFoundException e) {
                         e.printStackTrace();
                     } catch (IOException e) {
                         e.printStackTrace();
                     } catch (InvalidFormatException e) {
                         e.printStackTrace();
                     }


                 }
                 return success();
             }
         });


    }

    static int getPageCount (int size) {
        int result = size / 33 ;
        if (size% 33 == 0) {
            result -=1;
        }
        return result;
    }


    static class WorkOpParam {
        private String work_id;
        private List<String> opList;

        WorkOpParam(String s1, List<String> list) {
            this.work_id = s1;

            this.opList = new ArrayList<String>();
            for (String s : list) {
                opList.add(s);
            }
        }

        String sqlParamStr () {
            StringBuilder sb = new StringBuilder();
            sb.append("( work_id=?");
            sb.append("AND op IN ");
            sb.append(strSplitBy(",", opList));
            sb.append(" )");
            return sb.toString();
        }

        String strSplitBy(String splitter, List<String> list) {
            String sep = "";
            StringBuilder sb = new StringBuilder("( ");

            for (String s : list) {
                sb.append(sep);
                sb.append("?");
                sep = splitter;
            }
            sb.append(" ) ");

            return sb.toString();

        }
    }

    String sqlSplitBy(String splitter, List<WorkOpParam> list) {
        String seq = "";
        StringBuilder sb = new StringBuilder();
        for (WorkOpParam workOpParam : list) {
            sb.append(seq);
            sb.append(workOpParam.sqlParamStr());
            seq = splitter;
        }
        return sb.toString();
    }

    String[] getLinkVal(List<WorkOpParam> paramsList) {
        LinkedList<String> linkedList = new LinkedList<String>();
        for (WorkOpParam workOpParam : paramsList) {
//            String work_id = enCodeAnddeCode(workOpParam.work_id);
            linkedList.add(workOpParam.work_id);
            for (String s : workOpParam.opList) {
//                String op = enCodeAnddeCode(s);
                linkedList.add(s);
            }
        }
        return linkedList.toArray(new String[0]);
    }

    
}
