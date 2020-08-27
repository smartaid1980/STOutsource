package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.google.common.io.Files;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
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
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.lang.reflect.Type;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.Buffer;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Raynard on 2017/8/22.
 */
@RestController
@RequestMapping("/view")
public class KuoChuanViewController {

    private static final Logger log = LoggerFactory.getLogger(KuoChuanViewController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/pdf", method = GET)
    public RequestResult<?> pdf(@RequestParam("work_id") final String workId, @RequestParam("op") final String op) {
        try {
            File networkDriveFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "servTrack/network_drive.txt");
            if (!networkDriveFile.exists()) {
//                return "找不到網路磁碟設定檔, 請確認";
                String message = "找不到網路磁碟設定檔, 請確認";
                return  fail(message);
            }
            final NetworkDrive networkDrive = new NetworkDrive(networkDriveFile);
            if (networkDrive.root_path.equals("")) {
//                return "設定檔有問題, 請確認";
//                String message = new String("設定檔有問題, 請確認".getBytes(), "MS950");
                String message = "設定檔有問題, 請確認";
                return  fail(message);
            } else {
                System.out.println("PDF 路徑: " + networkDrive.root_path);
            }
            InetAddress address = InetAddress.getByName(networkDrive.ip);
            System.out.println(address.getHostAddress());
            if (!address.isReachable(3000)) {
                String message = "IP: " + networkDrive.ip + " 無法連線, 請確認網路狀況";
//                String message = new String("設定檔有問題, 請確認".getBytes(), "MS950");
                return fail(message);
            } else {
                System.out.println("連線成功!");
            }
            final StringBuilder sqlSb = new StringBuilder();
            sqlSb.append("SELECT  ");
            sqlSb.append("p.product_id, ");
            sqlSb.append("k_op.process_step ");
            sqlSb.append("FROM ");
            sqlSb.append("a_servtrack_work AS w, ");
            sqlSb.append("a_servtrack_product AS p, ");
            sqlSb.append("a_servtrack_work_op AS w_op, ");
            sqlSb.append("a_servtrack_process AS ps, ");
            sqlSb.append("a_kuochuan_servtrack_work_op AS k_op ");
            sqlSb.append("WHERE ");
            sqlSb.append("w.product_id = p.product_id ");
            sqlSb.append("AND ");
            sqlSb.append("w.work_id = w_op.work_id ");
            sqlSb.append("AND ");
            sqlSb.append("w_op.process_code = ps.process_code ");
            sqlSb.append("AND ");
            sqlSb.append("(w.work_id = k_op.work_id AND w_op.op = k_op.op) ");
            sqlSb.append("AND ");
            sqlSb.append("w.work_id = ? ");
            sqlSb.append("AND ");
            sqlSb.append("w_op.op = ? ");
            RequestResult<String> result = ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    List<Map> resultMap = Base.findAll(sqlSb.toString(), workId, op);
                    String productId = resultMap.get(0).get("product_id").toString();
                    String processStep = resultMap.get(0).get("process_step").toString();
                    SopSearch sopSearch = new SopSearch(productId, processStep);
                    String pdfPath = sopSearch.start(networkDrive.root_path).search().getPath();
                    if (pdfPath.equals("")) {
                        String message = "找不到匹配的PDF, 請確認: 1.PDF是否存在? 2.產品 PDF 位置是否為規則外?";
                        return RequestResult.fail(message);
                    } else if (pdfPath.equals("ruleOut")) {
                        String message = "規則外例外, 無法辨識客戶代號";
                        return RequestResult.fail(message);
                    }else {
                        System.out.println("找到檔案: " + pdfPath);
                        String uuid = UUID.randomUUID().toString().replace("-", "");
                        File file = new File(pdfPath);
                        String outputTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/pdf/" + uuid + ".pdf";
                        try {
                            Files.copy(file, new File(outputTarget));
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                        String url = null;
                        url = request.getScheme() + "://" +
                                request.getServerName() + ":" +
                                request.getServerPort() +
                                request.getContextPath() + "/pdf/web/viewer.html?file=../" + uuid + ".pdf";

                        try {
                            response.sendRedirect(url);
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                    return success();
                }
            });
            if (result.getType() != 0) {
                return success(result.getData());
            }
        } catch (UnknownHostException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return success();
    }

    static class NetworkDrive {
        String ip;
        String root_path;

        NetworkDrive(File networkDriveFile) throws IOException{
            InputStreamReader isr = new InputStreamReader(new FileInputStream(networkDriveFile), "Big5");
            BufferedReader br = new BufferedReader(isr);
            StringBuilder sb = new StringBuilder();
            String line = "";
            while ((line = br.readLine())!= null) {
                if (!line.isEmpty() && !line.trim().equals("")) {
                    sb.append(line);
                }
            }
            if (sb.length() > 0) {
                line = sb.toString();
                this.root_path = line.trim();
            } else {
                this.root_path = "";
            }
            if (line.startsWith("\\\\")) {
                int start = line.indexOf("\\\\") + 2;
                this.ip = line.substring(start, line.indexOf("\\", start));
            } else {
                ip = "";
            }
        }
    }

    //SOP 更版哦 20171027 by raynard
    static class SopSearch {
        private List<String> filePath;  //檔案清單
        private List<String> pdfPath;   //PDF 的清單
        private String searchRootPath;
        private String source;          //一開始丟進來的
        private String type;            //第一層會用到的 客戶名稱
        private String product;
        private String station;         //站別
        private int comboHigh;          //combo 的最高紀錄
        private boolean ruleOut = false;

        SopSearch(String source, String station) {
            this.filePath = new ArrayList<String>();
            this.pdfPath = new ArrayList<String>();
            this.source = source;

            this.station = station;
            String[] splitArr = source.split("-");
            if (splitArr.length <= 1) {
                this.source = "";
            } else {
                this.type = source.split("-")[0];
                this.product = source.split("-")[1];
            }
        }
        public SopSearch start(String path) {
            System.out.println("產品根目錄:" + path);
            File folder  = new File(path);
            if (!source.equals("")) {
                for (File typeFolder : folder.listFiles()) {
                    int comboHit = 0;
                    if (typeFolder.isDirectory()) {
                        String[] folderType = typeFolder.getName().split("-");
                        String[] compareTypeSplit = folderType[0].split("");
                        String[] typeSplit = type.split("");
                        if (typeSplit.length == compareTypeSplit.length) {
                            for (int index = 0; index < typeSplit.length; index++) {
                                if (typeSplit[index].equals(compareTypeSplit[index])) {
                                    comboHit++;
                                } else {
                                    break;
                                }
                            }
                            if (comboHit > comboHigh) {
                                comboHigh = comboHit;
                                searchRootPath = typeFolder.getAbsolutePath();
                            }
                        }
                    } else {
                        System.out.println(typeFolder.getAbsolutePath() + " 不是目錄，跳過");
                    }
                }
                if (searchRootPath!= null && !searchRootPath.equals("")) {
                    System.out.println("找到產品所屬目錄: " + searchRootPath);
                } else {
                    System.out.println("沒有找到該產品所對應的客戶");
                }
            } else {
                ruleOut = true;
            }
            return this;
        }

        public SopSearch search () {
            comboHigh = 0;
            filePath = new ArrayList<String>();
            if (!ruleOut) {
                if (searchRootPath == null || searchRootPath.equals("") || searchRootPath == null) {
                    // 理論上不會來這，萬一真的來這 代表那一層連一個 符合的都沒有
                } else {
                    File[] files = new File(searchRootPath).listFiles();
                    for (File fileMaybeFolder : files) {
                        if (fileMaybeFolder.isDirectory()) {
                            String fileName = fileMaybeFolder.getName();
                            if (fileName.indexOf("SOP") > -1 && fileMaybeFolder.isDirectory()) {
                                System.out.println("找到SOP目錄 :" + fileName);
                                filePath.add(fileMaybeFolder.getAbsolutePath());
                                break;
                            } else {
                                int compareLen = 0;
                                int comboHit = 0;
                                String[] compareSplit = fileMaybeFolder.getName().split("");
                                String[] productSplit = source.split("");
                                if (compareSplit.length < productSplit.length) {
                                    compareLen = compareSplit.length;
                                } else {
                                    compareLen = productSplit.length;
                                }
                                for (int index = 0; index < compareLen; index++) {
                                    if (compareSplit[index].equals(productSplit[index])) {
                                        comboHit++;
                                    } else {
                                        break;
                                    }
                                }
                                if (comboHit > comboHigh) {
                                    comboHigh = comboHit;
                                    filePath = new ArrayList<String>();
                                    filePath.add(fileMaybeFolder.getAbsolutePath());
                                } else if (comboHit == comboHigh && comboHit > 0) {
                                    filePath.add(fileMaybeFolder.getAbsolutePath());
                                }
                            }
                        } else {
                            //通常應該是不會來這
                        }
                    }
                    //比對最高的持續搜索
                    for (String s : filePath) {
                        searchRecursion(s);
                    }
                }
            }
            return this;
        }

        public void searchRecursion (String path) {
            filePath = new ArrayList<String>();
            System.out.println("持續搜索目錄中: " + path);
            File[] files = new File(path).listFiles();
            if (files.length > 0) {
                for (File fileMaybeFolder : new File(path).listFiles()) {
                    if (fileMaybeFolder.isDirectory()) {
                        if (fileMaybeFolder.getName().indexOf("SOP") > -1) {
                            System.out.println("找到SOP目錄 :" + fileMaybeFolder.getName());

                            filePath.add(fileMaybeFolder.getAbsolutePath());
                            break;
                        }
                        int compareLen = 0;
                        int comboHit = 0;
                        String[] compareSplit = fileMaybeFolder.getName().split("");
                        String[] productSplit = source.split("");
                        if (compareSplit.length < productSplit.length) {
                            compareLen = compareSplit.length;
                        } else {
                            compareLen = productSplit.length;
                        }
                        for (int index = 0; index < compareLen; index++) {
                            if (compareSplit[index].equals(productSplit[index])) {
                                comboHit++;
                            } else {
                                break;
                            }
                        }
                        if (comboHit > comboHigh) {
                            comboHigh = comboHit;
                            filePath = new ArrayList<String>();
                            filePath.add(fileMaybeFolder.getAbsolutePath());
                        } else if (comboHit == comboHigh && comboHit > 0) {
                            filePath.add(fileMaybeFolder.getAbsolutePath());
                        }
                    } else {
                        pdfCompare(fileMaybeFolder.getAbsolutePath());
                    }
                }
                for (String s : filePath) {
                    searchRecursion(s);
                }
            } else {
                // 沒了就不用了
            }

        }

        public void pdfCompare (String path) {
            if (path.indexOf(".pdf") > -1) {
                int index = path.lastIndexOf(".pdf");
                int stationLen = station.length();
                int result = index - stationLen;
                String pathStation = path.substring(result, index);
                if (pathStation.equals(station)) {
                    System.out.println("PDF: " + path);
                    pdfPath.add(path);
                }
//                if (pathStation.equals(station) && new File(path).getName().indexOf(product) > -1) {
//                    System.out.println("PDF: " + path);
//                    pdfPath.add(path);
//                }
            }
        }


        public String getPath() {
            String result = "";
            List<String> paths = new ArrayList<String>();
            if (!ruleOut) {
                String[] prdouctSplit = product.split("");
                if (pdfPath.size() == 0) {
                    return result;
                } else {
                    for (String s : pdfPath) {
                        if (result.equals("")) {
                            String pdf = new File(s).getName().split("-")[0];
                            if (pdf.equals(type)) {
                                result = s;
                                paths.add(s);
                            }
                        } else {
                            String pdf = new File(result).getName();
                            String compare = new File(s).getName();
                            int pdfCombo = 0;
                            int compareCombo = 0;
                            if (pdf.split("-")[0].equals(type)) {
                                pdfCombo = combos(prdouctSplit, pdf, type.length());
                            }
                            if (compare.split("-")[0].equals(type)) {
                                compareCombo = combos(prdouctSplit, compare, type.length());
                            }
                            if (compareCombo == pdfCombo && compareCombo > 0) {
                                paths.add(s);
                            } else if (compareCombo > pdfCombo) {
                                paths = new ArrayList<String>();
                                paths.add(s);
                                result = s;
                            }
                        }
                    }
                }

            } else {
                result = "ruleOut";
                paths.add("ruleOut");
            }
            Collections.sort(paths);

            return paths.get(paths.size() - 1);
        }

        public int combos (String[] products, String path, int start) {
            int combo = 0;
            int index = start;
            for(int i = 0; i<products.length; i++) {
                if (path.indexOf(products[i], index) != -1) {
                    combo++;
                    index = path.indexOf(products[i], index);
                }
            }
            return combo;
        }
    }


}
