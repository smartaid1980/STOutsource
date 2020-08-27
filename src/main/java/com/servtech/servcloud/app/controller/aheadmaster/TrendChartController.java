package com.servtech.servcloud.app.controller.aheadmaster;

import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Kevin Big Big on 2017/8/9.
 */

@RestController
@RequestMapping("/aheadmaster/trendChart")
public class TrendChartController {
    private static final Logger logger = LoggerFactory.getLogger(TrendChartController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/getDates", method = GET)
    public RequestResult<?> getDates(@RequestParam("date") String date) {
        if(date.length() == 8){
            return success(new TrendChartTime(date).findDates());
        }else{
            return fail("date.length() != 8");
        }
    }

    public class TrendChartTime{
        private static final String DATE_FORMATE = "yyyyMMdd";
        private static final String DECEMBER = "12";
        private static final String FIRST_WEEK = "01";
        private static final String LAST_WEEK = "52";

        private YearDate date;
        private YearDate week;
        private YearDate month;

        private List<YearDate> twoWeekDays;//兩週的日期
        private YearDate preWeek;//前一週是第幾週
        private List<YearDate> preWeekFirstDayMonths;//包含前一週第一天的前三月
        private List<YearDate> preWeekFirstDayQuarterlys;//包含前一週第一天的前四季

        public TrendChartTime(String date){
            String year = date.substring(0, 4);
            //日
            this.date = new YearDate(year, date);
            //週
            String weekTemp = findWeekRangeByDate(date);
            this.week = new YearDate(findWeekOfYear(date, weekTemp), weekTemp);
            //月
            this.month = new YearDate(year, date.substring(4, 6));
            //找兩週
            this.twoWeekDays = new ArrayList<YearDate>();
            for(String weekDay:findTwoWeekDays(date)){
                year = weekDay.substring(0, 4);
                twoWeekDays.add(new YearDate(year, weekDay));
            }
            //找前一週
            this.preWeek = findPreWeek(this.month, this.week);
            //找前一週第一天
            YearDate preWeekFirstDayStr = this.twoWeekDays.get(this.twoWeekDays.size() - 1);
            //找包含前一週第一天的前三個月
            YearDate preWeekFirstDayMonth = new YearDate(preWeekFirstDayStr.getDate().substring(0, 4), preWeekFirstDayStr.getDate().substring(4, 6));
            this.preWeekFirstDayMonths = new ArrayList<YearDate>();
            this.preWeekFirstDayMonths.add(preWeekFirstDayMonth);//前一週第一天的月
            this.preWeekFirstDayMonths.add(findMonth(preWeekFirstDayMonth, -1));//以前一週第一天找前一月
            this.preWeekFirstDayMonths.add(findMonth(preWeekFirstDayMonth, -2));//以前一週第一天找前兩月

            //找包含前一週第一天的前四季
            this.preWeekFirstDayQuarterlys = findPreFourQuarterly(this.month);

            //月前面要加"M"
            for(YearDate month:preWeekFirstDayMonths){
                month.addPrefix2Date("M");
            }
            //週前面要加"W"
            this.preWeek.addPrefix2Date("W");
        }

        public List<YearDate> findDates(){
            List<YearDate> dates = new ArrayList<YearDate>();
            for(int index=(preWeekFirstDayQuarterlys.size() -1); index>=0; index--){
                dates.add(preWeekFirstDayQuarterlys.get(index));
            }
            for(int index=(preWeekFirstDayMonths.size() -1); index>=0; index--){
                dates.add(preWeekFirstDayMonths.get(index));
            }
            dates.add(preWeek);
            for(int index=(twoWeekDays.size() -1); index>=0; index--){
                dates.add(twoWeekDays.get(index));
            }
            return dates;
        }

        //找兩週
        private List<String> findTwoWeekDays(String date){
            List<String> twoWeekDays = new ArrayList<String>();
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(str2Date(date, DATE_FORMATE));//當天
            int thisWeekLastDate = 7 - calendar.get(Calendar.DAY_OF_WEEK) + 1;//使用目前日是這週第幾天，去反推出本週最後一天
            calendar.add(Calendar.DATE, thisWeekLastDate);//日期改為本週最後一天
            for(int index=0; index<14; index++){//一路加到上週第一天
                calendar.add(Calendar.DATE, -1);//遞減日
                twoWeekDays.add(date2Str(calendar.getTime(), DATE_FORMATE));
            }
            return twoWeekDays;
        }

        private String findQuarterlyName(YearDate month){
            Integer monthInt = Integer.parseInt(month.getDate());
            switch(monthInt){
                //第一季，1, 2, 3月
                case 1:
                case 2:
                case 3:
                    return "Q1";
                //第二季，4, 5, 6月
                case 4:
                case 5:
                case 6:
                    return "Q2";
                //第三季，7, 8, 9月
                case 7:
                case 8:
                case 9:
                    return "Q3";
                default://剩下的就10, 11, 12，第四季
                    return "Q4";
            }
        }

        private List<YearDate> findPreFourQuarterly(YearDate month){
            List<YearDate> fourQuarterly = new ArrayList<YearDate>();
            Integer thisMonthYear = Integer.parseInt(month.getYear());
            String currentMonthQuarterly = findQuarterlyName(month);
            //找前四季(包含此季)
            for(int count=0; count<4; count++){
                if(currentMonthQuarterly.equals("Q1")){//Q1前一季為Q4
                    fourQuarterly.add(new YearDate(thisMonthYear.toString(), currentMonthQuarterly));
                    currentMonthQuarterly = "Q4";
                    thisMonthYear--;//*** 跨年，減一
                }else if(currentMonthQuarterly.equals("Q4")){//Q4前一季為Q3
                    fourQuarterly.add(new YearDate(thisMonthYear.toString(), currentMonthQuarterly));
                    currentMonthQuarterly = "Q3";
                }else if(currentMonthQuarterly.equals("Q3")){//Q3前一季為Q2
                    fourQuarterly.add(new YearDate(thisMonthYear.toString(), currentMonthQuarterly));
                    currentMonthQuarterly = "Q2";
                }else if(currentMonthQuarterly.equals("Q2")){//Q2前一季為Q1
                    fourQuarterly.add(new YearDate(thisMonthYear.toString(), currentMonthQuarterly));
                    currentMonthQuarterly = "Q1";
                }
            }
            return fourQuarterly;
        }

        private YearDate findMonth(YearDate month, int addMonth){
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(str2Date(month.getYear() + month.getDate() + "01", DATE_FORMATE));
            calendar.add(Calendar.MONTH, addMonth);//增加月
            String dayStr = date2Str(calendar.getTime(), DATE_FORMATE);
            return new YearDate(dayStr.substring(0, 4), dayStr.substring(4, 6));
        }

        private YearDate findPreWeek(YearDate month, YearDate week){
            //找第一週的前一週
            if(week.getDate().equals(FIRST_WEEK)){
                //是12月，所以前一週的"年"不變
                if(month.getDate().equals(DECEMBER)){
                    return new YearDate(week.getYear(), LAST_WEEK);
                }else{//是1月，所以前一週的"年"是去年
                    Integer currentYear = Integer.parseInt(week.getYear());
                    Integer preYear = currentYear - 1;
                    return new YearDate(preYear.toString(), LAST_WEEK);
                }
            }else{
                //前一週
                Integer currentWeek = Integer.parseInt(week.getDate());
                Integer preWeek = currentWeek - 1;
                return new YearDate(week.getYear(), String.format("%02d", preWeek));
            }
        }

        //計算"週"是屬於哪以年
        private String findWeekOfYear(String day, String week){
            //12月且是第一週，表示週跨年惹，所以值要算到下一年第一週
            if(day.substring(4, 6).equals(DECEMBER) && week.equals(FIRST_WEEK)){
                return addYear(day, 1).substring(0, 4);
            }else{
                return day.substring(0, 4);
            }
        }

        private String addDay(String date, int addDay){
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(str2Date(date, DATE_FORMATE));
            calendar.add(Calendar.DATE, addDay);//增加日
            return date2Str(calendar.getTime(), DATE_FORMATE);
        }

        private String addYear(String date, int addYear){
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(str2Date(date, DATE_FORMATE));
            calendar.add(Calendar.YEAR, addYear);//增加年
            return date2Str(calendar.getTime(), DATE_FORMATE);
        }

        private String findWeekRangeByDate(String dateStr){
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(str2Date(dateStr, DATE_FORMATE));
            int weekOfYear = calendar.get(Calendar.WEEK_OF_YEAR);
            return String.format("%02d",weekOfYear);
        }

        public String date2Str(Date date, String dateFormat){
            if(date == null){
                return new String();
            }
            SimpleDateFormat format;
            format = new SimpleDateFormat(dateFormat);
            return format.format(date);
        }

        private Date str2Date(String date, String dateFormat) {
            if(date != null && date.length() != 0) {
                SimpleDateFormat format = new SimpleDateFormat(dateFormat);
                try {
                    return format.parse(date);
                } catch (ParseException pe) {
                    pe.printStackTrace();
                    return null;
                }
            } else {
                return null;
            }
        }

        public class YearDate{
            private String year;
            private String date;

            public YearDate(String year, String date) {
                this.year = year;
                this.date = date;
            }

            public void addPrefix2Date(String prefix){
                this.date = prefix + this.date;
            }

            public String getYear() {
                return year;
            }

            public String getDate() {
                return date;
            }
        }
    }
}
