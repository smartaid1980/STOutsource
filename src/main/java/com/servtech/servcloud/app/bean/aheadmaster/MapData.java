package com.servtech.servcloud.app.bean.aheadmaster;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.common.csv.CsvUtil;
import com.servtech.common.csv.annotation.CsvColumn;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;

/**
 * Created by Hubert
 * Datetime: 2015/10/28 上午 11:12
 */
public class MapData {
    private static final Logger log = LoggerFactory.getLogger(MapData.class);

    @CsvColumn(index=0) private String id;
    @CsvColumn(index=1) private String name;

    public MapData() {
    }

    public MapData(String name, String id) {
        this.name = name;
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public String getId() {
        return id;
    }

    @Override
    public String toString() {
        return id + "|" + name;
    }

    public static List<MapData> read(String mapPathRelatedToDataPath) throws IOException {
        File file = new File(System.getProperty(SysPropKey.DATA_PATH), mapPathRelatedToDataPath + ".csv");
        createFileIfNotExist(file);

        List<String> lines = Files.readLines(file, Charsets.UTF_8);
        return CsvUtil.transform(lines, "\\|", MapData.class);
    }

    public static LinkedHashMap<String, MapData> readWithLinkedHashMap(String mapPathRelatedToDataPath) throws IOException {
        List<MapData> dataList = read(mapPathRelatedToDataPath);
        LinkedHashMap<String, MapData> result = new LinkedHashMap<String, MapData>();
        for (MapData data : dataList) {
            result.put(data.id, data);
        }
        return result;
    }

    public static void write(List<MapData> dataList, String mapPathRelatedToDataPath) throws IOException {
        toFile(dataList, mapPathRelatedToDataPath);
    }

    public static void write(LinkedHashMap<String, MapData> dataMap, String mapPathRelatedToDataPath) throws IOException {
        toFile(dataMap.values(), mapPathRelatedToDataPath);
    }

    private static void toFile(Collection<MapData> dataCollection, String mapPathRelatedToDataPath) throws IOException {
        File file = new File(System.getProperty(SysPropKey.DATA_PATH), mapPathRelatedToDataPath + ".csv");
        createFileIfNotExist(file);

        StringBuilder sb = new StringBuilder();
        for (MapData data : dataCollection) {
            sb.append(data.toString())
              .append(System.getProperty("line.separator"));
        }
        Files.write(sb.toString(), file, Charsets.UTF_8);
    }

    private static void createFileIfNotExist(File file) {
        if (!file.exists()) {
            try {
                Files.createParentDirs(file);
                file.createNewFile();
            } catch (IOException e) {
                log.warn(e.getMessage(), e);
            }
        }
    }
}
