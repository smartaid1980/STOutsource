package com.servtech.servcloud.core.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Hubert
 * Datetime: 2015/7/22 下午 04:53
 */
public class Util {
    public static String strSplitBy(String str, String splitter, int times) {
        StringBuilder sb = new StringBuilder();
        String sep = "";
        for (int i = 0; i < times; i++) {
            sb.append(sep).append(str);
            sep = splitter;
        }
        return sb.toString();
    }

    public static String getServBoxD01DevicesXmlPath(String boxId) {
        return System.getProperty(SysPropKey.SERV_BOX_PATH) + "/" + boxId + "/Config/Nodes/devices.xml";
    }

    public static String getServBoxE01DevicesXmlPath(String boxId) {
        String boxE01 = boxId.substring(0, boxId.length() - 3) + "E" + boxId.substring(boxId.length() - 2);
        return System.getProperty(SysPropKey.SERV_BOX_PATH) + "/" + boxE01 + "/Config/Nodes/devices.xml";
    }

    public static long getTimeLongFormat() {
        long timeMillis = System.currentTimeMillis();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
        Date date = new Date(timeMillis);
        long dateLongFormat = Long.parseLong(dateFormat.format(date));

        return dateLongFormat;
    }

    public static String millisecondToHHmmss(long time) {
        long MILLISECONDS_PER_SECOND = 1000;
        long MILLISECONDS_PER_MINUTE = 60000;
        long MILLISECONDS_PER_HOUR = 3600000;

        long hour = time / MILLISECONDS_PER_HOUR;
        long minutes = time % MILLISECONDS_PER_HOUR / MILLISECONDS_PER_MINUTE;
        long seconds = time % MILLISECONDS_PER_MINUTE / MILLISECONDS_PER_SECOND;

        String time2HHmmss = String.format("%02d:%02d:%02d", hour, minutes, seconds);

        return time2HHmmss;
    }

    public static String doubleToPercentage(double perc, int Scale) {
        if (perc > 1) {
            return "數值錯誤";
        } else {
            BigDecimal b = new BigDecimal(perc * 100);
            double f1 = b.setScale(Scale, RoundingMode.HALF_UP).doubleValue();
            return f1 + "%";
        }
    }

    public static String getSqlInSyntax(String splitter, List<String> list) {
        if (list.size() == 0) {
            String emptySqlSyntax = "('')";
            return emptySqlSyntax;
        }
        String sep = "";
        StringBuilder sb = new StringBuilder("( ");

        for (String s : list) {
            sb.append(sep);
            sb.append("'" + s + "'");
            sep = splitter;
        }
        sb.append(" ) ");

        return sb.toString();
    }

    //判斷是否為數字
    public static boolean isNumeric(String str) {
        // 該正則表示式可以匹配所有的數字 包括負數
        Pattern pattern = Pattern.compile("-?[0-9]+\\.?[0-9]*");
        String bigStr;
        try {
            bigStr = new BigDecimal(str).toString();
        } catch (Exception e) {
            return false;//異常 說明包含非數字。
        }

        Matcher isNum = pattern.matcher(bigStr); // matcher是全匹配
        if (!isNum.matches()) {
            return false;
        }
        return true;
    }

    public static long getDateParseLong(Date date) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
        return Long.parseLong(dateFormat.format(date));
    }
}
