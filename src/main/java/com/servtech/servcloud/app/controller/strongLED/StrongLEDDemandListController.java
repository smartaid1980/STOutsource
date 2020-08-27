package com.servtech.servcloud.app.controller.strongLED;


import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.servtech.servcloud.app.model.strongLED.*;
import com.servtech.servcloud.app.model.strongLED.view.RfqList;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.sql.DatabaseJdbc;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.ColumnMetadata;
import org.javalite.activejdbc.LazyList;
import org.javalite.activejdbc.MetaModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.Date;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.module.controller.HippoController.log;


@RestController
@RequestMapping("/strongled")
public class StrongLEDDemandListController {
    private static List<Map> queryMaterial = null;
    private static final Logger logger = LoggerFactory.getLogger(StrongLEDDemandListController.class);
    private static SimpleDateFormat sdf = new SimpleDateFormat("YYYY-MM-dd HH:mm:ss");

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    private static final String LOCK = new String();

    @RequestMapping(value = "/material/uniqMtlName", method = RequestMethod.GET)
    public RequestResult<?> getUniqMtlName() {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String querySql = "SELECT className AS mtl_name FROM view_material GROUP BY ClassName";
//                String querySql = "SELECT ProdClass AS mtl_name FROM view_material GROUP BY mtl_name";
                DatabaseJdbc databaseJdbc = new DatabaseJdbc();
                List<String> result = null;

                if (databaseJdbc.connection()) {
                    Connection conn = databaseJdbc.getConn();
                    result = findUniqMtlNameFromMSSql(querySql, conn);
                } else {
                    return fail("connect mssql fail...");
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/material", method = RequestMethod.GET)
    public RequestResult<?> getMaterial(@RequestParam("mtlId") final String mtlId, @RequestParam("mtlName") final String mtlName,
                                        @RequestParam("start") final Integer start, @RequestParam("length") final Integer length
    ) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String querySql = getQueryMtlAndCountSql(mtlId, mtlName, start, length);
                String queryMtlCountSql = getQueryMtlCountSql(mtlId,mtlName);
                DatabaseJdbc databaseJdbc = new DatabaseJdbc();
                Map<String, Object> result = null;

                if (databaseJdbc.connection()) {
                    Connection conn = databaseJdbc.getConn();
                    result = findMaterialsAndTotalCountFromMSSql(querySql,queryMtlCountSql, conn);
                } else {
                    return fail("connect mssql fail...");
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/updateMeterialCurrentPriceByFormId", method = RequestMethod.PUT)
    public RequestResult<?> updateMeterialCurrentPriceByFormId(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            List<Map> materials = null;
            String formId = data.get("form_id").toString();
            String loginUser = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            List<Map> rfqMaterials = RfqMaterial.find("form_id = ?", formId).toMaps();

            DatabaseJdbc databaseJdbc = new DatabaseJdbc();
            Map<String, Object> result = null;
            if (databaseJdbc.connection()) {
                Connection conn = databaseJdbc.getConn();
                materials = queryMaterialsFromMSSql(rfqMaterials, conn);
            } else {
                return fail("connect mssql fail...");
            }
            boolean allPriceIsExist = true;
            double mtlCost = 0;

            for (Map material : materials) {
                String materialId = material.get("mtl_id").toString();
                String erpInfo = material.get("erp_info").toString();
                int updateResult = 0;

                if (material.get("taxed_price") != null) {
                    double taxedPrice = Double.parseDouble(material.get("taxed_price").toString());
                    mtlCost = getMtlCost(formId, mtlCost, materialId, taxedPrice);
                    updateResult = getUpdateMtlPriceResult(formId, loginUser, erpInfo, taxedPrice, materialId);
                } else {
                    updateResult = getUpdateNoMtlPriceResult(formId, loginUser, erpInfo, materialId);
                    allPriceIsExist = false;
                }

                if (updateResult > 0) {
                    logger.info("##RfqMaterial update erp info success : " + materialId);
                } else {
                    logger.info("##RfqMaterial update erp info fail : " + materialId);
                }
            }

            int status = 16;
            Double finalMtlCost = allPriceIsExist == false ? null : mtlCost;
            Timestamp currentTime = new Timestamp(System.currentTimeMillis());


            DemandList dl = DemandList.findFirst("form_id = ?", formId);
            String dlStauts = dl.getString("status");
            String dlQuoteStatus = dl.getString("quote_status");

            RfqStatusLog log = new RfqStatusLog();
            log.set("form_id", formId);
            log.set("changed_status", status);
            log.set("previous_status", dlStauts);
            log.set("previous_quote_status", dlQuoteStatus);
            log.set("create_time", currentTime);
            log.set("create_by", loginUser);

            if (DemandList.update("status=?, mtl_cost=?, modify_by=?, modify_time=?", "form_id=?",
                    status, finalMtlCost, loginUser, currentTime, formId) > 0) {
                if (log.saveIt()) {
                    return success();
                } else {
                    return fail(data);
                }
            } else {
                return fail("DemandList form_id: " + formId + " update is fail...");
            }
        });
    }

    private int getUpdateNoMtlPriceResult(String formId, String login_user, String erpInfo, String materialId) {
        int updateResult;
        updateResult = RfqMaterial.update("erp_info=?, modify_by=?, modify_time=?", "form_id=? AND mtl_id=?",
                erpInfo,
                login_user,
                new Timestamp(System.currentTimeMillis()),
                formId,
                materialId);
        return updateResult;
    }

    private int getUpdateMtlPriceResult(String formId, String login_user, String erpInfo, double taxedPrice, String materialId) {
        int updateResult;
        updateResult = RfqMaterial.update("taxed_price=?, erp_info=?, modify_by=?, modify_time=?", "form_id=? AND mtl_id=?",
                taxedPrice,
                erpInfo,
                login_user,
                new Timestamp(System.currentTimeMillis()),
                formId,
                materialId);
        return updateResult;
    }

    private double getMtlCost(String formId, double mtlCost, String materialId, double taxedPrice) {
        RfqMaterial rfqMaterial = RfqMaterial.findFirst("form_id=? AND mtl_id=?", formId, materialId);
        double stdQty = Double.parseDouble(rfqMaterial.get("std_qty").toString());
        mtlCost += (stdQty * taxedPrice);
        return mtlCost;
    }

    static List<String> findUniqMtlNameFromMSSql(String sql, Connection conn) {
        Statement st = null;
        ResultSet rs = null;
        List<String> result = new ArrayList<>();
        try {
            conn.setAutoCommit(false);
            st = conn.createStatement();
            rs = st.executeQuery(sql);
            while (rs.next()) {
                result.add(rs.getString("mtl_name"));
            }
            rs.close();
            st.close();
        } catch (Exception e) {
            e.printStackTrace();
            try {
                conn.rollback();
            } catch (SQLException e1) {
                e1.printStackTrace();
            }
        } finally {
            try {
                rs.close();
                st.close();
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    static Map<String, Object> findMaterialsAndTotalCountFromMSSql(String queryMtlAndCountSql,String queryMtlCountSql , Connection conn) {

        Long totalRecordsCount = 0L;
        Long totalMtlCount = 0L;
        String queryTotalCountSql = "SELECT COUNT(*)  totalRecordsCount FROM view_material";
        Statement st = null;
        ResultSet rs = null;

        Map<String, Object> result = new HashMap<>();
        try {
            conn.setAutoCommit(false);

            st = conn.createStatement();

            rs = st.executeQuery(queryTotalCountSql);
            while (rs.next()){
                totalRecordsCount = rs.getLong("totalRecordsCount");
            }

            rs = st.executeQuery(queryMtlCountSql);
            while (rs.next()){
                totalMtlCount = rs.getLong("totalMtlCount");
            }

            rs = st.executeQuery(queryMtlAndCountSql);
            List<Map> data = new ArrayList<>();
            while (rs.next()) {
                Map map = new HashMap();
                map.put("mtl_id", rs.getString("ProdID"));
                map.put("mtl_name", rs.getString("ClassName"));
                map.put("spec", rs.getString("ProdName"));
                map.put("unit", rs.getString("Unit"));
                data.add(map);
            }
            result.put("recordsTotal", totalRecordsCount);
            result.put("recordsFiltered", totalMtlCount);
            result.put("data", data);

        } catch (Exception e) {
            e.printStackTrace();
            try {
                conn.rollback();
            } catch (SQLException e1) {
                e1.printStackTrace();
            }
        } finally {
            try {
                if(rs != null){
                    rs.close();
                }
                if(st != null){
                    st.close();
                }
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    static List<Map> queryMaterialsFromMSSql(List<Map> rfqMaterials, Connection conn) {
        Statement st = null;
        ResultSet rs = null;
        try {
            st = conn.createStatement();
            queryMaterial = new ArrayList<>();
            for (Map map : rfqMaterials) {
                Date date = new Date();
                String currentTime = sdf.format(date);
                boolean haveRsult = false;
                String mtlId = map.get("mtl_id").toString();
                String sql = getQueryTop1MtlCostSql(mtlId);

                rs = st.executeQuery(sql);

                while (rs.next()) {
                    Map mtl = new HashMap();
                    String billNo = rs.getString("BillNo");
                    String billDate = rs.getString("BillDate");
                    String price = rs.getString("Price");
                    String erpInfo = getErpInfo(billNo, billDate, currentTime);

                    mtl.put("mtl_id", mtlId);
                    mtl.put("erp_info", erpInfo);
                    mtl.put("taxed_price", price);
                    queryMaterial.add(mtl);
                    haveRsult = true;
                }

                if (!haveRsult) {
                    Map mtl = new HashMap();
                    String erpInfo = "{\"type\":\"1\",\"queryTime\":\"" + currentTime + "\"}";
                    mtl.put("mtl_id", mtlId);
                    mtl.put("erp_info", erpInfo);
                    queryMaterial.add(mtl);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            try {
                conn.rollback();
            } catch (SQLException e1) {
                e1.printStackTrace();
            }
        } finally {
            try {
                rs.close();
                st.close();
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return queryMaterial;
    }

    private static String getErpInfo(String billNo, String billDate, String currentTime) {
        return "{\"type\":\"0\",\"billNo\":\"" + billNo + "\",\"billDate\":\"" + billDate + "\",\"queryTime\":\"" + currentTime + "\"}";
    }

    private static String getQueryMtlAndCountSql(String mtlId, String mtlName, Integer start, Integer length) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT * FROM view_material ");
        sb.append("WHERE prodID IS NOT NULL ");
        if (!mtlId.equals("")) {
            sb.append("AND ");
            sb.append("prodID LIKE '" + mtlId + "%' ");
        }
        if (!mtlName.equals("")) {
            sb.append("AND ");
            sb.append("ClassName = '" + mtlName + "' ");
        }
        sb.append("order by prodID desc OFFSET " + start + " ROWS FETCH NEXT " + length + " ROWS ONLY");
        return sb.toString();
    }

    private static String getQueryMtlCountSql(String mtlId, String mtlName) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT COUNT(*)  totalMtlCount FROM view_material ");
        sb.append("WHERE prodID IS NOT NULL ");
        if (!mtlId.equals("")) {
            sb.append("AND ");
            sb.append("prodID LIKE '" + mtlId + "%' ");
        }
        if (!mtlName.equals("")) {
            sb.append("AND ");
            sb.append("ClassName = '" + mtlName + "' ");
        }
        return sb.toString();
    }

    private static String getQueryTop1MtlCostSql(String mtlId) {
        return "select top 1 * from view_material_cost where ProdID='" + mtlId + "' order by BillDate desc; ";
    }

    @RequestMapping(value = "/createRFQ", method = RequestMethod.POST)
    public RequestResult<?> createRFQ(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            java.sql.Timestamp timestamp = new java.sql.Timestamp(System.currentTimeMillis());

            data.put("create_by", login_user);
            data.put("create_time", timestamp);

            //今天日期
            LocalDate today=LocalDate.now();
            StringBuilder pid = new StringBuilder();
            pid.append("XJ");
            pid.append(String.valueOf(today.getYear()).substring(2,4));
            pid.append(String.format("%02d",today.getMonth().getValue()));
            InquiryContent inquiryContent = new InquiryContent();

            if (InquiryContent.findAll().toMaps().size() >0){
                InquiryContent lastForm_id = InquiryContent.findFirst("ORDER BY form_id Desc ");

                if (lastForm_id.getString("form_id").substring(0,6).equals(pid.toString())){
                    //資料表中有form_id，比對前幾位數
                    int index=Integer.parseInt(lastForm_id.getString("form_id").substring(8))+1;
                    pid.append(String.format("%03d",index));
                }else {
                    //前幾位數不一樣(代表月不同)，新月
                    pid.append("001");
                }
            }else {
                //資料表無任何資料，直接用年月+流水號
                pid.append("001");
            }
            data.put("form_id",pid.toString());
            inquiryContent.fromMap(data);

            if (inquiryContent.insert()) {
                DemandList demandList = new DemandList();
                demandList.fromMap(data);

                ProjectRfq projectRfq = new ProjectRfq();
                projectRfq.fromMap(data);

                if (demandList.insert() && projectRfq.insert()) {
                    RfqStatusLog log = new RfqStatusLog();
                    //String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    //java.sql.Timestamp timestamp = new java.sql.Timestamp(System.currentTimeMillis());

                    log.set("form_id", data.get("form_id"));
                    log.set("changed_status", data.get("status"));
                    log.set("changed_quote_status", data.get("quote_status"));
                    log.set("create_time", timestamp);
                    log.set("create_by", login_user);

                    if (log.saveIt()) {
                        return success(data.get("form_id"));
                    } else {
                        throw new RuntimeException("create log is fail..");
                    }
                } else {
                    throw new RuntimeException("create demandList and projectRfq is fail..");
                }
            } else {
                return fail("create inquiryContent is fail...");
            }
        });
    }

    @RequestMapping(value = "/getsimilarrfq", method = RequestMethod.POST)
    public RequestResult<?> getSimilarRfq(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            return success(getStdProduct(data.get("form_id").toString(), (List<String>) data.get("column")));
        });
    }

    @RequestMapping(value = "/confirmrfq", method = RequestMethod.PUT)
    public RequestResult<?> confirmrfq(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String formId = data.get("form_id").toString();
            DemandList demandList = DemandList.findFirst("form_id=?", formId);
            Map<String, Double> mtlMap = (Map) data.get("mtlMap");
            List<Map> similarRfq = getStdProduct(formId, (List<String>) data.get("column"));
            String is_emc = InquiryContent.findFirst("form_id=?", formId).getString("is_emc");
            int orig_status = demandList.getInteger("status");
            Boolean isStdProduct = similarRfq.size() > 0 && is_emc.equals("否");
            if (isStdProduct) demandList.set("status", 41);
            else demandList.set("status", 6);
            if (demandList.saveIt()) {
                RfqStatusLog log = new RfqStatusLog();
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                log.set("form_id", formId);
                log.set("changed_status", isStdProduct ? 41 : 6);
                log.set("previous_status", orig_status);
                log.set("changed_quote_status", demandList.get("quote_status"));
                log.set("previous_quote_status", demandList.get("quote_status"));
                log.set("create_time", timestamp);
                log.set("create_by", login_user);
                if (log.saveIt()) {
                    if (isStdProduct) {
                        return success();
                    } else {
                        Map<String, Map> bomList = new HashMap<>();
                        for (Map.Entry<String, Double> entry : mtlMap.entrySet()) {
                            Map mat = new HashMap<>();
                            mat.put("std_qty", entry.getValue());
                            mat.put("structure_id", "lamp_bead");
                            bomList.put(entry.getKey(), mat);
                        }
                        Map moduleMap = getModuleList(formId);
                        if (moduleMap != null) {
                            Object[] keys = moduleMap.keySet().toArray();
                            for (Object mId : keys) {
                                String moduleId = mId.toString();
                                Double multiplier = Double.parseDouble(moduleMap.get(moduleId).toString());
                                List<Map> materialModule = MaterialModule.find("module_id=?", moduleId).toMaps();
                                if (materialModule.size() > 0) {
                                    for (Map matOfModule : materialModule) {
                                        String mtlId = matOfModule.get("mtl_id").toString();
                                        if (bomList.containsKey(mtlId)) {
                                            Double orig_qty = Double.parseDouble(bomList.get(mtlId).get("std_qty").toString());
                                            bomList.get(mtlId).put("std_qty", orig_qty + multiplier * Double.parseDouble(matOfModule.get("std_qty").toString()));
                                        } else {
                                            matOfModule.put("std_qty", multiplier * Double.parseDouble(matOfModule.get("std_qty").toString()));
                                            bomList.put(mtlId, matOfModule);
                                        }
                                    }
                                } else {
                                    Map mat = new HashMap<>();
                                    mat.put("std_qty", multiplier);
                                    bomList.put(moduleId, mat);
                                }
                            }
                        }
                        PreparedStatement rfqPs = Base.startBatch("INSERT INTO " + RfqMaterial.getTableName() + "" +
                                " (form_id, mtl_id, std_qty, structure_id, create_by, create_time) " +
                                "VALUES (?, ?, ?, ?, ?, ?)");
                        for (Map.Entry<String, Map> entry : bomList.entrySet()) {
                            try {
                                Object structureId = entry.getValue().get("structure_id");
                                rfqPs.setString(1, formId);
                                rfqPs.setString(2, entry.getKey());
                                rfqPs.setString(3, entry.getValue().get("std_qty").toString());
                                rfqPs.setString(4, structureId == null ? "pcb" : structureId.toString());
                                rfqPs.setString(5, "admin");
                                rfqPs.setTimestamp(6, timestamp);
                                rfqPs.addBatch();
                            } catch (SQLException e) {
                                e.printStackTrace();
                            }
                        }
                        try {
                            rfqPs.executeBatch();
                        } catch (SQLException e) {
                            e.printStackTrace();
                        }
                        return success();
                    }
                } else {
                    throw new RuntimeException("create log is fail..");
                }
            } else {
                throw new RuntimeException("update demandList is fail..");
            }
        });
    }
    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> get(@RequestParam("form_id") String formId) {
        return ActiveJdbc.operTx(() -> {
            return success(getTop(formId));
        });
    }
    @RequestMapping(value = "/closerfq", method = RequestMethod.GET)
    public RequestResult<?> closeForm(@RequestParam("form_id") String formId,
                                      @RequestParam("status") int status) {
        return ActiveJdbc.operTx(() -> {
            DemandList demandList = DemandList.findFirst("form_id=?", formId);
            demandList.set("quote_status", 99);
            int orig_status = demandList.getInteger("status");
            if (status == 98) demandList.set("status", 99);
            demandList.set("close_time", new java.sql.Timestamp(System.currentTimeMillis()));
            if (demandList.saveIt()) {
                InquiryContent inquiryContent = InquiryContent.findFirst("form_id=?", formId);
                inquiryContent.set("is_quote", "Y");
                if (inquiryContent.saveIt()) {
                    RfqStatusLog log = new RfqStatusLog();
                    String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    java.sql.Timestamp timestamp = new java.sql.Timestamp(System.currentTimeMillis());
                    log.set("form_id", formId);
                    log.set("changed_status", status == 98 ? 99 : orig_status);
                    log.set("previous_status", orig_status);
                    log.set("changed_quote_status", 99);
                    log.set("previous_quote_status", 10);
                    log.set("create_time", timestamp);
                    log.set("create_by", login_user);
                    if (log.saveIt()) {
                        return success(formId);
                    } else {
                        throw new RuntimeException("create log fail...");
                    }
                } else {
                    throw new RuntimeException("inquiryContent - " + formId + " is update fail...");
                }
            } else {
                return fail("DemandList - " + formId + " is update fail...");
            }
        });

    }

    /**
     * @param data 有 form_id , new_mtl, old_mtl
     *             1. 將new_mtl的資料insert進a_strongled_material_list
     *             2. SELECT mtl_id, taxed_price FROM a_strongled_rfq_material WHERE modify_time between (三個月內) AND mtl_id IN (old_mtl的id們)
     *             3. 將查到的資料時間最接近的一筆extend進old_mtl裡面相對應的資料
     *             4. new_mtl & old_mtl 一起insert進 a_strongled_rfq_material
     *             5. UPDATE a_strongled_demand_list SET status=(沒有new_mtl並且每一筆old_mtl都有查到taxed_price => 3 ; 反之 => 2) WHERE form_id=XXX
     */


    @RequestMapping(value = "/createbomlist", method = RequestMethod.POST)
    public RequestResult<?> createBomList(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            String formId = data.get("form_id").toString();
            List<Map> nwMtlMaps = (List<Map>) data.get("new_mtl");
            List<Map> oldMtlMaps = (List<Map>) data.get("old_mtl");
            boolean oldAllSearch = false;
            List<Double> taxedPriceList = Lists.newArrayList();

            //先建 要寫入 a_strongled_rfq_material 的 Batch
            PreparedStatement rfqPs = Base.startBatch("INSERT INTO " + RfqMaterial.getTableName() + "" +
                    " (form_id, mtl_id, std_qty, taxed_price, create_by, create_time, modify_by, modify_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

            try {
                if (nwMtlMaps.size() > 0) {

                    // 建 a_strongled_material_list 的 Batch

                    PreparedStatement ps = Base.startBatch("INSERT INTO " + MaterialList.getTableName() +
                            " (mtl_id, mtl_name, mtl_type, spec, unit, remark, process, create_by, create_time, modify_by, modify_time) " +
                            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    // Java8 lambda  主要就是 把  batchs 塞資料
                    nwMtlMaps.forEach(map -> {
                        materialListBatch(ps, map, login_user, timeMillis);
                        rfqMaterialListBatch(formId, rfqPs, map, login_user, timeMillis);
                    });
                    ps.executeBatch();

                }
                if (oldMtlMaps.size() > 0) {

                    List<RfqMaterial> rfqHistoryList = new ArrayList<>();

                    // Java8 lambda  去查 前 3個月前的 taxed_price 資料 並整成一個 並把它塞入  rfqHistoryList
                    oldMtlMaps.stream()
                            .map(map -> map.get("mtl_id").toString())
                            .collect(Collectors.toSet())
                            .stream()
                            .forEach(mtlId -> {
                                Optional<RfqMaterial> rfqMaterial = queryRFQHistory(mtlId, timeMillis);
                                if (rfqMaterial.isPresent()) {
                                    rfqHistoryList.add(rfqMaterial.get());
                                }
                            });

                    Map<String, String> oldMtlPriceMap = new HashMap<>();

                    // 判斷最後要塞 demandList 的 status 狀態
                    if (oldMtlMaps.size() == rfqHistoryList.size()) {
                        oldAllSearch = true;
                    }

                    // lambda
                    rfqHistoryList.stream()
                            .forEach(rfq -> {
                                oldMtlPriceMap.put(rfq.getString("mtl_id"), rfq.getString("taxed_price"));
                            });

                    // lambda

                    oldMtlMaps.stream()
                            .forEach(map -> {
                                if (oldMtlPriceMap.get(map.get("mtl_id")) != null) {
                                    taxedPriceList.add(Double.parseDouble(oldMtlPriceMap.get(map.get("mtl_id").toString())));
                                }
                                map.put("taxed_price", oldMtlPriceMap.get(map.get("mtl_id").toString()));
                                rfqMaterialListBatch(formId, rfqPs, map, login_user, timeMillis);
                            });
                }
                rfqPs.executeBatch();
                Double totalTaxedPrice = null;
                int status = 2;
                if (nwMtlMaps.size() == 0 && oldAllSearch) {
                    status = 3;
                    totalTaxedPrice = taxedPriceList.stream()
                            .reduce((price1, price2) -> price1 + price2)
                            .get();
                }

                //最後更新 demandList
                if (DemandList.update("status=?, modify_by=?, modify_time=?, mtl_cost=?", "form_id=?", status, login_user, new java.sql.Timestamp(timeMillis), totalTaxedPrice, formId) > 0) {
                    return success();
                } else {
                    return fail("DemandList form_id: " + formId + " update is fail...");
                }

            } catch (SQLException e) {
                e.printStackTrace();
                return fail(data);
            }
        });
    }

    @RequestMapping(value = "/createquotation", method = RequestMethod.POST)
    public RequestResult<?> createQuotation(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            String quote_status = data.get("quote_status").toString();
            String quote = data.get("quote").toString();
            String form_id = data.get("form_id").toString();
            DemandList demandList = DemandList.findFirst("form_id=?", form_id);
            DemandList.update("quote_status=?", "form_id=?", quote_status, form_id);
            PrintQuotationLog printQuotationLog = new PrintQuotationLog();
            printQuotationLog.set("form_id", form_id);
            printQuotationLog.set("quote", quote);
            printQuotationLog.set("create_by", login_user);
            printQuotationLog.set("create_time", new java.sql.Timestamp(timeMillis));
            if (printQuotationLog.saveIt()) {
                RfqStatusLog log = new RfqStatusLog();
                log.set("form_id", form_id);
                log.set("changed_status", demandList.getInteger("status"));
                log.set("previous_status", demandList.getInteger("status"));
                log.set("changed_quote_status", quote_status);
                log.set("previous_quote_status", 1);
                log.set("create_time", new java.sql.Timestamp(timeMillis));
                log.set("create_by", login_user);
                if (log.saveIt()) {
                    return success();
                } else {
                    return fail(data);
                }
            } else {
                return fail(data);
            }
        });

    }

    @RequestMapping(value = "/requestdiscount", method = RequestMethod.POST)
    public RequestResult<?> requestdiscount(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            String quote_status = data.get("quote_status").toString();
            String quote = data.get("quote").toString();
            String form_id = data.get("form_id").toString();
            String reason = data.get("reason").toString();
            DemandList demandList = DemandList.findFirst("form_id=?", form_id);
            int orig_quote_status = demandList.getInteger("quote_status");
            DemandList.update("quote_status=? ", " form_id=?", quote_status, form_id);
            RequestDiscountLog requestDiscountLog = new RequestDiscountLog();
            requestDiscountLog.set("form_id", form_id);
            requestDiscountLog.set("quote", quote);
            requestDiscountLog.set("reason", reason);
            requestDiscountLog.set("create_by", login_user);
            requestDiscountLog.set("create_time", new java.sql.Timestamp(timeMillis));
            if (requestDiscountLog.saveIt()) {
                RfqStatusLog log = new RfqStatusLog();
                log.set("form_id", form_id);
                log.set("changed_status", demandList.getInteger("status"));
                log.set("previous_status", demandList.getInteger("status"));
                log.set("changed_quote_status", quote_status);
                log.set("previous_quote_status", orig_quote_status);
                log.set("create_time", new java.sql.Timestamp(timeMillis));
                log.set("create_by", login_user);
                if (log.saveIt()) {
                    return success();
                } else {
                    return fail(data);
                }
            } else {
                return fail(data);
            }
        });

    }

    @RequestMapping(value = "/editquote", method = RequestMethod.POST)
    public RequestResult<?> editquote(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            String quote_status = data.get("quote_status").toString();
            String quote = data.get("quote").toString();
            String form_id = data.get("form_id").toString();
            String remark = data.get("remark").toString();
            DemandList demandList = DemandList.findFirst("form_id=?", form_id);
            int orig_quote_status = demandList.getInteger("quote_status");
            DemandList.update("quote_status=?, quote=?", " form_id=?", quote_status, quote, form_id);
            QuotationLog quotationLog = new QuotationLog();
            quotationLog.set("form_id", form_id);
            quotationLog.set("quote", quote);
            quotationLog.set("remark", remark);
            quotationLog.set("create_by", login_user);
            quotationLog.set("create_time", new java.sql.Timestamp(timeMillis));
            if (quotationLog.saveIt()) {
                RfqStatusLog log = new RfqStatusLog();
                log.set("form_id", form_id);
                log.set("changed_status", demandList.getInteger("status"));
                log.set("previous_status", demandList.getInteger("status"));
                log.set("changed_quote_status", quote_status);
                log.set("previous_quote_status", orig_quote_status);
                log.set("create_time", new java.sql.Timestamp(timeMillis));
                log.set("create_by", login_user);
                if (log.saveIt()) {
                    return success();
                } else {
                    return fail(data);
                }
            } else {
                return fail(data);
            }
        });

    }

    @RequestMapping(value = "/savebomlist", method = RequestMethod.POST)
    public RequestResult<?> saveBomlist(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            String formId = data.get("form_id").toString();
            List<Map> nwMtlMaps = (List<Map>) data.get("new_mtl");
            List<Map> oldMtlMaps = (List<Map>) data.get("old_mtl");
            List<String> delMtls = (List<String>) data.get("del_mtl");
            List<Map> updateMtl = (List<Map>) data.get("update_mtl");
            String role = data.get("role").toString();
            List<Map> rfqMaterial = RfqMaterial.find("form_id=?", formId).toMaps();

            PreparedStatement rfqPs = Base.startBatch("INSERT INTO " + RfqMaterial.getTableName() + "" +
                    " (form_id, mtl_id, std_qty, taxed_price, create_by, create_time, modify_by, modify_time, structure_id) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

            PreparedStatement upRfqps = Base.startBatch("UPDATE " + RfqMaterial.getTableName() + " " +
                    "set std_qty=?, taxed_price=?, modify_by=?, modify_time=? where form_id=? AND mtl_id=?");

            PreparedStatement rfqMaterialLogPS = Base.startBatch("INSERT INTO " + RfqMaterialEditLog.getTableName() + "" +
                    " (form_id, mtl_id, revise_type, data_before_revised, create_by_role, create_by, create_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)");

            PreparedStatement psMtlPs = Base.startBatch("INSERT IGNORE INTO " + PsMtl.getTableName() + "" +
                    " (structure_id, mtl_id, create_by, create_time) " +
                    "VALUES (?, ?, ?, ?)");

            try {
                Map dataBeforeRevised = new HashMap<>();
                if (nwMtlMaps.size() > 0) {
                    PreparedStatement ps = Base.startBatch("INSERT INTO " + MaterialList.getTableName() +
                            " (mtl_id, mtl_name, mtl_type, spec, unit, remark, process, create_by, create_time, modify_by, modify_time) " +
                            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    // Java8 lambda  主要就是 把  batchs 塞資料
                    nwMtlMaps.forEach(map -> {
                        materialListBatch(ps, map, login_user, timeMillis);
                        rfqMaterialListBatch(formId, rfqPs, map, login_user, timeMillis);
                        rfqMaterialLogBatch(formId, rfqMaterialLogPS, map.get("mtl_id").toString(), login_user, timeMillis, 0, new HashMap<>(), role);
                        psMtlBatch(map.get("structure_id").toString(), psMtlPs, map.get("mtl_id").toString(), login_user, timeMillis);
                    });
                    ps.executeBatch();
                }

                if (oldMtlMaps.size() > 0) {
                    oldMtlMaps.forEach(map -> {
                        rfqMaterialListBatch(formId, rfqPs, map, login_user, timeMillis);
                        rfqMaterialLogBatch(formId, rfqMaterialLogPS, map.get("mtl_id").toString(), login_user, timeMillis, 0, new HashMap<>(), role);
                        psMtlBatch(map.get("structure_id").toString(), psMtlPs, map.get("mtl_id").toString(), login_user, timeMillis);
                    });
                }
                rfqPs.executeBatch();
                psMtlPs.executeBatch();
                if (delMtls.size() > 0) {
                    StringJoiner stringJoiner = new StringJoiner(",", "mtl_id IN(", ")");
                    for (String delMtl : delMtls) {
                        stringJoiner.add("?");
                        List<Map> deleteData = rfqMaterial.stream()
                                .filter(map -> map.get("mtl_id").toString().equals(delMtl))
                                .collect(Collectors.toList());
                        rfqMaterialLogBatch(formId, rfqMaterialLogPS, delMtl, login_user, timeMillis, 2, deleteData.get(0), role);
                    }
                    delMtls.add(0, formId);
                    RfqMaterial.delete("form_id=? AND " + stringJoiner.toString(), delMtls.toArray(new String[0]));
                }

                if (updateMtl.size() > 0) {
                    updateMtl.forEach(map -> {
                        String updateMtlId = map.get("mtl_id").toString();
                        Map mtlMap = (Map) rfqMaterial.stream()
                                .filter(rm -> rm.get("mtl_id").toString().equals(updateMtlId))
                                .collect(Collectors.toList()).get(0);
                        Map updateData = new HashMap<>();
                        updateData.put("std_qty", mtlMap.get("std_qty"));
                        updateRfqMaterialListBatch(upRfqps, map, login_user, timeMillis);
                        rfqMaterialLogBatch(formId, rfqMaterialLogPS, updateMtlId, login_user, timeMillis, 1, updateData, role);
                    });
                    upRfqps.executeBatch();
                }
                rfqMaterialLogPS.executeBatch();
                return success();
            } catch (SQLException e) {
                e.printStackTrace();
                return fail(data);
            }
        });
    }

    @RequestMapping(value = "/savemodulemateriallist", method = RequestMethod.POST)
    public RequestResult<?> saveModuleMaterialList(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            String moduleId = data.get("module_id").toString();
            List<Map> nwMtlMaps = (List<Map>) data.get("new_mtl");
            List<Map> oldMtlMaps = (List<Map>) data.get("old_mtl");
            List<String> delMtls = (List<String>) data.get("del_mtl");
            List<Map> updateMtl = (List<Map>) data.get("update_mtl");

            PreparedStatement insertMaterialModulePS = Base.startBatch("INSERT INTO " + MaterialModule.getTableName() + "" +
                    " (module_id, mtl_id, std_qty, create_by, create_time, modify_by, modify_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)");

            PreparedStatement updateMaterialModulePS = Base.startBatch("UPDATE " + MaterialModule.getTableName() + " " +
                    "set std_qty=?, modify_by=?, modify_time=? where module_id=? AND mtl_id=?");
            try {
                if (nwMtlMaps.size() > 0) {
                    PreparedStatement ps = Base.startBatch("INSERT INTO " + MaterialList.getTableName() +
                            " (mtl_id, mtl_name, mtl_type, spec, unit, remark, process, create_by, create_time, modify_by, modify_time) " +
                            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    // Java8 lambda  主要就是 把  batchs 塞資料
                    nwMtlMaps.forEach(map -> {
                        materialListBatch(ps, map, login_user, timeMillis);
                        materialModuleListBatch(moduleId, insertMaterialModulePS, map, login_user, timeMillis);
                    });
                    ps.executeBatch();
                }

                if (oldMtlMaps.size() > 0) {
                    oldMtlMaps.forEach(map -> materialModuleListBatch(moduleId, insertMaterialModulePS, map, login_user, timeMillis));
                }
                insertMaterialModulePS.executeBatch();
                if (delMtls.size() > 0) {
                    StringJoiner stringJoiner = new StringJoiner(",", "mtl_id IN(", ")");
                    for (String delMtl : delMtls) {
                        stringJoiner.add("?");
                    }
                    delMtls.add(0, moduleId);
                    MaterialModule.delete("module_id=? AND " + stringJoiner.toString(), delMtls.toArray(new String[0]));
                }

                if (updateMtl.size() > 0) {
                    updateMtl.forEach(map -> updateMaterialModuleListBatch(updateMaterialModulePS, map, login_user, timeMillis));
                    updateMaterialModulePS.executeBatch();
                }
                return success();
            } catch (SQLException e) {
                e.printStackTrace();
                return fail(data);
            }
        });
    }

    @RequestMapping(value = "/submitbomlist", method = RequestMethod.PUT)
    public RequestResult<?> submitBomlist(@RequestBody final Map data) {

        return ActiveJdbc.operTx(() -> {
            boolean allSearchTaxedPrice = false;
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            String formId = data.get("form_id").toString();
            List<RfqMaterial> rfqHistoryList = new ArrayList<>();
            List<Map> rfqMaterialList = RfqMaterial.find("form_id=?", formId).toMaps();
            List<Double> taxedPriceList = Lists.newArrayList();

            rfqMaterialList.stream()
                    .map(rfq -> rfq.get("mtl_id").toString())
                    .collect(Collectors.toSet())
                    .stream()
                    .forEach(mtlId -> {
                        Optional<RfqMaterial> rfqMaterial = queryRFQHistory(mtlId, timeMillis);
                        if (rfqMaterial.isPresent()) {
                            rfqHistoryList.add(rfqMaterial.get());
                        }
                    });
            if (rfqHistoryList.size() == rfqMaterialList.size()) allSearchTaxedPrice = true;

            Map<String, String> oldMtlPriceMap = new HashMap<>();

            // lambda
            rfqHistoryList.stream()
                    .forEach(rfq -> {
                        oldMtlPriceMap.put(rfq.getString("mtl_id"), rfq.getString("taxed_price"));
                    });

            // lambda

            rfqMaterialList.stream()
                    .forEach(map -> {
                        if (oldMtlPriceMap.get(map.get("mtl_id")) != null) {
                            taxedPriceList.add(Double.parseDouble(oldMtlPriceMap.get(map.get("mtl_id").toString())));
                        }
                        // map.put("taxed_price", oldMtlPriceMap.get(map.get("mtl_id").toString()));
                        // RfqMaterial updateRfqMaterial = new RfqMaterial();
                        RfqMaterial.update(
                          "taxed_price=?, modify_time=?, modify_by=?", 
                          "form_id=? AND structure_id=? AND mtl_id=?", 
                          oldMtlPriceMap.get(map.get("mtl_id").toString()),
                          (new java.sql.Timestamp(timeMillis)),
                          login_user,
                          formId,
                          map.get("structure_id"),
                          map.get("mtl_id")
                        );
                        // updateRfqMaterial.fromMap(map);
                        // updateRfqMaterial.saveIt();
                        //  rfqMaterialListBatch(formId, rfqPs, map, login_user, timeMillis);
                    });


            //  rfqPs.executeBatch();
            Double totalTaxedPrice = null;
            Boolean hasBomList = false;
            int status = 16;
            if (allSearchTaxedPrice) {
                hasBomList = true;
                totalTaxedPrice = taxedPriceList.stream()
                        .reduce((price1, price2) -> price1 + price2)
                        .get();
            }

            if (DemandList.update("status=?, modify_by=?, modify_time=?, mtl_cost=?, has_bom_list=?", "form_id=?", status, login_user, new java.sql.Timestamp(timeMillis), totalTaxedPrice, hasBomList, formId) > 0) {
                RfqStatusLog log = new RfqStatusLog();
                log.set("form_id", formId);
                log.set("changed_status", 16);
                log.set("previous_status", 11);
                log.set("changed_quote_status", 30);
                log.set("previous_quote_status", 30);
                log.set("create_time", new java.sql.Timestamp(timeMillis));
                log.set("create_by", login_user);
                if (log.saveIt()) {
                    return success();
                } else {
                    return fail(data);
                }
            } else {
                return fail("DemandList form_id: " + formId + " update is fail...");
            }
        });

    }

    @RequestMapping(value = "/savebomprice", method = RequestMethod.PUT)
    public RequestResult<?> saveBomprice(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            long timeMillis = System.currentTimeMillis();
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            List<Map> datas = (List<Map>) data.get("datas");
            String role = data.get("role").toString();
            String formId = datas.get(0).get("form_id").toString();
            List<Map> rfqMaterial = RfqMaterial.find("form_id=?", formId).toMaps();
            PreparedStatement rfqMaterialLogPS = Base.startBatch("INSERT INTO " + RfqMaterialEditLog.getTableName() + "" +
                    " (form_id, mtl_id, revise_type, data_before_revised, create_by_role, create_by, create_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)");
            try {
                PreparedStatement rfqPs = Base.startBatch("UPDATE " + RfqMaterial.getTableName()
                        + " set taxed_price=?, modify_by=?, modify_time=? WHERE form_id=? AND mtl_id=?");
                for (Map newData : datas) {
                    Map dataBeforeRevised = new HashMap<>();
                    String mtlId = newData.get("mtl_id").toString();
                    String type = newData.get("type").toString();
                    Object oldTaxedPrice = rfqMaterial
                            .stream()
                            .filter(map -> map.get("mtl_id").toString().equals(mtlId))
                            .collect(Collectors.toList()).get(0)
                            .get("taxed_price");
                    dataBeforeRevised.put("taxed_price", oldTaxedPrice);
                    rfqMaterialLogBatch(
                            formId,
                            rfqMaterialLogPS,
                            mtlId,
                            login_user,
                            timeMillis,
                            1,
                            type.equals("new") ? null : dataBeforeRevised,
                            role
                    );
                    rfqPs.setString(1, newData.get("taxed_price").toString());
                    rfqPs.setString(2, login_user);
                    rfqPs.setTimestamp(3, timestamp);
                    rfqPs.setString(4, formId);
                    rfqPs.setString(5, mtlId);

                    rfqPs.addBatch();
                }
                rfqMaterialLogPS.executeBatch();
                rfqPs.executeBatch();
                return success();
            } catch (SQLException e) {
                e.printStackTrace();
                return fail(data);
            }
        });
    }

    @RequestMapping(value = "/wholerfq", method = RequestMethod.GET)
    public RequestResult<?> wholerfq(@RequestParam("form_id") String formId) {

        return ActiveJdbc.operTx(() -> {
            Map inquiryContent = InquiryContent.findFirst("form_id=?", formId).toMap();
            Map demandList = DemandList.findFirst("form_id=?", formId).toMap();
            inquiryContent.putAll(demandList);
            List<Map> rfqChangedLogList = RfqChangedLog.find("form_id=?", formId).toMaps();
            Set<String> keySets = new HashSet<>();
            try {
                rfqChangedLogList.forEach(map -> {
                    Map previousData = new Gson().fromJson(map.get("previous_data").toString(), Map.class);
                    previousData.keySet().forEach(key -> keySets.add(key.toString()));
                });
            } catch (JsonSyntaxException e) {
                e.printStackTrace();
            }

            inquiryContent.put("changed_column", keySets);
            return success(inquiryContent);
        });
    }

    @RequestMapping(value = "/getrfqlist", method = RequestMethod.POST)
    public RequestResult<?> getrfqlist(@RequestBody final Map<String, Object> data) {
        return ActiveJdbc.operTx(() -> {
            List<Map> result = null;
            if (data.get("form_id") != null) {
                result = RfqList.find("form_id=?", data.get("form_id").toString()).toMaps();
            } else {
                List<Double> status = (List<Double>) data.get("status");
                List<Double> quote_status = (List<Double>) data.get("quote_status");
                String start = data.get("start").toString() + " 00:00:00";
                String end = data.get("end").toString() + " 23:59:59";
                String sql = "create_time BETWEEN ? AND ?";
                List params = new ArrayList<>();
                params.add(start);
                params.add(end);
                if (status.size() > 0 && quote_status.size() > 0) {

                    sql += " AND status IN (";
                    sql += String.join(",", status.stream().map(s -> "?").collect(Collectors.toList()));
                    sql += ")";
                    sql += " AND quote_status IN (";
                    sql += String.join(",", quote_status.stream().map(s -> "?").collect(Collectors.toList()));
                    sql += ")";
                    params.addAll(status);
                    params.addAll(quote_status);

                    result = RfqList.find(sql, params.toArray(new Object[0])).toMaps();
                } else if (status.size() > 0) {
                    sql += " AND status IN (";
                    sql += String.join(",", status.stream().map(s -> "?").collect(Collectors.toList()));
                    sql += ")";
                    params.addAll(status);
                    result = RfqList.find(sql, params.toArray(new Object[0])).toMaps();
                } else if (quote_status.size() > 0) {
                    sql += " AND quote_status IN (";
                    sql += String.join(",", quote_status.stream().map(s -> "?").collect(Collectors.toList()));
                    sql += ")";
                    params.addAll(quote_status);
                    result = RfqList.find(sql, params.toArray(new Object[0])).toMaps();
                }
            }
            result.forEach(s -> {
                RfqStatusLog lastStatusChgLog = RfqStatusLog.findFirst("form_id=? AND changed_status=? AND (previous_status!=? OR previous_status IS NULL) ORDER BY create_time DESC", s.get("form_id").toString(), s.get("status"), s.get("status"));
                if (lastStatusChgLog != null) {
                    s.put("status_chg_time", lastStatusChgLog.getTimestamp("create_time"));
                }
                RfqStatusLog lastQuoteStatusChgLog = RfqStatusLog.findFirst("form_id=? AND changed_quote_status=? AND (previous_quote_status!=? OR previous_quote_status IS NULL) ORDER BY create_time DESC", s.get("form_id").toString(), s.get("quote_status"), s.get("quote_status"));
                if (lastQuoteStatusChgLog != null) {
                    s.put("quote_status_chg_time", lastQuoteStatusChgLog.getTimestamp("create_time"));
                }
            });

            return success(result);
        });
    }

    @RequestMapping(value = "/saverfq", method = RequestMethod.POST)
    public RequestResult<?> saverfq(@RequestBody final Map<String, Object> data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            java.sql.Timestamp timestamp = new java.sql.Timestamp(System.currentTimeMillis());
            String formId = data.get("form_id").toString();
            InquiryContent inquiryContent = InquiryContent.findFirst("form_id=?", formId);
            DemandList demandList = DemandList.findFirst("form_id=?", formId);
            MetaModel inquiryContentMeta = InquiryContent.getMetaModel();
            MetaModel demandListMeta = DemandList.getMetaModel();
            Set<String> inquiryContentColumns = inquiryContentMeta.getAttributeNamesSkip("create_by", "create_time", "series", "model_number");
            Set<String> demandListColumns = demandListMeta.getAttributeNamesSkip("create_by", "create_time", "form_type");
            Map<String, ColumnMetadata> inquiryContentColumnMeta = inquiryContentMeta.getColumnMetadata();
            Map<String, ColumnMetadata> demandListColumnMeta = demandListMeta.getColumnMetadata();
            if (Boolean.parseBoolean(data.get("is_log").toString())) {
                Map<String, Object> diff = new HashMap<>();
                for (Map.Entry<String, Object> entry : data.entrySet()) {
                    if (inquiryContentColumns.contains(entry.getKey())) {
                        if (inquiryContent.get(entry.getKey()) == null && entry.getValue() != null) {
                            diff.put(entry.getKey(), "");
                        } else if (inquiryContent.get(entry.getKey()) != null && entry.getValue() == null) {
                            diff.put(entry.getKey(), inquiryContent.get(entry.getKey()));
                        } else if (inquiryContentColumnMeta.get(entry.getKey()).getTypeName().equals("DATE")) {
                            java.sql.Date sqlDate = inquiryContent.getDate(entry.getKey());
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                            String dateStr = sdf.format(sqlDate.getTime());
                            if (!dateStr.equals(entry.getValue().toString())) {
                                diff.put(entry.getKey(), inquiryContent.get(entry.getKey()));
                            }
                        } else if (inquiryContentColumnMeta.get(entry.getKey()).getTypeName().equals("DATETIME")) {
                            java.sql.Timestamp sqlDate = inquiryContent.getTimestamp(entry.getKey());
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                            String dateStr = sdf.format(sqlDate.getTime());
                            if (!dateStr.equals(entry.getValue().toString())) {
                                diff.put(entry.getKey(), inquiryContent.get(entry.getKey()));
                            }
                        } else if (inquiryContent.get(entry.getKey()) != null && entry.getValue() != null && !inquiryContent.get(entry.getKey()).toString().equals(entry.getValue().toString())) {
                            diff.put(entry.getKey(), inquiryContent.get(entry.getKey()));
                        }
                    }
                    if (demandListColumns.contains(entry.getKey())) {
                        if (demandList.get(entry.getKey()) == null && entry.getValue() != null) {
                            diff.put(entry.getKey(), "");
                        } else if (demandList.get(entry.getKey()) != null && entry.getValue() == null) {
                            diff.put(entry.getKey(), demandList.get(entry.getKey()));
                        } else if (demandListColumnMeta.get(entry.getKey()).getTypeName().equals("DATE")) {
                            java.sql.Date sqlDate = demandList.getDate(entry.getKey());
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                            String dateStr = sdf.format(sqlDate.getTime());
                            if (!dateStr.equals(entry.getValue().toString())) {
                              diff.put(entry.getKey(), demandList.get(entry.getKey()));
                            }
                        } else if (demandListColumnMeta.get(entry.getKey()).getTypeName().equals("DATETIME")) {
                            java.sql.Timestamp sqlDate = demandList.getTimestamp(entry.getKey());
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                            String dateStr = sdf.format(sqlDate.getTime());
                            if (!dateStr.equals(entry.getValue().toString())) {
                                diff.put(entry.getKey(), demandList.get(entry.getKey()));
                            }
                        } else if (demandList.get(entry.getKey()) != null && entry.getValue() != null && !demandList.get(entry.getKey()).toString().equals(entry.getValue().toString())) {
                            diff.put(entry.getKey(), demandList.get(entry.getKey()));
                        }
                    }
                }
                String json = new Gson().toJson(diff, Map.class);
                RfqChangedLog rfqChangedLog = new RfqChangedLog();
                String reason = data.get("reason").toString();
                rfqChangedLog.set("form_id", formId);
                rfqChangedLog.set("previous_data", new Gson().toJson(diff, Map.class));
                rfqChangedLog.set("reason", reason);
                rfqChangedLog.set("create_by", login_user);
                rfqChangedLog.set("create_time", timestamp);
                if (rfqChangedLog.insert()) {
                    inquiryContent.fromMap(data);
                    demandList.fromMap(data);
                    if (inquiryContent.saveIt() && demandList.saveIt()) {
                        return success();
                    } else {
                        return fail("inquiryContent & demandList update to fail");
                    }
                } else {
                    return fail(data);
                }
            } else {
                inquiryContent.fromMap(data);
                demandList.fromMap(data);
                if (inquiryContent.saveIt() && demandList.saveIt()) {
                    return success();
                } else {
                    return fail("inquiryContent & demandList update to fail");
                }
            }
        });
    }

    @RequestMapping(value = "/changestatus", method = RequestMethod.POST)
    public RequestResult<?> changestatus(@RequestBody final Map<String, Object> data) {
        return ActiveJdbc.operTx(() -> {
            String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            java.sql.Timestamp timestamp = new java.sql.Timestamp(System.currentTimeMillis());
            String formId = data.get("form_id").toString();
            String reason = null;
            DemandList demandList = DemandList.findFirst("form_id=?", formId);
            Double statusDou = Double.parseDouble(data.get("status").toString());
            int status = statusDou.intValue();
            if (status == 96) reason = data.get("reason").toString();
            RfqStatusLog log = new RfqStatusLog();
            log.set("form_id", formId);
            log.set("changed_status", status);
            log.set("previous_status", demandList.get("status"));
            log.set("changed_quote_status", data.get("quote_status"));
            log.set("previous_quote_status", demandList.get("quote_status"));
            if (status == 96) {
                log.set("reason", data.get("reason"));
            }
            log.set("create_time", timestamp);
            log.set("create_by", login_user);
            if (status == 96 || status == 97) {
                Map deleted_data = new HashMap();
                LazyList<RfqMaterial> deleted_mat = RfqMaterial.find("form_id=?", formId);
                if (deleted_mat.size() > 0) {
                    deleted_data.put("deleted_mat", deleted_mat.toMaps());
                    deleted_mat.forEach(rfqMaterial -> rfqMaterial.delete());
                }

                deleted_data.put("mtl_cost", demandList.get("mtl_cost"));
                deleted_data.put("produce_coef", demandList.get("produce_coef"));
                deleted_data.put("market_coef", demandList.get("market_coef"));
                deleted_data.put("quote", demandList.get("quote"));
                if (demandList.get("has_bom_list") != null)
                    deleted_data.put("has_bom_list", (Boolean) demandList.get("has_bom_list") ? true : null);
                log.set("deleted_data", new Gson().toJson(deleted_data));

                if (log.insert()) {
                    demandList.set("mtl_cost", null);
                    demandList.set("produce_coef", null);
                    demandList.set("market_coef", null);
                    demandList.set("quote", null);
                    demandList.set("has_bom_list", false);
                } else {
                    return fail(data);
                }
            } else {
                if (!log.insert()) {
                    return fail(data);
                }
            }
            demandList.fromMap(data);
            if (demandList.saveIt()) {
                return success(demandList.get("form_id"));
            } else {
                return fail(demandList.toMap());
            }
        });

    }

    public Optional<RfqMaterial> queryRFQHistory(String mtlId, long timeMillis) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(timeMillis);
        calendar.add(Calendar.DAY_OF_YEAR, -90);
        String startTimestamp = sdf.format(calendar.getTime());
        String endTimestamp = sdf.format(timeMillis);
        RfqMaterial rfqMaterial = RfqMaterial.findFirst("mtl_id=? AND taxed_price <> 0 AND modify_time between ? AND ? ORDER BY modify_time desc",
                mtlId, startTimestamp, endTimestamp);
        return Optional.ofNullable(rfqMaterial);
    }

    public void rfqMaterialListBatch(String formId, PreparedStatement ps, Map data, String user, long timeMillis) {
        try {
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            ps.setString(1, formId);
            ps.setString(2, data.get("mtl_id").toString());
            ps.setString(3, data.get("std_qty").toString());
            ps.setString(4, data.get("taxed_price") == null ? null : data.get("taxed_price").toString());
            ps.setString(5, user);
            ps.setTimestamp(6, timestamp);
            ps.setString(7, user);
            ps.setTimestamp(8, timestamp);
            ps.setString(9, data.get("structure_id").toString());
            ps.addBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void psMtlBatch(String structureId, PreparedStatement ps, String mtlId, String user, long timeMillis) {
        try {
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            ps.setString(1, structureId);
            ps.setString(2, mtlId);
            ps.setString(3, user);
            ps.setTimestamp(4, timestamp);
            ps.addBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void rfqMaterialLogBatch(String formId, PreparedStatement ps, String mtlId, String user, long timeMillis, Integer type, Map dataBeforeRevised, String role) {
        try {
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            ps.setString(1, formId);
            ps.setString(2, mtlId);
            ps.setInt(3, type);
            ps.setString(4, dataBeforeRevised == null ? null : new Gson().toJson(dataBeforeRevised, Map.class));
            ps.setString(5, role);
            ps.setString(6, user);
            ps.setTimestamp(7, timestamp);
            ps.addBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateRfqMaterialListBatch(PreparedStatement ps, Map data, String user, long timeMillis) {
        try {
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            ps.setString(1, data.get("std_qty").toString());
            ps.setString(2, data.get("taxed_price") == null ? null : data.get("taxed_price").toString());
            ps.setString(3, user);
            ps.setTimestamp(4, timestamp);
            ps.setString(5, data.get("form_id").toString());
            ps.setString(6, data.get("mtl_id").toString());
            ps.addBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void materialModuleListBatch(String moduleId, PreparedStatement ps, Map data, String user, long timeMillis) {
        try {
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            ps.setString(1, moduleId);
            ps.setString(2, data.get("mtl_id").toString());
            ps.setString(3, data.get("std_qty").toString());
            ps.setString(4, user);
            ps.setTimestamp(5, timestamp);
            ps.setString(6, user);
            ps.setTimestamp(7, timestamp);
            ps.addBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateMaterialModuleListBatch(PreparedStatement ps, Map data, String user, long timeMillis) {
        try {
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            ps.setString(1, data.get("std_qty").toString());
            ps.setString(2, user);
            ps.setTimestamp(3, timestamp);
            ps.setString(4, data.get("module_id").toString());
            ps.setString(5, data.get("mtl_id").toString());
            ps.addBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void materialListBatch(PreparedStatement ps, Map data, String user, long timeMillis) {
        try {
            java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
            ps.setString(1, data.get("mtl_id").toString());
            ps.setString(2, data.get("mtl_name").toString());
            ps.setString(3, data.get("mtl_type") == null ? null : data.get("mtl_type").toString());
            ps.setString(4, data.get("spec").toString());
            ps.setString(5, data.get("unit").toString());
            ps.setString(6, data.get("remark").toString());
            ps.setString(7, data.get("process") == null ? null : data.get("process").toString());
            ps.setString(8, user);
            ps.setTimestamp(9, timestamp);
            ps.setString(10, user);
            ps.setTimestamp(11, timestamp);
            ps.addBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    public List<Map> getTop(String formId) {

        List<InquiryContent> inquiryContentList = InquiryContent.find("form_id=?", formId);
        if (inquiryContentList.size() == 0) {
            return Collections.EMPTY_LIST;
        }
        //比對參數們

        InquiryContent inquiryContent = inquiryContentList.get(0);
        String series = inquiryContent.getString("series");
        String colorClaim = inquiryContent.getString("color_claim");
        String controlWay = inquiryContent.getString("control_way");
        String workVoltage = inquiryContent.getString("work_voltage");
        String watt = inquiryContent.getString("watt");
        String lampColor = inquiryContent.getString("lamp_color");
        String chipClaim = inquiryContent.getString("chip_claim");
        String cord = inquiryContent.getString("cord");
        String linePosition = inquiryContent.getString("line_position");
        String support = inquiryContent.getString("support");
        java.sql.Timestamp form_time = inquiryContent.getTimestamp("form_time");
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String endTimestamp = sdf.format(form_time.getTime());
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(form_time.getTime());
        calendar.add(Calendar.DAY_OF_YEAR, -90);
        String startTimestamp = sdf.format(calendar.getTime());


        List<String> params = Stream.of(startTimestamp, endTimestamp, series, colorClaim, controlWay, workVoltage,
                watt, lampColor, chipClaim, cord, linePosition, support, "Y").collect(Collectors.toList());
        StringBuilder sqlExpress = new StringBuilder(" form_time between ? AND ? AND ( ");
        sqlExpress.append("series=? OR ");
        sqlExpress.append("color_claim=? OR ");
        sqlExpress.append("control_way=? OR ");
        sqlExpress.append("work_voltage=? OR ");
        sqlExpress.append("watt=? OR ");
        sqlExpress.append("lamp_color=? OR ");
        sqlExpress.append("chip_claim=? OR ");
        sqlExpress.append("cord=? OR ");
        sqlExpress.append("line_position=? OR ");
        sqlExpress.append("support=? ");
        sqlExpress.append(" ) AND is_quote=? ");
        List<Map> hitDatas = InquiryContent.find(sqlExpress.toString(), params.toArray(new String[0])).toMaps();
        List<Map> topComboDatas = hitDatas.stream().filter((data) -> {
            if (data.get("form_id").equals(formId)) {
                return false;
            }
            Map<String, Object> combosMap = new HashMap<>();
            double target = 0;
            double combo = 0;
            if (series != null) {
                target++;
                if (series.equals(data.get("series") == null ? null : data.get("series").toString())) {
                    combo++;
                    combosMap.put("series", data.get("series").toString());
                }
            }

            if (colorClaim != null) {
                target++;
                if (colorClaim.equals(data.get("color_claim") == null ? null : data.get("color_claim").toString())) {
                    combo++;
                    combosMap.put("color_claim", data.get("color_claim").toString());
                }
            }

            if (controlWay != null) {
                target++;
                if (controlWay.equals(data.get("control_way") == null ? null : data.get("control_way").toString())) {
                    combo++;
                    combosMap.put("control_way", data.get("control_way").toString());
                }
            }

            if (workVoltage != null) {
                target++;
                if (workVoltage.equals(data.get("work_voltage") == null ? null : data.get("work_voltage").toString())) {
                    combo++;
                    combosMap.put("work_voltage", data.get("work_voltage").toString());
                }
            }

            if (watt != null) {
                target++;
                if (watt.equals(data.get("watt") == null ? null : data.get("watt").toString())) {
                    combo++;
                    combosMap.put("watt", data.get("watt").toString());
                }
            }

            if (lampColor != null) {
                target++;
                if (lampColor.equals(data.get("lamp_color") == null ? null : data.get("lamp_color").toString())) {
                    combo++;
                    combosMap.put("lamp_color", data.get("lamp_color").toString());
                }
            }

            if (chipClaim != null) {
                target++;
                if (chipClaim.equals(data.get("chip_claim") == null ? null : data.get("chip_claim").toString())) {
                    combo++;
                    combosMap.put("chip_claim", data.get("chip_claim").toString());
                }
            }

            if (cord != null) {
                target++;
                if (cord.equals(data.get("cord") == null ? null : data.get("cord").toString())) {
                    combo++;
                    combosMap.put("cord", data.get("cord").toString());
                }
            }

            if (linePosition != null) {
                target++;
                if (linePosition.equals(data.get("line_position") == null ? null : data.get("line_position").toString())) {
                    combo++;
                    combosMap.put("line_position", data.get("line_position").toString());
                }
            }

            if (support != null) {
                target++;
                if (support.equals(data.get("support") == null ? null : data.get("support").toString())) {
                    combo++;
                    combosMap.put("support", data.get("support").toString());
                }
            }

            if (target >= 6 && combo >= 6) {
                DemandList demandList = DemandList.findFirst("form_id=?", data.get("form_id").toString());
                data.put("mtl_cost", demandList.get("mtl_cost"));
                data.put("produce_coef", demandList.get("produce_coef"));
                data.put("market_coef", demandList.get("market_coef"));
                data.put("matched", combosMap);
                return true;
            } else {
                return false;
            }

            //  if (combo >= target) {

            //  } else {
            //      return false;
            //  }

        }).collect(Collectors.toList());

        return topComboDatas;
    }

    @RequestMapping(value = "/test", method = RequestMethod.POST)
    public RequestResult<?> test(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String formId = data.get("form_id").toString();
            List<String> column = (List<String>) data.get("column");
            return success(getStdProduct(formId, column));
        });
    }

    @RequestMapping(value = "/getmodule", method = RequestMethod.GET)
    public RequestResult<?> getModule(@RequestParam("form_id") String formId) {
        return ActiveJdbc.operTx(() -> {
            // System.out.println(formId);
            Map<String, Object> module = getModuleList(formId);
            if (module != null) {
                return success(module);
            } else {
                return success();
            }
        });
    }

    public Map<String, Object> getModuleList(String formId) {
        InquiryContent inquiryContent = InquiryContent.findFirst("form_id=?", formId);
        // System.out.println(inquiryContent.toString());
        if (inquiryContent == null) return null;
        String model = inquiryContent.get("model_number").toString();
        MaterialModuleRule materialModuleRule = MaterialModuleRule.findFirst("model_number=?", model);
        Map<String, Object> rule = new Gson().fromJson(materialModuleRule.getString("rule"), Map.class);
        String field = "";
        Map<String, Object> obj = rule;
        String value = "";
        while (obj.containsKey("field")) {
            field = obj.get("field").toString();
            value = inquiryContent.getString(field);
            // System.out.println("field: " + field + "; value: " + value);
            if (obj.containsKey(value)) {
                obj = (Map) obj.get(value);
            } else {
                return null;
            }
        }
        return obj;
    }

    public List<Map> getStdProduct(String formId, List<String> columns) {
        List<InquiryContent> inquiryContentList = InquiryContent.find("form_id=?", formId);
        if (inquiryContentList.size() == 0) {
            return Collections.EMPTY_LIST;
        }
        //比對參數們
        InquiryContent inquiryContent = inquiryContentList.get(0);
        String sql = "";
        List<String> sqlArray = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        for (String column : columns) {
            Object value = inquiryContent.get(column);
            values.add(value);
            if (value == null) {
                sqlArray.add(column + " IS ?");
            } else {
                sqlArray.add(column + "=?");
            }

        }
        sql = String.join(" AND ", sqlArray);
        List<Map> similarRfq = InquiryContent.find(sql + " AND form_id!='" + formId + "' AND is_quote='Y'", values.toArray(new Object[0])).toMaps();
        List<Map> result = similarRfq.stream().map(map -> {
            DemandList demandList = DemandList.findFirst("form_id=?", map.get("form_id").toString());
            map.put("quote", demandList.get("quote"));
            map.put("mtl_cost", demandList.get("mtl_cost"));
            map.put("produce_coef", demandList.get("produce_coef"));
            map.put("market_coef", demandList.get("market_coef"));
            map.put("cus_id", demandList.get("cus_id"));
            map.put("product_id", demandList.get("product_id"));
            map.put("seq_no", demandList.get("seq_no"));
            return map;
        }).collect(Collectors.toList());
        return result;
    }

    @RequestMapping(value = "/rfqmaterial", method = RequestMethod.GET)
    public RequestResult<?> rfqmaterial(@RequestParam("form_id") final String formId) {
        return ActiveJdbc.operTx(() -> {
            return success(Base.findAll("select a.*, b.* from " +
                    RfqMaterial.getTableName() + " as a left join " + MaterialList.getTableName() + " as b " +
                    "on a.mtl_id" + " = " + "b.mtl_id"
                    + " where a.form_id=?", formId));
        });
    }

    @RequestMapping(value = "/getmodulematerial", method = RequestMethod.GET)
    public RequestResult<?> getModuleMaterial(@RequestParam("module_id") final String moduleId) {
        return ActiveJdbc.operTx(() -> {
            return success(Base.findAll("select a.*, b.* from " +
                    MaterialModule.getTableName() + " as a left join " + MaterialList.getTableName() + " as b " +
                    "on a.mtl_id" + " = " + "b.mtl_id"
                    + " where a.module_id=?", moduleId));
        });
    }

    @RequestMapping(value = "/project", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        synchronized (LOCK) {
            try {
                return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                    @Override
                    public RequestResult<?> operate() {
                        //設定 project_id
                        LocalDate today = LocalDate.now();
                        StringBuilder pid = new StringBuilder();
                        pid.append(today.getYear()).append(String.format("%02d", today.getMonth().getValue())).append(String.format("%02d", today.getDayOfMonth()));

                        if (Project.findAll().toMaps().size() > 0) {
                            Project lastProject = Project.findFirst("ORDER BY project_id Desc");
                            if (lastProject.getString("project_id").substring(0, 8).equals(pid.toString())) {
                                int index = Integer.parseInt(lastProject.getString("project_id").substring(8)) + 1;
                                pid.append(String.format("%03d", index));
                            } else {
                                pid.append("001");
                            }
                        } else {
                            pid.append("001");
                        }

                        //取得現在時間
                        long timeMillis = System.currentTimeMillis();

                        //取得新增者
                        Object creater = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
//                        String creater = "Kevin_Tsai";
                        data.put("project_id", pid.toString());
                        data.put("create_by", creater);
                        data.put("create_time", new Timestamp(timeMillis));
                        data.put("modify_by", creater);
                        data.put("modify_time", new Timestamp(timeMillis));
                        Project project = new Project();
                        ProjectOwner projectOwner = new ProjectOwner();
                        project.fromMap(data);
                        projectOwner.fromMap(data);
                        if (project.insert() && projectOwner.insert()) {
                            return success(project.getString("project_id"));
                        } else {
                            return fail("主鍵重複-duplicate primary key");
                        }
                    }
                });
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        }
    }

    @RequestMapping(value = "/project/deleteWithArray", method = RequestMethod.DELETE)
    public RequestResult<?> deleteWithArray(@RequestBody final List<String> deleteData) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    //放查詢project_rfq的SQL指令
                    StringBuilder sbSelect = new StringBuilder("SELECT * FROM a_strongled_project_rfq WHERE project_id IN ( ");

                    //放IN的SQL指令
                    StringBuilder sbIn = new StringBuilder();

                    //放回傳陣列
                    String[] responseData;
                    //串接IN 的值
                    for (int i = 0; i < deleteData.size(); i++) {
                        if (i == (deleteData.size() - 1)) {
                            sbIn.append("'" + deleteData.get(i) + "' ) ");
                        } else {
                            sbIn.append("'" + deleteData.get(i) + "', ");
                        }
                    }

                    //查詢a_strongled_project_rfq 內是否有欲刪除的ID
                    List<Map> result = Base.findAll(sbSelect.append(sbIn.toString()).append("GROUP BY project_id").toString());

                    if (result.size() != 0) {

                        //設定回傳重複ID陣列大小
                        responseData = new String[result.size()];

                        for (int i = 0; i < result.size(); i++) {
                            responseData[i] = result.get(i).get("project_id").toString();
                        }

                        //回傳重複ID
                        return fail(responseData);
                    } else {
                        //刪除資料
                        Project.delete("project_id IN (" + sbIn.toString());
                        ProjectOwner.delete("project_id IN (" + sbIn.toString());

                        //設定回傳重複ID陣列大小
                        responseData = new String[deleteData.size()];

                        for (int i = 0; i < deleteData.size(); i++) {
                            responseData[i] = deleteData.get(i);
                        }

                        //回傳刪除成功ID
                        return success(responseData);
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }

    }

    @RequestMapping(value = "/project/{userId}", method = RequestMethod.GET)
    public RequestResult<?> getProjectDetail(@PathVariable("userId") String userId) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT p.*,po.* ");
                sb.append("FROM a_strongled_project p ");
                sb.append("JOIN a_strongled_project_owner po ON p.project_id=po.project_id ");
                sb.append("WHERE po.user_id='" + userId + "'");
                String sql = sb.toString();
                log.info(sql);

                return RequestResult.success(Base.findAll(sb.toString()));
            }
        });
    }

    @RequestMapping(value = "/project", method = RequestMethod.GET)
    public RequestResult<?> getProjectAll() {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT p.*,po.* ");
                sb.append("FROM a_strongled_project p ");
                sb.append("JOIN a_strongled_project_owner po ON p.project_id=po.project_id");
                String sql = sb.toString();
                log.info(sql);

                return RequestResult.success(Base.findAll(sb.toString()));
            }
        });
    }

    @RequestMapping(value = "/project/{projectId}/getrfqlist", method = RequestMethod.GET)
    public RequestResult<?> queryLatestUpdateByProjectId(@PathVariable("projectId") final String projectId) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                StringBuilder sb = new StringBuilder();

                List<Map> resultListByQuery = new ArrayList<>();

                @Override
                public RequestResult<?> operate() {

                    sb.append("SELECT * " +
                            "from  a_strongled_view_rfq_list " +
                            "WHERE project_id= '" + projectId + "'");

                    List<Map> result = Base.findAll(sb.toString());
                    if (result != null) {
                        for (Map mapResult : result) {

                            //清空StringBuilder
                            sb.setLength(0);

                            sb.append("SELECT * " +
                                    "From a_strongled_rfq_status_log " +
                                    "WHERE form_id= '" + mapResult.get("form_id").toString() + "' " +
                                    "AND changed_quote_status= '" + mapResult.get("quote_status").toString() + "' " +
                                    "AND (previous_quote_status!='" + mapResult.get("quote_status").toString() + "' " +
                                    "OR previous_quote_status IS NULL)" +
                                    "ORDER BY create_time DESC");

                            //取得最新更新的第一筆
                            Map latest_update = Base.findAll(sb.toString()).get(0);

                            //將資料塞到 (1) 的結果內
                            mapResult.put("quote_status_chg_time", latest_update.get("create_time"));

                            //清空StringBuilder
                            sb.setLength(0);

                            sb.append("SELECT * " +
                                    "From a_strongled_rfq_status_log " +
                                    "WHERE form_id= '" + mapResult.get("form_id").toString() + "' " +
                                    "AND changed_status= '" + mapResult.get("status").toString() + "' " +
                                    "AND (previous_status!='" + mapResult.get("status").toString() + "' " +
                                    "OR previous_status IS NULL)" +
                                    "ORDER BY create_time DESC");

                            //取得最新更新的第一筆
                            latest_update = Base.findAll(sb.toString()).get(0);

                            //將資料塞到 (1) 的結果內
                            mapResult.put("status_chg_time", latest_update.get("create_time"));

                            //將最後結果放進List集合內
                            resultListByQuery.add(mapResult);
                        }
                        return success(resultListByQuery);
                    } else {
                        return fail("No matching information");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/project", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    //取得現在時間
                    long timeMillis = System.currentTimeMillis();
                    //取得修改者
                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    Project project = new Project();

                    data.put("modify_by", user);
                    data.put("modify_time", new Timestamp(timeMillis));

                    project.fromMap(data);
                    if (project.saveIt()) {
                        return success(project.getString("project_id"));
                    } else {
                        return fail("更新失敗");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    @RequestMapping(value = "/rfqMaterialStructureLog", method = RequestMethod.GET)
    public RequestResult<?> readRfqMaterial(@RequestParam("form_id") String formId,
                                            @RequestParam("role") String role) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT g1.*, g2.data_before_revised, g2.revise_type, g2.create_by, g2.last_modify_time ");

                sb.append("FROM a_strongled_view_rfq_material_structure g1 ");
                sb.append("LEFT JOIN(");

                sb.append("SELECT ");
                sb.append("t1.data_before_revised," +
                        "t1.revise_type," +
                        "t1.create_by," +
                        "t2.* ");
                sb.append("FROM a_strongled_rfq_material_edit_log t1 ");

                sb.append("JOIN ( ");
                sb.append("SELECT max(create_time) AS last_modify_time, mtl_id  ");
                sb.append("FROM a_strongled_rfq_material_edit_log log ");
                sb.append("WHERE form_id=\'" + formId + "\' ");
                sb.append("AND create_by_role=\'" + role + "\' ");
                sb.append("GROUP BY mtl_id");
                sb.append(") t2 ");

                sb.append("ON t1.mtl_id=t2.mtl_id ");
                sb.append("AND t1.create_time=t2.last_modify_time ");
                sb.append("WHERE t1.create_by_role=\'" + role + "\' ");
                sb.append("AND t1.form_id=\'" + formId + "\' ");
                sb.append(")g2 ");

                sb.append("ON g1.mtl_id=g2.mtl_id ");
                sb.append("WHERE g1.form_id=\'" + formId + "\';");

                String sql = sb.toString();
                log.info(sql);
                return RequestResult.success(Base.findAll(sb.toString()));
            }
        });
    }
    @RequestMapping(value = "/getmtllist", method = RequestMethod.GET)
    public RequestResult<?> getmtllist(
      @RequestParam("start") final Integer start,
      @RequestParam("length") final Integer length,
      @RequestParam("mtlName") final String mtlName,
      @RequestParam("mtlId") final String mtlId
    ) {
      return ActiveJdbc.operTx(() -> {
        Long totalRecordsCount = MaterialList.count();
        Long recordsFiltered = totalRecordsCount;
        List<String> whereClause = new ArrayList<>();
        List<String> params = new ArrayList<>();
        if (!mtlName.equals("")) {
          whereClause.add("mtl_name=?");
          params.add(mtlName);
        }
        if (!mtlId.equals("")) {
          whereClause.add("mtl_id LIKE ?");
          params.add(mtlId + "%");
        }
        List<Map> mtlList;
        Boolean isSearch = !mtlName.equals("") || !mtlId.equals("");

        if (isSearch) {
          mtlList = MaterialList.where(String.join(" AND ", whereClause), params.toArray(new Object[0]))
            .offset(start)
            .limit(length)
            .toMaps();
          recordsFiltered = MaterialList.count(String.join(" AND ", whereClause), params.toArray(new Object[0]));
        } else {
          mtlList = MaterialList.where("1")
            .offset(start)
            .limit(length)
            .toMaps();
        }
        Map result = new HashMap();
        result.put("recordsTotal", totalRecordsCount);
        result.put("recordsFiltered", recordsFiltered);
        result.put("data", mtlList);
        return success(result);
      });
    }
}
