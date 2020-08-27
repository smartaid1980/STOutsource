package com.servtech.servcloud.module.controller;

import com.google.gson.Gson;
import com.servtech.common.codec.exception.LicenseMismatchException;
import com.servtech.hippopotamus.*;
import com.servtech.hippopotamus.exception.ExhaleException;
import com.servtech.hippopotamus.exception.InhaleException;
import com.servtech.hippopotamus.exception.QueryIndexException;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by Hubert
 * Datetime: 2016/1/6 下午 03:54
 */
@RestController
@RequestMapping("/hippo")
public class HippoController {

    public static final Logger log = LoggerFactory.getLogger(HippoController.class);

    public static final String STRING_CLASS_NAME = "java.lang.String";
    public static final String DOUBLE_CLASS_NAME = "java.lang.Double";
    public static final String BOOLEAN_CLASS_NAME = "java.lang.Boolean";

    @RequestMapping(value = "simple", method = RequestMethod.POST)
    public RequestResult<String> simple(@RequestBody SimpleParam simpleParam) {
        SimpleExhaler exhaler = HippoService.getInstance()
                                            .newSimpleExhaler()
                                            .space(simpleParam.space);

        if (simpleParam.index != null) {
            for (Map.Entry<String, String[]> entry : simpleParam.index.entrySet()) {
                exhaler.index(entry.getKey(), entry.getValue());
            }
        }

        if (simpleParam.indexRange != null) {
            IndexRange range = simpleParam.indexRange;
            exhaler.indexRange(range.key, range.start, range.end);
        }

        exhaler.columns(simpleParam.columns);

        try {
            Future<SimpleExhalable> future = exhaler.exhale();
            String resultJson = future.get().toJson();
            log.info("Hippo simple exhale with space[" + simpleParam.space + "] ");

            return RequestResult.success(resultJson);

        } catch (ExhaleException e) {
            return RequestResult.fail(e.getMessage());
        } catch (InterruptedException e) {
            return RequestResult.fail(e.getMessage());
        } catch (ExecutionException e) {
            if (e.getCause() instanceof LicenseMismatchException) {
                return RequestResult.licenseMismatch("License expired!!");
            }
            return RequestResult.fail(e.getMessage());
        }

    }

    @RequestMapping(value = "mashup", method = RequestMethod.POST)
    public RequestResult<String> mashup(@RequestBody MashupParam mashupParam) {
        MashupExhaler exhaler = HippoService.getInstance().newMashupExhaler();
        StringBuilder spaceName = new StringBuilder();
        String spaceNameSep = "";

        for (SimpleParam simpleParam : mashupParam.spaceParam) {
            exhaler.space(simpleParam.space);
            spaceName.append(spaceNameSep).append(simpleParam.space);
            spaceNameSep = ", ";

            if (simpleParam.index != null) {
                for (Map.Entry<String, String[]> entry : simpleParam.index.entrySet()) {
                    exhaler.index(entry.getKey(), entry.getValue());
                }
            }

            if (simpleParam.indexRange != null) {
                IndexRange range = simpleParam.indexRange;
                exhaler.indexRange(range.key, range.start, range.end);
            }
        }

        if (mashupParam.mashupKeys != null) {
            exhaler.mashupKey(mashupParam.mashupKeys);
        }

        for (SimpleParam simpleParam : mashupParam.spaceParam) {
            for (String column : simpleParam.columns) {
                exhaler.column(simpleParam.space, column);
            }
        }

        try {
            Future<MashupExhalable> future = exhaler.exhale();
            String resultJson = future.get().toJson();
            log.info("Hippo mashup exhale with space[" + spaceName.toString() + "]");

            return RequestResult.success(resultJson);

        } catch (ExhaleException e) {
            return RequestResult.fail(e.getMessage());
        } catch (InterruptedException e) {
            return RequestResult.fail(e.getMessage());
        } catch (ExecutionException e) {
            if (e.getCause() instanceof LicenseMismatchException) {
                return RequestResult.licenseMismatch("License expired!!");
            }
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(value = "inhale", method = RequestMethod.POST)
    public RequestResult<String> inhale(@RequestBody InhaleParam inhaleParam) {
        String encodeTimestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()) + "000";
        StringBuilder indexStrBuilder = new StringBuilder("index[");

        Inhaler inhaler = HippoService.getInstance().newInhaler();

        inhaler.space(inhaleParam.space);

        String indexSep = "";
        for (Map.Entry<String, String> entry : inhaleParam.index.entrySet()) {
            inhaler.index(entry.getKey(), entry.getValue());
            indexStrBuilder.append(indexSep)
                           .append(entry.getKey())
                           .append(": ")
                           .append(entry.getValue());
            indexSep = ", ";
        }
        indexStrBuilder.append("]");

        for (Map<String, Object> data : inhaleParam.data) {
            inhaler.dataTimestamp(encodeTimestamp);

            for (Map.Entry<String, Object> entry : data.entrySet()) {
                Object value = entry.getValue();
                String valueClassName = value.getClass().getName();

                if (valueClassName.equals(STRING_CLASS_NAME)) {
                    inhaler.put(entry.getKey(), (String) value);

                } else if (valueClassName.equals(DOUBLE_CLASS_NAME)) {
                    inhaler.put(entry.getKey(), (Double) value);

                } else if (valueClassName.equals(BOOLEAN_CLASS_NAME)) {
                    inhaler.put(entry.getKey(), (Boolean) value);

                } else {
                    return RequestResult.fail("資料型態限定 string, number, and boolean.");
                }
            }

            inhaler.next();
        }

        try {
            Future<Inhalable> future = inhaler.inhale();
            Inhalable inhalable = future.get();
            log.info("Hippo inhale with space[" + inhaleParam.space + "], " + indexStrBuilder);

            return RequestResult.success();

        } catch (InterruptedException e) {
            return RequestResult.fail(e.getMessage());
        } catch (ExecutionException e) {
            return RequestResult.fail(e.getMessage());
        } catch (InhaleException e) {
            if (e.getCause() instanceof LicenseMismatchException) {
                return RequestResult.licenseMismatch("License expired!!");
            }
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(value = "inhaleAppend", method = RequestMethod.POST)
    public RequestResult<String> inhaleAppend(@RequestBody InhaleParam inhaleParam) {
        String encodeTimestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()) + "000";
        StringBuilder indexStrBuilder = new StringBuilder("index[");

        Inhaler inhaler = HippoService.getInstance().newInhaler();

        inhaler.space(inhaleParam.space);

        String indexSep = "";
        for (Map.Entry<String, String> entry : inhaleParam.index.entrySet()) {
            inhaler.index(entry.getKey(), entry.getValue());
            indexStrBuilder.append(indexSep)
                .append(entry.getKey())
                .append(": ")
                .append(entry.getValue());
            indexSep = ", ";
        }
        indexStrBuilder.append("]");

        for (Map<String, Object> data : inhaleParam.data) {
            inhaler.dataTimestamp(encodeTimestamp);

            for (Map.Entry<String, Object> entry : data.entrySet()) {
                Object value = entry.getValue();
                String valueClassName = value.getClass().getName();

                if (valueClassName.equals(STRING_CLASS_NAME)) {
                    inhaler.put(entry.getKey(), (String) value);

                } else if (valueClassName.equals(DOUBLE_CLASS_NAME)) {
                    inhaler.put(entry.getKey(), (Double) value);

                } else if (valueClassName.equals(BOOLEAN_CLASS_NAME)) {
                    inhaler.put(entry.getKey(), (Boolean) value);

                } else {
                    return RequestResult.fail("資料型態限定 string, number, and boolean.");
                }
            }

            inhaler.next();
        }

        try {
            Future<Inhalable> future = inhaler.inhaleAppend();
            Inhalable inhalable = future.get();
            log.info("Hippo inhale with space[" + inhaleParam.space + "], " + indexStrBuilder);

            return RequestResult.success();

        } catch (InterruptedException e) {
            return RequestResult.fail(e.getMessage());
        } catch (ExecutionException e) {
            return RequestResult.fail(e.getMessage());
        } catch (InhaleException e) {
            if (e.getCause() instanceof LicenseMismatchException) {
                return RequestResult.licenseMismatch("License expired!!");
            }
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(value = "queryIndex", method = RequestMethod.POST)
    public RequestResult<?> queryIndex(@RequestBody QueryIndexParam queryIndexParam) {

        //only space
        if (queryIndexParam.indexValues == null  && HippoService.getInstance().exists(queryIndexParam.space)) {
            List<String> indexValues = HippoService.getInstance().queryIndex(queryIndexParam.space);
            return RequestResult.success(indexValues);
        } else if (HippoService.getInstance().exists(queryIndexParam.space, queryIndexParam.indexValues)){
            List<String> indexValues = HippoService.getInstance().queryIndex(queryIndexParam.space, queryIndexParam.indexValues);
            return RequestResult.success(indexValues);
        } else if (queryIndexParam.indexValues == null) {
            return RequestResult.fail("space: " + queryIndexParam.space + "不存在，請檢查。");
        } else {
            String indexValues = "";
            for (String value : queryIndexParam.indexValues) {
                indexValues += value + ", ";
            }
            return RequestResult.fail("space: " + queryIndexParam.space + " indexValue: " + indexValues + "不存在，請檢查。");
        }

    }

    @RequestMapping(value = "getKeys", method = RequestMethod.POST)
    public RequestResult<?> getKeys(@RequestBody QueryIndexParam queryIndexParam) {

        return  RequestResult.success(HippoService.getInstance().columnKeys(queryIndexParam.space));
    }

    @RequestMapping(value = "getStructure", method = RequestMethod.GET)
    public RequestResult<?> getStructure() {
        return RequestResult.success(HippoService.getInstance().getStructure());
    }

    public static class SimpleParam {
        public String space;
        public Map<String, String[]> index;
        public IndexRange indexRange;
        public String[] columns;
    }

    public static class MashupParam {
        public SimpleParam[] spaceParam;
        public String[] mashupKeys;
    }

    public static class IndexRange {
        public String key;
        public String start;
        public String end;
    }

    public static class InhaleParam {
        public String space;
        public Map<String, String> index;
        public List<Map<String, Object>> data;
    }

    public static class QueryIndexParam {
        public String space;
        public String[] indexValues;
    }

}
