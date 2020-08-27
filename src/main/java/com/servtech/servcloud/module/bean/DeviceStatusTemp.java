package com.servtech.servcloud.module.bean;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Hubert
 * Datetime: 2016/6/29 下午 05:09
 */
public
class DeviceStatusTemp{//將protobuf格式deviceStatus轉成舊版CSV格式
    private static final String DATE_FORMAT = "yyyy/MM/dd HH:mm:ss";
    private static final String CSV_SPLIT = "|";
    private static final String CSV_SPLIT_REGEX = "\\|";
    private static final String ARR_SPLIT = ",";
    private static final String NEW_LINE = System.getProperty("line.separator");
    private String timestamp;
    private String boxId;
    private Map<String, String> gCodeMap;
    private String[] gCodeSeqArr;
    private String csv;
    private String allGCode;
    private List<List<String>> matrix;

    public DeviceStatusTemp(String jsonStr, String[] gCodeSeqArr){
        this.timestamp = date2Str(new Date());
        this.gCodeMap = new HashMap<String, String>();
        this.gCodeSeqArr = gCodeSeqArr;
        this.csv = transProtobuf2Csv(jsonStr);
        this.matrix = csv2Matrix();
    }
    //protobuf轉出的matrix格式
    public List<List<String>> getMatrix(){
        return this.matrix;
    }

    //protobuf轉出的csv格式
    public String getCsv(){
        return this.csv;
    }

    //取得protobuf中全部的gCode
    public String getAllGCode(){
        return this.allGCode;
    }

    //將Protobuf的json格式轉成csv
    private String transProtobuf2Csv(String jsonStr){
        StringBuilder allGCodeTemp = new StringBuilder();
        Gson gson = new Gson();
        Map<String, Object> obj = (Map<String, Object>) gson.fromJson(jsonStr, Object.class);
        if(obj.entrySet().size() == 0){
            return new String();
        }
        for (Map.Entry<String, Object> stringObjectEntry:obj.entrySet()) {
            Map.Entry<String, Object> entry = stringObjectEntry;
            if (entry.getKey().toString().equals("machine")) {//設定boxId
                this.boxId = entry.getValue().toString();
            }
            if (entry.getValue().getClass().equals(LinkedTreeMap.class)) {
                Map<String, Object> result = (Map<String, Object>) entry.getValue();
                if (result.containsKey("stringValues")) {
                    List<Object> stringValues = (List<Object>) result.get("stringValues");
                    if (stringValues.size() > 0) {
                        for (Object stringValue : stringValues) {
                            String gCode = ((Map<String, String>) ((Map<String, Object>) stringValue).get("signal")).get("id");
                            String arrayStr = (((Map<String, List<String>>)((List<Object>)((Map<String, Object>) stringValue).get("values")).get(0)).get("array")).get(0);
                            this.gCodeMap.put(gCode, arrayStr);
                            allGCodeTemp.append(gCode).append(CSV_SPLIT);
                        }
                    }
                }
            }
        }
        this.allGCode = allGCodeTemp.toString();
        return this.toCsv();
    }

    //轉成csv的格式
    private String toCsv(){
        Map<String, StringBuilder> machineGCodeSeqMap = new HashMap<String, StringBuilder>();
        Gson gson = new Gson();
        StringBuilder csvTemp = new StringBuilder();
        for(String gCodeSeq:this.gCodeSeqArr){
            if(this.gCodeMap.containsKey(gCodeSeq)){
                String[][] matrix = gson.fromJson(this.gCodeMap.get(gCodeSeq), String[][].class);
                for(String[] arr:matrix){
                    if(!machineGCodeSeqMap.containsKey(arr[0])){
                        machineGCodeSeqMap.put(arr[0], new StringBuilder());
                    }
                    machineGCodeSeqMap.get(arr[0]).append(CSV_SPLIT);
                    for(int index=1; index<arr.length; index++){
                        if(index > 1){
                            machineGCodeSeqMap.get(arr[0]).append(ARR_SPLIT);
                        }
                        machineGCodeSeqMap.get(arr[0]).append(arr[index]);
                    }
                }
            }else{//無此gCode直接放分隔符號
                for(Map.Entry<String, StringBuilder> seqMap:machineGCodeSeqMap.entrySet()){
                    seqMap.getValue().append(CSV_SPLIT);
                }
            }

        }
        for(Map.Entry<String, StringBuilder> seqMap:machineGCodeSeqMap.entrySet()){
            csvTemp.append(this.timestamp).append(CSV_SPLIT).append(this.boxId).append(CSV_SPLIT)
                    .append(seqMap.getKey()).append(seqMap.getValue().toString()).append(NEW_LINE);
        }
        return csvTemp.toString();
    }

    //csv轉換成matrix
    private List<List<String>> csv2Matrix(){
        List<List<String>> matrixTemp = new ArrayList<List<String>>();
        String[] machines = this.csv.split(NEW_LINE);
        for(String machine:machines){
            if(machine.length() > 0){
                String[] machineCols = machine.split(CSV_SPLIT_REGEX, -1);
                matrixTemp.add(new ArrayList<String>(Arrays.asList(machineCols)));
            }
        }
        return matrixTemp;
    }

    private String date2Str(Date date) {
        if (date == null) {
            return new String();
        } else {
            SimpleDateFormat format = new SimpleDateFormat(DATE_FORMAT);
            return format.format(date);
        }
    }
}
