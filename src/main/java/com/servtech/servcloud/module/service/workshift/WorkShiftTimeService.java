package com.servtech.servcloud.module.service.workshift;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.module.service.workshift.exception.WorkShiftTimeException;
import com.servtech.servcloud.module.model.WorkShiftChild;
import com.servtech.servcloud.module.model.WorkShiftGroup;
import com.servtech.servcloud.module.model.WorkShiftTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Time;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/28 下午 03:07
 */
public class WorkShiftTimeService {
    private static final Logger log = LoggerFactory.getLogger(WorkShiftTimeService.class);

    private Date startDate;
    private Date endDate;

    private DateFormat dfyyyyMMdd = new SimpleDateFormat("yyyyMMdd");
    private DateFormat dfHHmmssSplittedBySemicolon = new SimpleDateFormat("HH:mm:ss");

    private WorkShiftTimeService() {
        Calendar c = Calendar.getInstance();

        c.set(Calendar.HOUR_OF_DAY, 23);
        c.set(Calendar.MINUTE, 59);
        c.set(Calendar.SECOND, 59);
        c.set(Calendar.MILLISECOND, 999);
        this.endDate = c.getTime();

        c.add(Calendar.DAY_OF_MONTH, -1);

        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        this.startDate = c.getTime();

    }

    public WorkShiftTimeService(String startDate8Bits, String endDate8Bits) throws WorkShiftTimeException {
        try {
            Calendar c = Calendar.getInstance();

            c.set(Calendar.YEAR, Integer.parseInt(startDate8Bits.substring(0, 4)));
            c.set(Calendar.MONTH, Integer.parseInt(startDate8Bits.substring(4, 6)) - 1);
            c.set(Calendar.DAY_OF_MONTH, Integer.parseInt(startDate8Bits.substring(6, 8)));
            c.set(Calendar.HOUR_OF_DAY, 0);
            c.set(Calendar.MINUTE, 0);
            c.set(Calendar.SECOND, 0);
            c.set(Calendar.MILLISECOND, 0);
            this.startDate = c.getTime();

            c.set(Calendar.YEAR, Integer.parseInt(endDate8Bits.substring(0, 4)));
            c.set(Calendar.MONTH, Integer.parseInt(endDate8Bits.substring(4, 6)) - 1);
            c.set(Calendar.DAY_OF_MONTH, Integer.parseInt(endDate8Bits.substring(6, 8)));
            c.set(Calendar.HOUR_OF_DAY, 23);
            c.set(Calendar.MINUTE, 59);
            c.set(Calendar.SECOND, 59);
            c.set(Calendar.MILLISECOND, 999);
            this.endDate = c.getTime();

        } catch (IndexOutOfBoundsException e) {
            throw new WorkShiftTimeException("startDate 與 endDate 需為 YYYYMMDD");
        } catch (NumberFormatException e) {
            throw new WorkShiftTimeException("startDate 與 endDate 需為 YYYYMMDD");
        }
    }

    public Map<String, List<Map<String, Object>>> getIntervalWorkShiftTimes() {

        Map<String, List<Map<String, Object>>> result = Maps.newHashMap();
        Map<String, List<WorkShiftTime>> shiftTimesGroupByShiftChild = shiftTimesGroupByShiftChild();

        Calendar processingCalendar = Calendar.getInstance();
        processingCalendar.setTime(startDate);

        while(processingCalendar.getTime().before(endDate)) {

            List<WorkShiftTime> shiftTimes = pickShiftTimesFirstByDateOrWeekday(shiftTimesGroupByShiftChild, processingCalendar.getTime());
            if (shiftTimes != null) {
                Collections.sort(shiftTimes, new Comparator<WorkShiftTime>() {
                    @Override
                    public int compare(WorkShiftTime o1, WorkShiftTime o2) {
                        return o1.getInteger("sequence") - o2.getInteger("sequence");
                    }
                });
                List<Map<String, Object>> shiftTimesResult = Lists.newArrayList();
                Time preTime = null;
                Calendar processingDate = Calendar.getInstance();
                processingDate.setTime(processingCalendar.getTime());

                for (WorkShiftTime shiftTime : shiftTimes) {
                    Map<String, Object> map = Maps.newHashMap();
                    map.put("sequence", shiftTime.getInteger("sequence"));
                    map.put("name", shiftTime.getString("name"));

                    Time startTime = shiftTime.getTime("start");
                    map.put("start", getActualDateTime(preTime, startTime, processingDate));
                    preTime = startTime;

                    Time endTime = shiftTime.getTime("end");
                    map.put("end", getActualDateTime(preTime, endTime, processingDate));
                    preTime = endTime;
                    map.put("is_open", shiftTime.getString("is_open"));

                    shiftTimesResult.add(map);
                }

                result.put(dfyyyyMMdd.format(processingCalendar.getTime()), shiftTimesResult);
            }

            processingCalendar.add(Calendar.DAY_OF_MONTH, 1);
        }

        return result;
    }

    public static NowActualShiftTime nowActualShiftTime() {
        return new NowActualShiftTime();
    }

    private Map<String, List<WorkShiftTime>> shiftTimesGroupByShiftChild() {
        return ActiveJdbc.oper(new Operation<Map<String, List<WorkShiftTime>>>() {
            @Override
            public Map<String, List<WorkShiftTime>> operate() {
                Map<String, List<WorkShiftTime>> result = Maps.newHashMap();
                List<WorkShiftGroup> workShiftGroups = WorkShiftGroup.findAll().include(WorkShiftChild.class, WorkShiftTime.class);
                for (WorkShiftGroup workShiftGroup : workShiftGroups) {
                    List<WorkShiftTime> workShiftTimes = workShiftGroup.getAll(WorkShiftTime.class);
                    for (WorkShiftChild workShiftChild : workShiftGroup.getAll(WorkShiftChild.class)) {
                        java.sql.Date date = workShiftChild.getDate("date");
                        if (date != null) {
                            result.put(dfyyyyMMdd.format(date), workShiftTimes);
                        } else {
                            int weekday = workShiftChild.getInteger("weekday");
                            result.put(String.valueOf(weekday), workShiftTimes);
                        }
                    }
                }
                return result;
            }
        });
    }

    private List<WorkShiftTime> pickShiftTimesFirstByDateOrWeekday(Map<String, List<WorkShiftTime>> shiftTimes, Date date) {
        String date8Bits = dfyyyyMMdd.format(date);
        if (shiftTimes.containsKey(date8Bits)) {
            return shiftTimes.get(date8Bits);
        } else {
            Calendar c = Calendar.getInstance();
            c.setTime(date);
            c.setFirstDayOfWeek(Calendar.SUNDAY);

            // Java Calendar 在 setFirstDayOfWeek 之後: 日~六 = 1~7
            // 我們的資料庫中的 日~六 = 0~6
            return shiftTimes.get(String.valueOf(c.get(Calendar.DAY_OF_WEEK) - 1));
        }
    }

    private String getActualDateTime(Time preTime, Time currTime, Calendar date) {
        if (isPreTimeGtPostTime(preTime, currTime)) {
            date.add(Calendar.DAY_OF_MONTH, 1);
        }
        return date.get(Calendar.YEAR) + "/" +
                String.format("%02d", date.get(Calendar.MONTH) + 1) + "/" +
                String.format("%02d", date.get(Calendar.DAY_OF_MONTH)) + " " +
                dfHHmmssSplittedBySemicolon.format(currTime);
    }

    private boolean isPreTimeGtPostTime(Date pre, Date post) {
        if (pre == null) {
            return false;
        }

        Calendar c = Calendar.getInstance();
        c.setTime(pre);
        int h1 = c.get(Calendar.HOUR_OF_DAY);
        int m1 = c.get(Calendar.MINUTE);
        int s1 = c.get(Calendar.SECOND);

        c.setTime(post);
        int h2 = c.get(Calendar.HOUR_OF_DAY);
        int m2 = c.get(Calendar.MINUTE);
        int s2 = c.get(Calendar.SECOND);

        if (h1 > h2) {
            return true;
        }
        if (h1 == h2) {
            if (m1 > m2)  {
                return true;
            }
            if (m1 == m2) {
                if (s1 > s2) {
                    return true;
                }

                return false;
            }

            return false;
        }

        return false;
    }

    public static class NowActualShiftTime {
        private String date8Bits;
        private Map<String, Object> nowShiftTime;
        private List<Map<String, Object>> todayShiftTimes;

        {
            WorkShiftTimeService workShiftTimeService = new WorkShiftTimeService();
            String nowTsp = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date());

            Map<String, List<Map<String, Object>>> todayAndYesterdayShiftTimes = workShiftTimeService.getIntervalWorkShiftTimes();

            OUTER:
            for (String date8Bits : todayAndYesterdayShiftTimes.keySet()) {
                List<Map<String, Object>> shiftTimes = todayAndYesterdayShiftTimes.get(date8Bits);
                for (Map<String, Object> shiftTime : shiftTimes) {
                    if (nowTsp.compareTo((String) shiftTime.get("start")) >= 0 &&
                        nowTsp.compareTo((String) shiftTime.get("end")) <= 0) {
                        this.date8Bits = date8Bits;
                        this.nowShiftTime = shiftTime;
                        this.todayShiftTimes = shiftTimes;
                        break OUTER;
                    }
                }
            }
            if (date8Bits == null) date8Bits = "";
            if (nowShiftTime == null) nowShiftTime = Maps.newHashMap();
            if (todayShiftTimes == null) todayShiftTimes = Lists.newArrayList();
        }

        public String getLogicallyDate8Bits() {
            return date8Bits;
        }

        public Map<String, Object> getNowShiftTime() {
            return Collections.unmodifiableMap(nowShiftTime);
        }

        public List<Map<String, Object>> getTodayShiftTimes() {
            return Collections.unmodifiableList(todayShiftTimes);
        }
    }
}
