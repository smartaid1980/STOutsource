package com.servtech.servcloud.app.controller.feedback;


import com.google.common.collect.ObjectArrays;
import com.servtech.servcloud.app.model.feedback.*;
import com.servtech.servcloud.app.model.feedback.view.DemandQuestionsView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.sun.org.apache.regexp.internal.RE;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.DBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.*;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.PreparedStatement;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.RequestResult.*;
import static org.springframework.web.bind.annotation.RequestMethod.*;

@RestController
@RequestMapping("/feedback/demandlist")
public class DemandController {
    private static final Logger logger = LoggerFactory.getLogger(DemandController.class);
    //    private static final int RE_ACTION = 15;
    private static final String NUM_FORMAT_QUE = "%07d";
    private static final String NUM_FORMAT_STD = "%010d";
    private final String QUES_LOCK = new String();
    private final String QUES_FILE_LOCK = new String();
    private final String QUES_REPLY_LOCK = new String();
    private final String LOG_LOCK = new String();


    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                DemandList demandList = new DemandList();
                String userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                String dateStr = sdf.format(new Date());
                data.put("create_by", userId);
                data.put("create_time", dateStr);
                data.put("modify_by", userId);
                data.put("modify_time", dateStr);
                data.put("is_close", "N");
//                data.put("po_check", "N");
                demandList.fromMap(data);

                if (demandList.insert()) {
                    Demand demand = new Demand(data);
                    demandList = DemandList.findFirst("form_id=? AND create_time=?", demand.form_id, dateStr);
                    demand.seq_no = demandList.get("seq_no").toString();
                    return success(demand.seq_no);
                } else {
                    return fail("需求單號: " + data.get("form_id").toString() +  " 新增失敗 請確認..");
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(method = GET)
    public RequestResult<?> get(@RequestParam("form_id") String form_id,
                                @RequestParam("seq_no") String seq_no,
                                @RequestParam("sup_id") String sup_id) {
        try {
            return ActiveJdbc.operTx(() -> {
                String userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                List<Map> userList = Base.findAll("SELECT " +
                        "user_group.user_id, " +
                        "user_group.group_id, " +
                        "group_auth.auth_id " +
                        "FROM  " +
                        "m_sys_group_auth as group_auth  " +
                        "LEFT JOIN " +
                        "m_sys_user_group as user_group " +
                        "on (user_group.group_id = group_auth.group_id) " +
                        "WHERE user_group.user_id=? ", userId);
                UserAuth userAuth = new UserAuth(userList);
                Map<String, Object> result = new HashMap<>();
                List<String> quIds = new ArrayList<>();
                DemandList demandList = DemandList.findFirst("form_id=? AND seq_no=? AND sup_id=?", form_id, seq_no, sup_id);
                if (demandList == null) {
                    return success(Collections.EMPTY_MAP);
                }else {
                    if (userAuth.isFeedbackAuth() || userAuth.getGroups().contains(sup_id)) {
                        result.put("form_id", demandList.getString("form_id"));
                        result.put("seq_no", demandList.getString("seq_no"));
                        result.put("sup_id", demandList.getString("sup_id"));
                        result.put("form_type", demandList.getString("form_type"));
                        result.put("is_close", demandList.getString("is_close"));
                        result.put("st_lead_time", demandList.getString("st_lead_time"));
                        result.put("create_by", demandList.getString("create_by"));
                        result.put("create_time", demandList.getString("create_time"));
                        result.put("modify_by", demandList.getString("modify_by"));
                        result.put("modify_time", demandList.getString("modify_time"));


                        PoList poList = PoList.findFirst("po_no=? AND seq_no=? AND sup_id=?", form_id, seq_no, sup_id);
                        if (poList != null) {
                            result.put("orig_lead_time", poList.getString("orig_lead_time"));
                            result.put("cfm_lead_time", poList.getString("cfm_lead_time"));

                            List<Map<String, Object>> itemList = new ArrayList<>();
                            Map<String, Object> itemMap = new HashMap<>();
                            itemMap.put("item_id", poList.getString("item_id"));
                            itemMap.put("item_name", poList.getString("item_name"));
                            itemMap.put("item_spec", poList.getString("item_spec"));
                            itemMap.put("po_qty", poList.getString("po_qty"));
                            itemMap.put("unit", poList.getString("unit"));
                            itemList.add(itemMap);

                            result.put("items", itemList);
                        }

                        List<Questions> questionsList = null;
                        if (userAuth.classifiedAuth) {
                            questionsList = Questions.find("form_id=? AND seq_no=? AND sup_id=? ORDER BY  create_time ASC", form_id, seq_no, sup_id);
                        } else {
                            questionsList = Questions.find("form_id=? AND seq_no=? AND sup_id=? AND is_classified= ?ORDER BY  create_time ASC", form_id, seq_no, sup_id, "N");
                        }
                        if (questionsList.size() > 0) {
                            List<Map<String, Object>> quesList = new ArrayList<>();

                            for (Questions questions : questionsList) {
                                Map<String, Object> map = new HashMap<>();
                                map.put("class", questions.getString("class"));
                                map.put("qu_id", questions.getString("qu_id"));
                                quIds.add(questions.getString("qu_id"));
                                map.put("title", questions.getString("title"));
                                map.put("status", questions.getString("status"));
                                map.put("create_time", questions.getString("create_time"));
                                map.put("create_by", questions.getString("create_by"));
                                quesList.add(map);
                            }
                            result.put("questions", quesList);
                        }
                        if (quIds.size() > 0) {
                            StringBuilder sb = new StringBuilder("qu_id IN (");
                            String sep = "";
                            for (String quId : quIds) {
                                sb.append(sep);
                                sb.append("?");
                                sep = ",";
                            }
                            sb.append(") order by upload_time asc");
                            List<Map> quesFileList = QuestionsFile.find(sb.toString(), quIds.toArray(new String[0])).include().toMaps();
                            if (quesFileList.size() > 0) {
                                result.put("files", quesFileList);
                            }
                        }

                        Supplier supplier = Supplier.findFirst("sup_id=?", sup_id);
                        Map<String, Object> supMap = new HashMap<>();
                        List<Map<String, Object>> supList = new ArrayList<>();
                        supMap.put("sup_name", supplier.getString("sup_name"));
                        supMap.put("manager", supplier.getString("manager"));
                        supMap.put("contact", supplier.getString("contact"));
                        supMap.put("tel1", supplier.getString("tel1"));
                        supMap.put("tel2", supplier.getString("tel2"));
                        supMap.put("fax_no", supplier.getString("fax_no"));
                        supMap.put("email", supplier.getString("email"));
                        supMap.put("address", supplier.getString("address"));
                        supList.add(supMap);

                        result.put("suppliers", supList);

                        return success(result);
                    }else {
                        return success(Collections.EMPTY_MAP);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(method = PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String form_id = data.get("form_id").toString();
                String seq_no = data.get("seq_no").toString();
                String sup_id = data.get("sup_id").toString();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                Date nowDateTime = new Date();
                DemandList demandList = DemandList.findFirst("form_id=? AND seq_no=? AND sup_id=? ", form_id, seq_no, sup_id);
                Object prevLeadTime = demandList.get("st_lead_time");
                java.sql.Timestamp currDate = new java.sql.Timestamp(nowDateTime.getTime());

                if (data.get("is_close") != null) {
                    if (data.get("is_close").toString().equals("Y")) {
                        data.put("close_time", currDate);
                    }
                }
                data.put("modify_time", currDate);
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());
                demandList = new DemandList();
                demandList.fromMap(data);
                if (demandList.saveIt()) {
                    //這邊是確認交期
                    if (data.get("po_check") != null && data.get("po_check").toString().equals("Y")) {
                        LeadTimeChgLog leadTimeChgLog = LeadTimeChgLog.findFirst("form_id=? AND seq_no=? AND sup_id=? ORDER BY create_time DESC",
                                form_id, seq_no, sup_id);
                        leadTimeChgLog.set("check_by", user);
                        leadTimeChgLog.set("check_time", currDate);
                        if (leadTimeChgLog.saveIt()) {
                            List<String> commandList = new ArrayList<>();
                            commandList.add("2");
                            commandList.add(form_id);
                            commandList.add(sdf.format(nowDateTime));
                            runCmd(commandList, false);
//                            if (runCmd(commandList, true)) {
//                                return success(data);
//                            } else {
//                                return fail(data);
//                            }
                        } else {
                            return fail(data);
                        }
                    }

                    //這裡是修改交期
                    if (data.get("st_lead_time") != null) {

                        LeadTimeChgLog leadTimeChgLog = new LeadTimeChgLog();
                        leadTimeChgLog.set("form_id", form_id);
                        leadTimeChgLog.set("seq_no", seq_no);
                        leadTimeChgLog.set("sup_id", sup_id);
                        leadTimeChgLog.set("orig_lead_time", prevLeadTime);
                        leadTimeChgLog.set("chg_lead_time", data.get("st_lead_time"));
                        leadTimeChgLog.set("create_by", user);
                        leadTimeChgLog.set("create_time", currDate);
                        if (leadTimeChgLog.insert()) {

                            String url = "<a href='%s'> %s </a>";
                            try {
                                String appURL = "http://" + InetAddress.getLocalHost().getHostAddress() + ":58080/ServCloud/index.html#app/FeedbackDemandListManagement/function/"
                                        + "zh_tw"
                                        + "/11_demandlist_detail.html?";
//                                String param = java.net.URLEncoder.encode("formId=" + form_id + "&seqNo=" + seq_no + "&supId=" + sup_id, "UTF-8");
                                String param = "formId=" + form_id + "&seqNo=" + seq_no + "&supId=" + sup_id;
                                url = String.format(url, appURL + param, form_id);
                            } catch (UnknownHostException e) {
                                e.printStackTrace();
                            }
                            List<String> commandList = new ArrayList<>();
                            commandList.add("4");
                            commandList.add(form_id);
                            commandList.add(seq_no);
                            commandList.add(sup_id);
                            commandList.add(url);
                            runCmd(commandList, false);
                            return success(data);
                        } else {
                            return fail(data);
                        }
                    }
                } else {
                    return fail(data);
                }
                return success();
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/file/{type}", method = POST)
    public RequestResult<?> addFile (@PathVariable String type,
                                     @RequestParam("file") MultipartFile file,
                                     @RequestParam("qu_id") String qu_id) {
        synchronized (QUES_FILE_LOCK) {
            try {
                return ActiveJdbc.operTx(() -> {
                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    String path = String.join("/", System.getProperty(SysPropKey.CUST_PARAM_PATH),
                            "FeedBack", qu_id);
                    File fileRoot = new File(path);
                    if (!fileRoot.exists()) {
                        fileRoot.mkdirs();
                    }
                    Map data = new HashMap();
                    File targetFile = new File(fileRoot.getAbsolutePath(), file.getOriginalFilename());
                    data.put("qu_id", qu_id);
                    data.put("file_type", type);
                    data.put("file_name", file.getOriginalFilename());
                    data.put("upload_time", new java.sql.Timestamp(new Date().getTime()));
                    data.put("file_path", fileRoot.getAbsolutePath());
                    data.put("upload_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());
                    int num_seq = 1;
                    QuestionsFile questionsFile = QuestionsFile.findFirst("ORDER BY file_id desc");
                    if (questionsFile != null) {
                        num_seq = Integer.parseInt(questionsFile.getString("file_id")) + 1;
                    } else {
                        questionsFile = new QuestionsFile();
                    }
                    String file_id = String.format(NUM_FORMAT_STD, num_seq);

                    data.put("file_id", file_id);
                    questionsFile.fromMap(data);
                    try {
                        if (questionsFile.insert()) {
                            file.transferTo(targetFile);
                            insertQuestionProcessLog(qu_id, user, "3", file_id);
                            return success();
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                        return fail("加工問題單號: " + qu_id + "附件上傳失敗...");
                    }
                    return fail(data);
                });
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        }
    }

    @RequestMapping(value = "/file/{file_id}", method = GET)
    public void getFile (@PathVariable String file_id,
                         @RequestParam("file_path") String file_path,
                         @RequestParam("file_name") String file_name) {
        try {

            ActiveJdbc.operTx(() -> {
                String userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                QuestionsDownloadLog downloadLog = new QuestionsDownloadLog();
                downloadLog.set("file_id", file_id);
                downloadLog.set("download_time", new java.sql.Timestamp(new Date().getTime()));
                downloadLog.set("download_by", userId);
                downloadLog.insert();
                return null;
            });
            Path path = Paths.get(file_path, file_name);
            File file = path.toFile();
            String mimeType = Files.probeContentType(path);
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\" " +  java.net.URLEncoder.encode(file.getName(), "UTF-8") + "\"";
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            ServletOutputStream out = response.getOutputStream();
            com.google.common.io.Files.copy(file, response.getOutputStream());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    @RequestMapping(value = "/leadtimelog/{form_id}", method = GET)
    public RequestResult<?> getLeadTimeLog(@PathVariable("form_id") String form_id,
                                           @RequestParam("seq_no") String seq_no,
                                           @RequestParam("sup_id") String sup_id) {
        try {
            return ActiveJdbc.operTx(() -> {
                return success(LeadTimeChgLog.find("form_id=? AND seq_no=? AND sup_id=? ", form_id, seq_no, sup_id).include().toMaps());
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }

    }

    @RequestMapping(value = "/questions", method = POST)
    public RequestResult<?> createQuestions(@RequestBody final Map data) {
        synchronized (QUES_LOCK) {
            try {
                return ActiveJdbc.operTx(() -> {
                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    java.sql.Timestamp currTime = new java.sql.Timestamp(new Date().getTime());
                    data.put("create_by", user);
                    data.put("create_time", currTime);
                    data.put("modify_by", user);
                    data.put("modify_time", currTime);
                    data.put("status", "1");
                    Questions questions = Questions.findFirst("ORDER BY create_time DESC");
                    int num_seq = 1;
                    if (questions != null) {
                        num_seq = Integer.parseInt(questions.getString("qu_id")) + 1;
                    } else {
                        questions = new Questions();
                    }
                    String qu_id = String.format(NUM_FORMAT_QUE, num_seq);
                    data.put("qu_id", qu_id);
                    questions.fromMap(data);
                    if (questions.insert()) {
                        questions = Questions.findFirst("form_id=? AND seq_no=? AND sup_id=? ORDER BY create_time DESC",
                                data.get("form_id").toString(),
                                data.get("seq_no").toString(),
                                data.get("sup_id").toString());
                        if (insertQuestionProcessLog(qu_id, user, "0", "") &&
                                insertQuestionProcessLog(qu_id, user, "1", "1") &&
                                insertQuestionProcessLog(qu_id, user, "2", data.get("assign_to").toString())
                        ) {
                            String url = "<a href='%s'>%s</a>";
                            try {
                                String appURL = "http://" + InetAddress.getLocalHost().getHostAddress() + ":58080/ServCloud/index.html#app/FeedbackDemandListManagement/function/"
                                        + "zh_tw"
                                        + "/12_processing_problem.html?";
                                String params = "quId=" + qu_id;
                                url = String.format(url, appURL + params, qu_id);
                            } catch (UnknownHostException e) {
                                e.printStackTrace();
                            }

                            List<String> commandList = new ArrayList<>();
                            commandList.add("5");
                            commandList.add(data.get("form_id").toString());
                            commandList.add(data.get("seq_no").toString());
                            commandList.add(data.get("sup_id").toString());
                            commandList.add(data.get("assign_to").toString());
                            commandList.add(data.get("is_classified").toString());
                            commandList.add("新增問題");
                            commandList.add(url);
                            runCmd(commandList, false);
                            return success(qu_id);
                        } else {
                            return fail(data);
                        }
                    }
                    return fail(data);
                });
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        }

    }

    @RequestMapping(value = "/questions", method = GET)
    public RequestResult<?> getQuestion(@RequestParam("qu_id") String qu_id) {
        try {
            return ActiveJdbc.oper(() -> {
                String userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                List<Map> userList = Base.findAll("SELECT " +
                        "user_group.user_id, " +
                        "user_group.group_id, " +
                        "group_auth.auth_id " +
                        "FROM  " +
                        "m_sys_group_auth as group_auth  " +
                        "LEFT JOIN " +
                        "m_sys_user_group as user_group " +
                        "on (user_group.group_id = group_auth.group_id) " +
                        "WHERE user_group.user_id=? ", userId);
//                UserAuth userAuth = new UserAuth(SysUserGroup.find("user_id=?", userId).include().toMaps());
                UserAuth userAuth = new UserAuth(userList);

                Map<String, Object> result = new HashMap<>();
                Questions questions = null;

                questions = Questions.findFirst("qu_id=?", qu_id);
                if (questions == null) {
                    return success(Collections.EMPTY_MAP);
                } else {
                    String supId = questions.getString("sup_id");
                    String is_classified = questions.getString("is_classified");
                    if (userAuth.isFeedbackAuth() || userAuth.getGroups().contains(supId)) {
                        result.put("qu_id", questions.getString("qu_id"));
                        result.put("form_id", questions.getString("form_id"));
                        result.put("seq_no", questions.getString("seq_no"));
                        result.put("sup_id", questions.getString("sup_id"));
                        result.put("create_time", questions.getString("create_time"));
                        result.put("create_by", questions.getString("create_by"));
                        result.put("prev_assign_to", questions.getString("prev_assign_to"));
                        result.put("assign_to", questions.getString("assign_to"));
                        result.put("class", questions.getString("class"));
                        result.put("status", questions.getString("status"));
                        result.put("modify_time", questions.getString("modify_time"));
                        result.put("title", questions.getString("title"));
                        result.put("description", questions.getString("description"));
                        result.put("is_classified", questions.getString("is_classified"));

                        List<Map> questionReplyList = QuestionsReply.find("qu_id=? order by reply_time asc", qu_id).include().toMaps();
                        if (questionReplyList.size() > 0) {
                            result.put("replys", questionReplyList);
                        }

                        List<Map> quesFileList = QuestionsFile.find("qu_id=? order by upload_time asc", qu_id).include().toMaps();
                        if (quesFileList.size() > 0) {
                            result.put("files", quesFileList);
                        }

                        List<Map> logList = QuestionsProcessLog.find("qu_id=? order by process_time asc", qu_id).include().toMaps();
                        if (logList.size() > 0) {
                            result.put("logs", logList);
                        }
                        if (is_classified.equals("Y")) {
                            if (!userAuth.isClassifiedAuth()) {
                                result = Collections.EMPTY_MAP;
                            }
                        }
                    } else {
                        return success(Collections.EMPTY_MAP);
                    }
                }
                return success(result);

            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/questions", method = PUT)
    public RequestResult<?> updateQuestions(@RequestBody final Map data) {
        String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        java.sql.Timestamp timestamp = new java.sql.Timestamp(new Date().getTime());
        try {
            return ActiveJdbc.operTx(() -> {
                PreparedStatement ps = null;
                Questions questions = null;
                List<String> quIds = (List) data.get("qu_id");
                if (data.get("status") != null) {
                    int status = Integer.parseInt(data.get("status").toString());

                    for (String quId : quIds) {
                        questions = new Questions();
                        Map<String, Object> dataObj = new HashMap<>();
                        dataObj.put("qu_id", quId);
                        dataObj.put("status", data.get("status").toString());
                        dataObj.put("modify_by", user);
                        dataObj.put("modify_time", timestamp);
                        questions.fromMap(dataObj);

                        questions.saveIt();
                        insertQuestionProcessLog(quId, user, "1", data.get("status").toString());
                    }
                    return success();
                }

                if (data.get("assign_to") != null) {
                    String assign_to = data.get("assign_to").toString();
                    for (String quId : quIds) {
                        questions = Questions.findFirst("qu_id=? ", quId);
                        String prevAssign = questions.getString("assign_to");
                        Map<String, Object> dataObj = new HashMap<>();
                        dataObj.put("qu_id", quId);
                        dataObj.put("assign_to", assign_to);
                        dataObj.put("prev_assign_to", prevAssign);
                        dataObj.put("modify_by", user);
                        dataObj.put("modify_time", timestamp);
                        questions.fromMap(dataObj);

                        questions.saveIt();
                        insertQuestionProcessLog(quId, user, "2", assign_to);
                        String url = "<a href='%s'>%s</a>";
                        try {
                            String appURL = "http://" + InetAddress.getLocalHost().getHostAddress() + ":58080/ServCloud/index.html#app/FeedbackDemandListManagement/function/"
                                    + "zh_tw"
                                    + "/12_processing_problem.html?";
//                            String params = java.net.URLEncoder.encode("quId=" + quId, "UTF-8");
                            String params = "quId=" + quId;
                            url = String.format(url, appURL + params, quId);
                        } catch (UnknownHostException e) {
                            e.printStackTrace();
                        }
                        List<String> commandList = new ArrayList<>();
                        commandList.add("5");
                        commandList.add(questions.getString("form_id"));
                        commandList.add(questions.getString("seq_no"));
                        commandList.add(questions.getString("sup_id"));
                        commandList.add(questions.getString("assign_to"));
                        commandList.add(questions.getString("is_classified"));
                        commandList.add("已指派");
                        commandList.add(url);
                        runCmd(commandList, false);
                    }
                    return success();
                }

                if (data.get("is_classified") != null) {
                    String is_classified = data.get("is_classified").toString();
                    for (String quId : quIds) {
                        questions = new Questions();
                        Map<String, Object> dataObj = new HashMap<>();
                        dataObj.put("qu_id", quId);
                        dataObj.put("is_classified", is_classified);
                        dataObj.put("modify_by", user);
                        dataObj.put("modify_time", timestamp);
                        questions.fromMap(dataObj);

                        questions.saveIt();
                        insertQuestionProcessLog(quId, user, "5", is_classified);
                    }
                    return success();
                }
                return fail(data);
            });


        } catch (Exception e) {
            e.printStackTrace();
            return fail(data);
        }
    }

    @RequestMapping(value = "/questions/reply", method = POST)
    public RequestResult<?> createQuestionsReply(@RequestBody final Map data) {
        String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        java.sql.Timestamp timestamp = new java.sql.Timestamp(new Date().getTime());
        synchronized (QUES_REPLY_LOCK) {
            try {
                return ActiveJdbc.operTx(() -> {
                    String quId = data.get("qu_id").toString();
                    data.put("reply_by", user);
                    data.put("reply_time", timestamp);
                    String type = data.get("content").toString();
                    if (type.equals("")) {
                        type = "新增附件";
                    } else {
                        type = "回覆問題";
                    }
                    QuestionsReply questionsReply = QuestionsReply.findFirst("ORDER BY reply_id desc");
                    int num_seq = 1;
                    if (questionsReply != null) {
                        num_seq = Integer.parseInt(questionsReply.getString("reply_id")) + 1;
                    } else {
                        questionsReply = new QuestionsReply();
                    }
                    String reply_id = String.format(NUM_FORMAT_STD, num_seq);
                    data.put("reply_id", reply_id);
                    questionsReply.fromMap(data);
                    if (questionsReply.insert()) {
                        if (insertQuestionProcessLog(quId, user, "4", reply_id)) {
                            Questions questions = Questions.findFirst("qu_id=?", quId);
                            String url = "<a href='%s'>%s</a>";
                            try {
                                String appURL = "http://" + InetAddress.getLocalHost().getHostAddress() + ":58080/ServCloud/index.html#app/FeedbackDemandListManagement/function/"
                                        + "zh_tw"
                                        + "/12_processing_problem.html?";
                                String params = "quId=" + quId;
                                url = String.format(url, appURL + params, quId);
                            } catch (UnknownHostException e) {
                                e.printStackTrace();
                            }
                            List<String> commandList = new ArrayList<>();
                            commandList.add("5");
                            commandList.add(questions.getString("form_id"));
                            commandList.add(questions.getString("seq_no"));
                            commandList.add(questions.getString("sup_id"));
                            commandList.add(questions.getString("assign_to"));
                            commandList.add(questions.getString("is_classified"));
                            commandList.add(type);
                            commandList.add(url);
                            runCmd(commandList, false);
                            return success(quId);
                        } else {
                            return fail(data);
                        }
                    }
                    return fail(data);
                });

            } catch (Exception e) {
                return fail(data);
            }
        }
    }

    @RequestMapping(value = "/questions/filelog", method = GET)
    public RequestResult<?> getQuestionFileDownloadLog(@RequestParam("file_id") String file_id) {
        try {
            return ActiveJdbc.operTx(() -> {
                String sqlExpress = "SELECT log.*, file.file_name from a_feedback_questions_download_log as log " +
                        "LEFT JOIN " +
                        "a_feedback_questions_file as file " +
                        "on log.file_id = file.file_id " +
                        "WHERE " +
                        "log.file_id=?";
                return success(Base.findAll(sqlExpress, file_id));
            });
        } catch (Exception e) {
            return fail("file_id: " + file_id);
        }
    }

    @RequestMapping(value = "/type/{type}", method = GET)
    public RequestResult<?> get(@PathVariable String type) {
        try {
            return ActiveJdbc.operTx(() -> {
                String userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                List<Map> userList = Base.findAll("SELECT " +
                        "user_group.user_id, " +
                        "user_group.group_id, " +
                        "group_auth.auth_id " +
                        "FROM  " +
                        "m_sys_group_auth as group_auth  " +
                        "LEFT JOIN " +
                        "m_sys_user_group as user_group " +
                        "on (user_group.group_id = group_auth.group_id) " +
                        "WHERE user_group.user_id=? ", userId);
//                UserAuth userAuth = new UserAuth(SysUserGroup.find("user_id=?", userId).include().toMaps());
                UserAuth userAuth = new UserAuth(userList);
                switch (type) {
                    case "0":
                        return getDemandByNotClose(request, userAuth);
                    case "1":
                        return getDemandByQuery(request, userAuth);
                    case "2":
                        return getDemandByForm(request, userAuth);
                    default:
                        return fail(Collections.EMPTY_MAP);
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }


    private RequestResult<?> getDemandByNotClose(HttpServletRequest request, UserAuth userAuth) {
        String mode = request.getParameter("select_mode");
        StringBuilder sb = new StringBuilder();
        List<String> paramList = new ArrayList<>();
        switch (mode) {
            case "0":
                sb.append("is_close=? ");
                paramList.add("N");
                if (!userAuth.isFeedbackAuth()) {
                    sb.append(" AND " + userAuth.getSupIdExpress());
                    paramList.addAll(userAuth.getGroups());
                }


                return success(DemandQuestionsView.find(sb.toString(), paramList.toArray(new String[0])).include().toMaps());

            case "1":
                sb.append("status in (?, ?) AND class=? ");
                paramList.add("0");
                paramList.add("1");
                paramList.add("1");
                if (!userAuth.isFeedbackAuth()) {
                    sb.append("AND " + userAuth.getSupIdExpress());
                    paramList.addAll(userAuth.getGroups());
                } else {
//                    if (!userAuth.isClassifiedAuth()) {
//                        sb.append("AND " + "is_classified=? ");
//                        paramList.add("N");
//                    }
                }
                return success(DemandQuestionsView.find(sb.toString(), paramList.toArray(new String[0])).include().toMaps());

            case "2":
                sb.append("status in (?, ?) ");
                paramList.add("0");
                paramList.add("1");
                if (userAuth.isFeedbackAuth()) {
//                    if (userAuth.isClassifiedAuth()) {
//                    } else {
//                        sb.append("AND is_classified=? ");
//                        paramList.add("N");
//                    }
                } else {
                    sb.append("AND ");
                    sb.append(userAuth.getSupIdExpress());
                    paramList.addAll(userAuth.getGroups());
                }
                return success(DemandQuestionsView.find(sb.toString(), paramList.toArray(new String[0])).include().toMaps());

            case "3":
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
                String currDateStr = dateFormat.format(new Date());
                sb.append("st_lead_time < ? AND is_close=?");
                paramList.add(currDateStr);
                paramList.add("N");
                if (!userAuth.isFeedbackAuth()) {
                    sb.append("AND ");
                    sb.append(userAuth.getSupIdExpress());
                    paramList.addAll(userAuth.getGroups());
                }
                return success(DemandQuestionsView.find(sb.toString(), paramList.toArray(new String[0])).include().toMaps());
            case "4":
                sb.append("assign_to in (");
                String sp = "";
                for (String group : userAuth.getGroups()) {
                    sb.append(sp);
                    sb.append("'");
                    sb.append(group);
                    sb.append("'");
                    sp = ",";
                }
                sb.append(") ");
                sb.append("AND is_close='N'");
                List<DemandQuestionsView> viewList = DemandQuestionsView.find(sb.toString()).include();

                Set<String> targets = new HashSet<>();
                StringBuilder sb2 = new StringBuilder();
                if (viewList.size() > 0 ){
                    for (DemandQuestionsView demandQuestionsView : viewList) {
                        String form_id = demandQuestionsView.getString("form_id");
                        String seq_no = demandQuestionsView.getString("seq_no");
                        String express = " (form_id='" + form_id +"' AND seq_no='"+ seq_no +"') ";
                        targets.add(express);
                    }
                }
                if (targets.size() > 0) {
                    String split = "";
                    for (String target : targets) {
                        sb2.append(split);
                        sb2.append(target);
                        split = " OR ";
                    }
                } else {
                    return success(Collections.EMPTY_MAP);
                }
                return success(DemandQuestionsView.find(sb2.toString()).include().toMaps());
            default:
                return fail(Collections.EMPTY_MAP);
        }
    }

    private RequestResult<?> getDemandByQuery (HttpServletRequest request, UserAuth userAuth) {
        String startDate = request.getParameter("start_date");
        String endDate = request.getParameter("end_date");
        String formType = request.getParameter("form_type");
        String supId = request.getParameter("sup_id");
        String[] isClose = request.getParameterValues("is_close[]");

        StringBuilder sb = new StringBuilder();
        List<String> paramList = new ArrayList<>();
        sb.append("st_lead_time BETWEEN ? AND ? ");
        paramList.add(startDate);
        paramList.add(endDate);
        if (formType != null) {
            sb.append("AND form_type=? ");
            paramList.add(formType);
        }

        if (supId != null) {
            String sp = "";
            if (userAuth.isFeedbackAuth()) {
                sb.append("AND sup_id=? ");
                paramList.add(supId);
            } else {
                sb.append("AND sup_id in (");
                for (String group : userAuth.getGroups()) {
                    sb.append(sp);
                    sb.append("'");
                    sb.append(group);
                    sb.append("'");
                    sp = ",";
                }
                sb.append(") ");
            }
        } else {
            String sp = "";
            if (!userAuth.isFeedbackAuth()) {
                sb.append("AND sup_id in (");
                for (String group : userAuth.getGroups()) {
                    sb.append(sp);
                    sb.append("'");
                    sb.append(group);
                    sb.append("'");
                    sp = ",";
                }
                sb.append(") ");
            }
        }

        if (isClose != null && isClose.length > 0) {
            sb.append("AND is_close IN (");
            String sep = "";
            for (String status : isClose) {
                sb.append(sep);
                sb.append("?");
                paramList.add(status);
                sep = ",";
            }
            sb.append(") ");
        }
        return success(DemandQuestionsView.find(sb.toString(), paramList.toArray(new String[0])).include().toMaps());
    }

    private RequestResult<?> getDemandByForm(HttpServletRequest request, UserAuth userAuth) {
        String formId = request.getParameter("form_id");
        StringBuilder sb = new StringBuilder();
        List<String> paramList = new ArrayList<>();
        if (formId == null) {return fail(Collections.EMPTY_MAP);}
        sb.append("form_id=? ");
        paramList.add(formId);
        if (!userAuth.isFeedbackAuth()) {
            sb.append("AND ");
            sb.append(userAuth.getSupIdExpress());
            paramList.addAll(userAuth.getGroups());
        }
        return success(DemandQuestionsView.find(sb.toString(), paramList.toArray(new String[0])).include().toMaps());
    }

    private Boolean insertQuestionProcessLog(String qu_id, String process_by, String process_status, String message) {
        synchronized (LOG_LOCK) {
            Map<String, Object> data = new HashMap<>();
            java.sql.Timestamp timestamp = new java.sql.Timestamp(new Date().getTime());
            data.put("qu_id", qu_id);
            data.put("process_by", process_by);
            data.put("process_status", process_status);
            data.put("process_time", timestamp);
            data.put("assignment", message);
            QuestionsProcessLog log = QuestionsProcessLog.findFirst("ORDER BY log_id desc");
            int num_seq = 1;
            if (log != null) {
                num_seq = Integer.parseInt(log.getString("log_id")) + 1;
            } else {
                log = new QuestionsProcessLog();
            }
            String log_id = String.format(NUM_FORMAT_STD, num_seq);
            data.put("log_id", log_id);
            log.fromMap(data);
            if (log.insert()) {
                return true;
            } else {
                num_seq++;
                log_id = String.format(NUM_FORMAT_STD, num_seq);
            }
            return false;
        }
    }

    private Boolean runCmd(List<String> params, boolean wait) {

        String batTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/app/FeedbackDemandListManagement/program/DemandList";
        String runBatPath = batTarget + "/run.bat";
        List<String> commandList = new ArrayList<>();
        commandList.add(runBatPath);
        commandList.addAll(params);
        String[] commands = commandList.toArray(new String[0]);
        FeedbackSyncAndMailCmd cmd = new FeedbackSyncAndMailCmd(commands, null, new File(batTarget));
        int result = cmd.runCmd(wait);
        if (result == 0) {
            return true;
        } else {
            return false;
        }
    }

    static class UserAuth {
        private static final String classifiedKey = "confidential_auth";
        //        private static final List<String> feedbackGroups = Arrays.asList(new String[] {"po_group", "mis_group", "pe_group", "qc_group"});
        private boolean feedbackAuth = true;
        private boolean classifiedAuth = false;
        private List<String> groups = new ArrayList<String>();

        UserAuth(List<Map> data) {
            for (int len = 0, groupSize = data.size(); len < groupSize; len++) {
                String group = data.get(len).get("group_id").toString();
                String auth = data.get(len).get("auth_id").toString();
                if (auth.equals(classifiedKey)) {
                    classifiedAuth = true;
                }
                if (auth.equals("supplier_auth")) {
                    feedbackAuth = false;
                    classifiedAuth = true;
                }
                groups.add(group);
            }
        }

        public boolean isFeedbackAuth() {
            return feedbackAuth;
        }

        public boolean isClassifiedAuth() {
            return classifiedAuth;
        }

        public List<String> getGroups() {
            return groups;
        }
        public String getSupIdExpress() {
            StringBuilder sb = new StringBuilder();
            String line = "";
            String sep = "";
            sb.append("sup_id IN (");
            for (String group : groups) {
                sb.append(sep);
                sb.append("?");
                sep = ",";
            }
            sb.append(") ");
            return sb.toString();
        }
    }

    static class Demand {

        String form_id;
        String seq_no;
        String sup_id;
        String form_type;
        String st_lead_time;
        String po_check;
        String is_close = "N";
        String close_time;
        Question question;
        String create_by;
        String modify_by;
        String create_time;
        String modify_time;

        public Demand(Map data) {
            this.form_id = data.get("form_id").toString();
            this.sup_id = data.get("sup_id").toString();
            this.form_type = data.get("form_type").toString();
            this.create_time = data.get("create_time").toString();
            this.modify_time = data.get("modify_time").toString();
            if (data.get("seq_no") != null) {
                this.seq_no = data.get("seq_no").toString();
            }

            if (data.get("st_lead_time") != null) {
                this.st_lead_time = data.get("st_lead_time").toString();
            }

            if (data.get("class") != null && data.get("title") != null && data.get("description") != null) {
                question = new Question();
                question.question_class = data.get("class").toString();
                question.title = data.get("title").toString();
                question.description = data.get("description").toString();
                question.assign_to = this.sup_id;
            }
        }

        public Questions toQuestion() {
            Map<String, Object> data = new HashMap<>();
            data.put("form_id", this.form_id);
            data.put("seq_no", this.seq_no);
            data.put("sup_id", this.sup_id);
            data.put("class", question.question_class);
            data.put("status", question.status);
            data.put("title", question.title);
            data.put("description", question.description);
            data.put("assign_to", question.assign_to);
            data.put("is_classified", question.is_classified);
            data.put("create_by", this.create_by);
            data.put("create_time", this.create_time);
            data.put("modify_by", this.modify_by);
            data.put("modify_time", this.modify_time);
            Questions questions = new Questions();
            questions.fromMap(data);
            return questions;
        }

    }

    static class Question {
        String qu_id;
        String question_class;
        String status = "1";
        String title;
        String description;
        String assign_to;
        String prev_assign_to;
        String is_classified = "N";
    }

//    static enum QuestionStatusEnum {
//        NEW(0, "新問題"), GO(1, "進行中"), CANCEL(2, "取消問題"), CLOSE(3, "關閉問題");
//
//        int status;
//        String descripttion;
//
//
//        QuestionStatusEnum(int status, String descripttion) {
//            this.status = status;
//            this.descripttion = descripttion;
//        }
//
//        public static String getDescription(int status) {
//            QuestionStatusEnum result = getEnum(status);
//            return result.descripttion;
//        }
//
//        private static QuestionStatusEnum getEnum(int status) {
//            QuestionStatusEnum result = null;
//            for (QuestionStatusEnum value : QuestionStatusEnum.values()) {
//                if (value.status == status) {
//                    result = value;
//                    break;
//                }
//            }
//            return result;
//        }
//    }

    public static class FeedbackSyncAndMailCmd {

        private String[] commands;
        private String[] envp;
        private File file;

        private FeedbackSyncAndMailCmd(String[] commands, String[] envp, File file) {
            this.commands = commands;
            this.envp = envp;
            this.file = file;
        }

        int runCmd(boolean wait) {
            try {
                ProcessBuilder pb = new ProcessBuilder(this.commands).directory(this.file).redirectErrorStream(true);
                Process proc = pb.start();
                ExecutorService executor = Executors.newCachedThreadPool();
                Callable<Integer> task = new Message(proc.getInputStream());
                Future<Integer> future = executor.submit(task);
                if (wait) {
                    proc.waitFor();
                    return future.get();
                } else {
                    return 0;
                }
            } catch (IOException e) {
                e.printStackTrace();
                return -1;
            } catch (InterruptedException e) {
                e.printStackTrace();
                return -1;
            } catch (ExecutionException e) {
                e.printStackTrace();
                return -1;
            }
        }

        static class Message implements Callable<Integer> {

            private InputStream is;
            static final String SEP = System.getProperty("line.separator");

            Message(InputStream is) {
                this.is = is;
            }

            @Override
            public Integer call() throws Exception {
                try {
                    BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                    String line = "";
                    while ((line = br.readLine()) != null) {
                        System.out.println(line);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    return -1;
                } catch (Exception e) {
                    e.printStackTrace();
                    return -1;
                }
                return 0;
            }
        }
    }
}
