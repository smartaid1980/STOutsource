package com.servtech.servcloud.app.controller.five_axis;

import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.util.*;


import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by RDtest01 on 2015/9/16.
 */
@RestController
@RequestMapping("/FiveAxis")
public class FiveAxisMeasureController {
    private static final Logger logger = LoggerFactory.getLogger(FiveAxisMeasureController.class);

    // 這是 '五軸量測_中原大學(可測試版)' 資料夾所在的路徑~要使用的話記得要修改成正確路徑
    static final String path = System.getProperty(SysPropKey.ROOT_PATH) + "app\\FiveAxisMeasure\\program";

    static final String[] folderList = {"C01","C02","C03","C04","C05","C06","C07","C08","C09","C10","C11"};
    static final String outputPath = System.getProperty(SysPropKey.ROOT_PATH) + "app\\FiveAxisMeasure\\out";


    @RequestMapping("/getData")
    public RequestResult<Map> getData(){
        Map map = new HashMap();

        copyData(path,outputPath);
        Map map_A = FiveAxisReadData.getMap_A(outputPath + "\\record");
        Map map_C = FiveAxisReadData.getMap_C(outputPath + "\\record");
        ArrayList<String> arr = FiveAxisGetGraph.getGraph(outputPath);
        map.put("mapA",map_A);
        map.put("mapC",map_C);
        map.put("graph",arr);
        return success(map);
    }


    public static void copyData(String path, String outputPath){
        String filename = findLastFile(path, "jpg");
        String txtname = filename.split("\\.")[0].concat(".txt");
        String fileA = "A軸誤差分析紀錄.txt";
        String fileC = "C軸誤差分析紀錄.txt";



        String oldFile;
        String newFile;

        // 把資料夾中最新的.jpg檔複製到tomcat中
        for(String s:folderList){
            oldFile = path +"\\"+ s +"\\"+ filename;
            newFile = outputPath + "\\jpg\\"+s+".jpg";
            try{
                File f1 = new File(oldFile);
                File f2 = new File(newFile);

                if(f1.exists()) {
                    InputStream in = new FileInputStream(f1);
                    OutputStream out = new FileOutputStream(f2);

                    byte[] buf = new byte[1024];
                    int len;
                    while ((len = in.read(buf)) > 0) {
                        out.write(buf, 0, len);
                    }
                    in.close();
                    out.close();
                }
            } catch(IOException e){

            }
        }

        // 將C11和C05中的AC軸誤差分析紀錄 和 資料夾對照表 複製到tomcat中
        String FileA_path = path +"\\C11\\"+ txtname;
        String newFileA = outputPath + "\\record\\"+fileA;
        String FileC_path = path +"\\C05\\"+ txtname;
        String newFileC = outputPath + "\\record\\"+fileC;

        try{
            File FA1 = new File(FileA_path);
            File FA2 = new File(newFileA);
            File FC1 = new File(FileC_path);
            File FC2 = new File(newFileC);

            if(FA1.exists()) {
                InputStream in = new FileInputStream(FA1);
                OutputStream out = new FileOutputStream(FA2);

                byte[] buf = new byte[1024];
                int len;
                while ((len = in.read(buf)) > 0) {
                    out.write(buf, 0, len);
                }
                in.close();
                out.close();
                logger.info(FileA_path + " has be copied!");
            } else {
                logger.warn(FileA_path+" does not exist!");
            }
            if(FC1.exists()) {
                InputStream in = new FileInputStream(FC1);
                OutputStream out = new FileOutputStream(FC2);

                byte[] buf = new byte[1024];
                int len;
                while ((len = in.read(buf)) > 0) {
                    out.write(buf, 0, len);
                }
                in.close();
                out.close();
                logger.info(FileC_path + " has be copied!");
            } else {
                logger.warn(FileC_path+" does not exist!");
            }

        } catch(IOException e){

        }
    }

    public static String findLastFile(String path , String type){

        Map<Long,String> map = new HashMap<Long,String>();
        Map<Long, String> m = new HashMap<Long, String>();
        ArrayList<Long> arr = new ArrayList<Long>();
        File[] filelist;

        for(String currentFolder:folderList){
            String folderPath = path + "\\" + currentFolder;
            String[] file = new File(folderPath).list();
            for(String s:file){
                folderPath = path + "\\" + currentFolder + "\\" +s;
                filelist = new File(folderPath).listFiles();
                for (File f : filelist) {
                    m.put(f.lastModified(), f.getName());
                    arr.add(f.lastModified());
                }
                Long l = Collections.max(arr);
                if(m.get(l).endsWith("."+type))
                    map.put(l, s+"\\"+m.get(l));
            }
        }
        Set set = map.keySet();
        return map.get(Collections.max(set));
    }





}
