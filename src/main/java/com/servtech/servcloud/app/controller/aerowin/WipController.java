package com.servtech.servcloud.app.controller.aerowin;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Kevin Big Big on 2016/9/30.
 */

@RestController
@RequestMapping("/aerowin/wip")
public class WipController {
    private final Logger log = LoggerFactory.getLogger(WipController.class);
    private final String DATE_FORMAT = "yyyy-MM-dd";
    private final String TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private final String YM_FORMAT = "yyyyMM";

    private final String START_TIME = "00:00:00";
    private final String END_TIME = "23:59:59";

    private static final String WORKING_STATUS = "1";
    private static final String FINISH_STATUS = "2";

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/productTrackingReportByRange", method = GET)
    public RequestResult<Map> productTrackingReportByRange(
            @RequestParam("productId") final String productId,
            @RequestParam("startDate") final Date startDate,
            @RequestParam("endDate") final Date endDate,
            @RequestParam("condition") final String condition
    ) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Map>>() {
            @Override
            public RequestResult<Map> operate() {
                List<Date> range = AerowinUtil.getDateList(startDate, endDate);
                String[] date = new String[range.size()];
                Map<Date, Integer> rowIndexMapByDate = new HashMap<Date, Integer>();
                for (int index = 0; index < range.size(); index++) {
                    date[index] = AerowinUtil.date2str(range.get(index), DATE_FORMAT);
                    rowIndexMapByDate.put(range.get(index), index);
                }
                //取product name
                String productName = "";
                List<Map> productNameMaps = Base.findAll(
                        "SELECT aap.product_name FROM a_aerowin_product aap" +
                                " WHERE product_id = ?", productId);
                if (productNameMaps.size() > 0) {
                    productName = productNameMaps.get(0).get("product_name").toString();
                }
                //取範圍內的wip
                List<Map> wipMaps = Base.findAll("SELECT aaw.*, aaa.op_name FROM a_aerowin_wip aaw" +
                        " LEFT JOIN a_aerowin_awmeswo aaa ON aaw.work_id = aaa.work_id AND aaw.op = aaa.op" +
                        " WHERE aaw.product_id = ? AND aaw.shift_date BETWEEN ? AND ?" +
                        " ORDER BY aaw.shift_date ASC, aaw.op ASC", productId, startDate, endDate);//排序 shift_date 和 op 因為要取最後一個
                //找出全工單ID
                Set<String> workIds = new HashSet<String>();
                for (Map wipMap : wipMaps) {
                    String workId = wipMap.get("work_id").toString();
                    workIds.add(workId);
                }



                //取品號全部工序
                List<Map> productOpMaps;
                if(workIds.size() > 0){//有工單才組
                    productOpMaps = Base.findAll("SELECT aaa.work_id, aaa.op, aaa.op_name" +
                            " FROM a_aerowin_awmeswo aaa WHERE aaa.work_id IN (" + Util.strSplitBy("?", ",", workIds.size()) + ") group by aaa.op", workIds.toArray());
                }else{
                    productOpMaps = new ArrayList<Map>();
                }
               Map<String, String> opMap = new HashMap<String, String>();
                //建立op
                TreeSet<Integer> opIdSet = new TreeSet<Integer>();
                for (Map productOpMap : productOpMaps) {
                    Integer opId = ((BigInteger) productOpMap.get("op")).intValue();
                    String opName = productOpMap.get("op_name").toString();
                    opIdSet.add(opId);
                    opMap.put(opId.toString(), opName);
                }
                String[] header = new String[opIdSet.size()];
                Map<Integer, Integer> colIndexByOpId = new HashMap<Integer, Integer>();
                int opMapIndex = 1;//因為第一欄是date，所以index從1開始編
                for (Integer opId : opIdSet) {
                    header[opMapIndex - 1] = opId.toString();
                    colIndexByOpId.put(opId, opMapIndex);
                    opMapIndex++;
                }

                List<Map> newWipMaps = new ArrayList<Map>();
                if(condition.equals("0")){//*** 工單全OP
                    newWipMaps = wipMaps;//直接設置就好
                }else{//*** 該工單該天最後一個OP
                    Map<String, Map> wipLastOpMap = new HashMap<String, Map>();
                    for(Map wipMap : wipMaps){//因為 shift_date 和 op 有排序過，所以一直放入map就會存到工單當日最後一個op
                        Date shiftDate = (Date) wipMap.get("shift_date");
                        String workId = wipMap.get("work_id").toString();
                        String shiftDateStr = AerowinUtil.date2str(shiftDate, "yyyy-MM-dd");
                        String key = workId + "@" + shiftDateStr;
                        wipLastOpMap.put(key, wipMap);
                    }
                    for(Map.Entry<String, Map> wipLastOpMapEntry: wipLastOpMap.entrySet()){
                        newWipMaps.add(wipLastOpMapEntry.getValue());
                    }
                }

                Map<String, ProductTrackingData> totalSampleWipMapByDate = new HashMap<String, ProductTrackingData>();
                Map<String, ProductTrackingData> sampleWipMap = new HashMap<String, ProductTrackingData>();
                for (Map wipMap : newWipMaps) {
                    Date shiftDate = (Date) wipMap.get("shift_date");
                    String workId = wipMap.get("work_id").toString();
                    Integer op = ((BigInteger) wipMap.get("op")).intValue();
                    //String productId = wipMap.get("product_id").toString();
                    String wipStatus = wipMap.get("wip_status").toString();
                    Integer quantity = ((BigInteger) wipMap.get("quantity")).intValue();

                    String shiftDateStr = AerowinUtil.date2str(shiftDate, DATE_FORMAT);

                    Integer rowIndex = rowIndexMapByDate.get(shiftDate);
                    Integer colIndex = colIndexByOpId.get(op);

                    String key = rowIndex + "@" + colIndex;
                    if (!sampleWipMap.containsKey(key)) {
                        sampleWipMap.put(key, new ProductTrackingData(rowIndex, colIndex));
                    }
                    sampleWipMap.get(key).addSampleWips(new SampleWip(workId, quantity, wipStatus));

                    //total
                    if (!totalSampleWipMapByDate.containsKey(shiftDateStr)) {
                        totalSampleWipMapByDate.put(shiftDateStr, new ProductTrackingData(rowIndex, colIndex));
                    }
                    totalSampleWipMapByDate.get(shiftDateStr).addSampleWips(new SampleWip(workId, quantity, wipStatus));
                }

                List<ProductTrackingData> productTrackingDatas = new ArrayList<ProductTrackingData>();
                for (Map.Entry<String, ProductTrackingData> sampleWipEntry : sampleWipMap.entrySet()) {
                    productTrackingDatas.add(sampleWipEntry.getValue());
                }

                Map result = new HashMap();

                result.put("productId", productId);
                result.put("productName", productName);
                result.put("header", header);
                result.put("date", date);
                result.put("productTrackingDatas", productTrackingDatas);
                result.put("totalSampleWipMapByDate", totalSampleWipMapByDate);
                result.put("rowSize", date.length);
                result.put("colSize", header.length);
                result.put("opMap", opMap);
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/calcWip", method = GET)
    public RequestResult<String> calcWip() {
        String dateStr = AerowinUtil.date2str(new Date(), DATE_FORMAT);
        Date endDate = AerowinUtil.str2date(dateStr, DATE_FORMAT);//當天
        Date startDate = AerowinUtil.addDay(endDate, -1);//前一天
        return calcWip(startDate, endDate);
    }

    @RequestMapping(value = "/calcWipByRange", method = GET)
    public RequestResult<String> calcWipByRange(
            @RequestParam("startDate") final Date startDate,
            @RequestParam("endDate") final Date endDate
            ) {
        return calcWip(startDate, endDate);
    }

    private RequestResult<String> calcWip(final Date startDate, final Date endDate){
        RequestResult<String> insert = ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                List<Date> range = AerowinUtil.getDateList(startDate, endDate);
                for(Date currentDate:range){
                    String dateStr = AerowinUtil.date2str(currentDate, DATE_FORMAT);
                    Date date = AerowinUtil.str2date(dateStr, DATE_FORMAT);
                    if(!calcWinByRange(date)){//*** 統計個數並插入
                        return fail("productTrackingReport calc fail, date: " + AerowinUtil.date2str(date, DATE_FORMAT));
                    }
                }
                return success();
            }
        });
        if(insert.getType() == RequestResult.TYPE_SUCCESS){
            List<Date> range = AerowinUtil.getDateList(startDate, endDate);
            for(Date date:range){
                log.info("update a_aerowin_wip quantity, date:{}", AerowinUtil.date2str(date, DATE_FORMAT));
                updateWinByRange(date);//*** 更新累計個數與狀態
            }
            return success();
        }else{
            return insert;
        }
    }

    private boolean calcWinByRange(Date shiftDat) {
        String createBy = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        Timestamp createTime = new Timestamp(System.currentTimeMillis());

        List<Map> awmesMaps = Base.findAll("SELECT aaa.work_id, aaa.op, aaa.product_id, aaa.go_no, aaa.ng_no, aaa.quantity_esp" +
                " FROM a_aerowin_awmes aaa" +
                " WHERE status IN ('TrackIn', 'TrackOut') AND aaa.shift_date = ?", shiftDat);
        log.info("calcWin shiftDate: {}", AerowinUtil.date2str(shiftDat, TIME_FORMAT));
        CalcWip calcWip = new CalcWip(shiftDat, awmesMaps);
        List<Wip> calcResults = calcWip.calc();
        for(Wip wip:calcResults){
            int count = Base.exec("INSERT INTO a_aerowin_wip (shift_date, work_id, op, product_id, wip_status, go_no, ng_no, total_no," +
                    " quantity, quantity_esp, create_by, create_time) " +
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)" +
                    " ON DUPLICATE KEY UPDATE wip_status = ?, go_no = ?, ng_no = ?, total_no = ?," +
                    "     quantity = ?, quantity_esp = ?, modify_by = ?, modify_time = ?",
                    wip.getShiftDate(), wip.getWorkId(), wip.getOp(), wip.getProductId(),
                    wip.getWipStatus(), wip.getGoNo(), wip.getNgNo(), wip.getTotalNo(), wip.getQuantity(), wip.getQuantityEsp(), createBy, createTime,
                    wip.getWipStatus(), wip.getGoNo(), wip.getNgNo(), wip.getTotalNo(), wip.getQuantity(), wip.getQuantityEsp(), createBy, createTime);
            if(count == 0){
                log.info("insert into a_aerowin_wip fail, shiftDate: {}, work_id: {}, op: {}", wip.getShiftDate(), wip.getWorkId(), wip.getOp());
                return false;
            }
        }
        return true;
    }

    private Boolean updateWinByRange(final Date date){//以這一天的工單為主，找出這一天前使用這工單ID的全部工單，計算累加
        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                //這一天未完工的wip
                List<Map> currentWipMaps = Base.findAll(
                        "SELECT aaw.shift_date, aaw.work_id, aaw.op, aaw.product_id, aaw.wip_status, aaw.go_no, aaw.ng_no, aaw.total_no, aaw.quantity, aaw.quantity_esp" +
                                " FROM a_aerowin_wip aaw" +
                                " WHERE aaw.shift_date = ? AND wip_status = ?", date, WORKING_STATUS);
                for (Map currentWipMap : currentWipMaps) {
                    String workId = currentWipMap.get("work_id").toString();
                    Integer op = ((BigInteger) currentWipMap.get("op")).intValue();
                    List<Map> oldWipMaps = Base.findAll(//取得這一天之前的這張工單和op
                            "SELECT aaw.shift_date, aaw.work_id, aaw.op, aaw.product_id, aaw.wip_status, aaw.go_no, aaw.ng_no, aaw.total_no, aaw.quantity, aaw.quantity_esp" +
                                    " FROM a_aerowin_wip aaw" +
                                    " WHERE aaw.shift_date < ? AND work_id = ? AND op = ?", date, workId, op);
                    UpdateWip updateWip = new UpdateWip(currentWipMap, oldWipMaps);
                    Wip updateWipResult = updateWip.calc();

                    int count = Base.exec("UPDATE a_aerowin_wip SET wip_status = ?, go_no = ?, ng_no = ?," +
                                    " quantity = ?" +
                                    " WHERE shift_date = ? AND work_id = ? AND op = ?",
                            updateWipResult.getWipStatus(), updateWipResult.getGoNo(), updateWipResult.getNgNo(),
                            updateWipResult.getQuantity(), updateWipResult.getShiftDate(), updateWipResult.getWorkId(), updateWipResult.getOp());

                }
                return true;
            }
        });
    }

    private class UpdateWip{
        private Wip currentWip;
        private List<Wip> oldWips;

        public UpdateWip(Map currentMap, List<Map> oldMaps){
            this.currentWip = map2wip(currentMap);
            this.oldWips = new ArrayList<Wip>();
            for(Map oldMap:oldMaps){
                this.oldWips.add(map2wip(oldMap));
            }
        }

        public Wip calc(){
            for(Wip wip:this.oldWips){//更新wip狀態並累計數量(使用totalNo來累計)
                this.currentWip.updateDataUsedCountTotalNo(wip.getQuantity());
            }
            this.currentWip.setQuantity(this.currentWip.getTotalNo());
            return this.currentWip;
        }

        private Wip map2wip(Map map){
            Date shiftDate = (Date) map.get("shift_date");
            String workId = map.get("work_id").toString();
            Integer op = ((BigInteger) map.get("op")).intValue();
            String productId = map.get("product_id").toString();
            Integer goNo = ((BigInteger) map.get("go_no")).intValue();
            Integer ngNo = ((BigInteger) map.get("ng_no")).intValue();
            Integer totalNo = ((BigInteger) map.get("total_no")).intValue();
            Integer quantityEsp = ((BigInteger) map.get("quantity_esp")).intValue();

            return new Wip(shiftDate, workId, op, productId, goNo, ngNo, totalNo, quantityEsp);
        }
    }

    private class CalcWip{
        private List<Wip> wips;
        //Map<shiftDate + workId + op, Wip>
        private Map<String, Wip> wipMap;

        public CalcWip(Date shiftDat, List<Map> awmesMaps){
            this.wips = new ArrayList<Wip>();
            this.wipMap = new HashMap<String, Wip>();
            initWips(shiftDat, awmesMaps);
        }

        private void initWips(Date shiftDat, List<Map> awmesMaps){
            for(Map awmesMap:awmesMaps){
                String workId = awmesMap.get("work_id").toString();
                Integer op = ((BigInteger) awmesMap.get("op")).intValue();
                String productId = awmesMap.get("product_id").toString();
                Integer goNo = ((BigInteger) awmesMap.get("go_no")).intValue();
                Integer ngNo = ((BigInteger) awmesMap.get("ng_no")).intValue();
                Integer quantityEsp = ((BigInteger) awmesMap.get("quantity_esp")).intValue();
                //String empId = awmesMap.get("emp_id").toString();
                //Date mesTime = (Date) awmesMap.get("mes_time");
                this.wips.add(new Wip(shiftDat, workId, op, productId, goNo, ngNo, quantityEsp));
            }
        }

        public List<Wip> calc(){
            for(Wip currentWip:this.wips){//分類中(by shift_date, work_id, op)...
                String key = currentWip.getShiftDate().toString() + "@" + currentWip.getWorkId() + "@" + currentWip.getOp();
                if(!this.wipMap.containsKey(key)){//第一次，放入map
                    this.wipMap.put(key, currentWip);
                }else{
                    Wip oldWip = this.wipMap.get(key);//已存在，更新wip狀態並累計數量
                    oldWip.updateData(currentWip.getGoNo(), currentWip.getNgNo(), currentWip.getTotalNo(), currentWip.getQuantity());//更新wip狀態並累計數量
                }
            }
            //結果轉回list
            List<Wip> results = new ArrayList<Wip>();
            for(Map.Entry<String, Wip> wipEntry:this.wipMap.entrySet()){
                results.add(wipEntry.getValue());
            }
            return results;
        }
    }

    private class Wip{
        private Integer quantityEsp;//工單數量(用來判斷工序是否完成的依據)
        private Integer totalNo;//單次生產數加總(原始個數，不會累計)

        private Date shiftDate;//班次日期
        private String workId;//工單編號
        private Integer op;//工序
        private String productId;//產品代碼
        private String wipStatus;//wip狀態 (1=生產中, 2=完成)
        private Integer goNo;//良品數
        private Integer ngNo;//不良品數
        private Integer quantity;//累計完成數量

        //給wip用
        public Wip(Date shiftDate, String workId, Integer op, String productId,
                   Integer goNo, Integer ngNo, Integer totalNo, Integer quantityEsp) {
            this.shiftDate = shiftDate;
            this.workId = workId;
            this.op = op;
            this.productId = productId;

            this.goNo = goNo;
            this.ngNo = ngNo;
            this.totalNo = totalNo;
            this.quantityEsp = quantityEsp;

            this.quantity = goNo + ngNo;
            //數量達到或超過工單數量
            if(this.quantity >= this.quantityEsp){
                this.quantity = this.quantityEsp;//不可超過工單數量，所以直接設為工單數量
                this.wipStatus = FINISH_STATUS;//完工
            }else{
                this.wipStatus = WORKING_STATUS;//生產中
            }
        }

        //給awmes用
        public Wip(Date shiftDate, String workId, Integer op, String productId,
                   Integer goNo, Integer ngNo, Integer quantityEsp) {
            this.shiftDate = shiftDate;
            this.workId = workId;
            this.op = op;
            this.productId = productId;

            this.goNo = goNo;
            this.ngNo = ngNo;

            this.quantityEsp = quantityEsp;

            this.totalNo = goNo + ngNo;//原始的加總
            this.quantity = goNo + ngNo;
            //數量達到或超過工單數量
            if(this.quantity >= this.quantityEsp){
                this.quantity = this.quantityEsp;//不可超過工單數量，所以直接設為工單數量
                this.wipStatus = FINISH_STATUS;//完工
            }else{
                this.wipStatus = WORKING_STATUS;//生產中
            }
        }

        //更新wip狀態並累計數量(使用totalNo來累計)
        public void updateDataUsedCountTotalNo(Integer newTotalNo){
            this.totalNo += newTotalNo;//*** 累計 ***
            //數量達到或超過工單數量
            if(this.totalNo >= this.quantityEsp){
                this.totalNo = this.quantityEsp;//不可超過工單數量，所以直接設為工單數量
                this.wipStatus = FINISH_STATUS;//完工
            }
        }

        //更新wip狀態並累計數量
        public void updateData(Integer newGoNo, Integer newNgNo, Integer newTotalNo, Integer newQuantity){
            this.goNo += newGoNo;
            this.ngNo += newNgNo;
            this.totalNo += newTotalNo;
            this.quantity += newQuantity;
            //數量達到或超過工單數量
            if(this.quantity >= this.quantityEsp){
                this.quantity = this.quantityEsp;//不可超過工單數量，所以直接設為工單數量
                this.wipStatus = FINISH_STATUS;//完工
            }
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Integer getQuantityEsp() {
            return quantityEsp;
        }

        public Integer getTotalNo() {
            return totalNo;
        }

        public Date getShiftDate() {
            return shiftDate;
        }

        public String getWorkId() {
            return workId;
        }

        public Integer getOp() {
            return op;
        }

        public String getProductId() {
            return productId;
        }

        public String getWipStatus() {
            return wipStatus;
        }

        public Integer getGoNo() {
            return goNo;
        }

        public Integer getNgNo() {
            return ngNo;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }

    private class ProductTrackingData{
        private int rowIndex;
        private int colIndex;
        private int total;
        private List<SampleWip> sampleWips;

        public ProductTrackingData(int rowIndex, int colIndex) {
            this.rowIndex = rowIndex;
            this.colIndex = colIndex;
            this.sampleWips = new ArrayList<SampleWip>();
        }

        public ProductTrackingData(int rowIndex, int colIndex, List<SampleWip> sampleWips) {
            this.rowIndex = rowIndex;
            this.colIndex = colIndex;
            this.sampleWips = sampleWips;

            for(SampleWip sampleWip:sampleWips){//加總數量
                this.total += sampleWip.getQuantity();
            }
        }

        public void addSampleWips(SampleWip sampleWip){
            this.sampleWips.add(sampleWip);
            this.total += sampleWip.getQuantity();
        }

        public int getRowIndex() {
            return rowIndex;
        }

        public int getColIndex() {
            return colIndex;
        }

        public int getTotal() {
            return total;
        }

        public List<SampleWip> getSampleWips() {
            return sampleWips;
        }
    }

    private class SampleWip{
        private String workId;
        private Integer quantity;
        private String status;

        public SampleWip(String workId, Integer quantity, String status) {
            this.workId = workId;
            this.quantity = quantity;
            this.status = status;
        }

        public String getWorkId() {
            return workId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public String getStatus() {
            return status;
        }
    }

}
