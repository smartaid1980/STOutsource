package com.servtech.servcloud.app.controller.five_axis;

import com.google.common.base.Charsets;
import com.google.common.io.Files;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by RDtest01 on 2015/9/17.
 */
public class FiveAxisReadData {

    private static String fileA = "A軸誤差分析紀錄.txt";
    private static String fileC = "C軸誤差分析紀錄.txt";


    public static Map getMap_A(String path){
        ArrayList arr = new ArrayList();
        Map map = new HashMap<String,Object>();

        try {
            List<String> lines = Files.readLines(new File(path + "\\" + fileA), Charsets.UTF_8);

            for(int i = 0;i<7;i++)
                arr.add(lines.get(i));
            map.put("info",arr);

            arr = new ArrayList();
            for (String s:checkNum(lines.get(7).split("\\|")))
                arr.add(s);
            map.put("point", arr);

            arr = new ArrayList();
            for(int i=8;i<14;i++)
                arr.add(checkNum(lines.get(i).split("\\|")));
            map.put("Go",arr);

            arr = new ArrayList();
            for(int i=14;i<20;i++)
                arr.add(checkNum(lines.get(i).split("\\|")));
            map.put("Back",arr);

            map.put("rotateCenter", checkNum(lines.get(20).split("\\|")));

            arr = new ArrayList();
            for(int i = 21;i<25;i++)
                arr.add(lines.get(i));
            map.put("mm",arr);

            map.put("ACerr", checkNum(lines.get(25).split("\\|"), 0, "&deg;"));
            map.put("AXerr", checkNum(lines.get(26).split("\\|"), 0, "&deg;"));
            map.put("AXZerr", checkNum(lines.get(27).split("\\|"), 0, "&deg;"));
            map.put("AXYerr", checkNum(lines.get(28).split("\\|"), 0, "&deg;"));

            arr = new ArrayList();
            for(int i=29;i<34;i++)
                arr.add(checkNum(lines.get(i).split("\\|"), 1, "&deg;"));
            map.put("AngleGo",arr);

            arr = new ArrayList();
            for(int i=34;i<39;i++)
                arr.add(checkNum(lines.get(i).split("\\|"), 1, "&deg;"));
            map.put("AngleBack", arr);

        } catch (Exception e) {
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
        return map;
    }

    public static Map getMap_C(String path){
        ArrayList arr = new ArrayList();
        Map map = new HashMap<String,Object>();

        try {

            List<String> lines = Files.readLines(new File(path + "\\" + fileC), Charsets.UTF_8);

            for(int i = 0;i<7;i++)
                arr.add(lines.get(i));
            map.put("info", arr);

            arr = new ArrayList();
            for (String s:checkNum(lines.get(7).split("\\|")))
                arr.add(s);
            map.put("point", arr);

            arr = new ArrayList();
            for(int i=8;i<21;i++)
                arr.add(checkNum(lines.get(i).split("\\|")));
            map.put("Go",arr);

            arr = new ArrayList();
            for(int i=21;i<34;i++)
                arr.add(checkNum(lines.get(i).split("\\|")));
            map.put("Back",arr);

            map.put("rotateCenter", checkNum(lines.get(34).split("\\|")));

            arr = new ArrayList();
            for(int i = 35;i<39;i++)
                arr.add(lines.get(i));
            map.put("mm", arr);

            map.put("CYZerr", checkNum(lines.get(39).split("\\|"), 0, "&deg;"));
            map.put("CXZerr", checkNum(lines.get(40).split("\\|"), 0, "&deg;"));
            map.put("CZerr", checkNum(lines.get(41).split("\\|"), 0, "&deg;"));

            arr = new ArrayList();
            for(int i=42;i<54;i++)
                arr.add(checkNum(lines.get(i).split("\\|"), 1, "&deg;"));
            map.put("AngleCW",arr);

            arr = new ArrayList();
            for(int i=54;i<66;i++)
                arr.add(checkNum(lines.get(i).split("\\|"), 1, "&deg;"));
            map.put("AngleCCW",arr);


        } catch (Exception e) {
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
        return map;
    }


    // 檢查String[]中的每一項是否為數字或指數形式，否則回傳NaN
    public static String[] checkNum(String[] strs){
        return checkNum(strs,-1,"");
    }
    public static String[] checkNum(String[] strs , int index , String append){
        int i = 0;
        for(String s:strs){
            if(index == i) {
                s = s.concat(append);
            }
            if(s.endsWith("°"))
                s = s.substring(0,s.length()-1).concat("&deg;");
            if(s.contains("不是一個數字"))
                s = "NaN";
            strs[i] = s;
            i++;
        }
        return strs;
    }
}
