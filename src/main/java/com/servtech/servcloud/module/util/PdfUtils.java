package com.servtech.servcloud.module.util;

import org.apache.commons.io.FilenameUtils;
import org.artofsolving.jodconverter.OfficeDocumentConverter;
import org.artofsolving.jodconverter.office.DefaultOfficeManagerConfiguration;
import org.artofsolving.jodconverter.office.ExternalOfficeManagerConfiguration;
import org.artofsolving.jodconverter.office.OfficeException;
import org.artofsolving.jodconverter.office.OfficeManager;


import java.io.File;

public class PdfUtils {

    @SuppressWarnings("static-access")
    private static String officeHome = "C:\\Program Files (x86)\\OpenOffice 4\\program";
    @SuppressWarnings("static-access")
    private static int port = 8100; //"這裏的內容是根據你的系統選擇不同的端口號，windows系統的端口號是8100";
    private static OfficeManager officeManager;

    public PdfUtils() {
    }


    // 嘗試連接已存在的服務器
    private static boolean reconnect() {
        try {
            // 嘗試連接openoffice的已存在的服務器
            ExternalOfficeManagerConfiguration externalProcessOfficeManager = new ExternalOfficeManagerConfiguration();
            externalProcessOfficeManager.setConnectOnStart(true);
            externalProcessOfficeManager.setPortNumber(8100);
            officeManager = externalProcessOfficeManager.buildOfficeManager();
            officeManager.start();
            return true;
        } catch (OfficeException e) {
            e.printStackTrace();
            return false;
        }

    }

    // 開啟新的openoffice的進程
    private static void start() {
        System.out.println("啟動OpenOffice服務");
        try {
            DefaultOfficeManagerConfiguration configuration = new DefaultOfficeManagerConfiguration();
            configuration.setOfficeHome(officeHome);// 安裝地址
            configuration.setPortNumbers(port);// 端口號
            configuration.setTaskExecutionTimeout(1000 * 60 * 5);// 設置任務執行超時為5分鐘
            configuration.setTaskQueueTimeout(1000 * 60 * 60 * 24);// 設置任務隊列超時為24小時
            officeManager = configuration.buildOfficeManager();
            officeManager.start(); // 啟動服務
        } catch (Exception e) {
            System.out.println("啟動OpenOffice服務出錯" + e);
        }
    }

    // 使用完需要關閉該進程
    private static void stop() {
        System.out.println("關閉OpenOffice服務");
        try {
            if (officeManager != null)
                officeManager.stop();
        } catch (Exception e) {
            System.out.println("關閉OpenOffice服務出錯" + e);
        }
    }


    public static File convertToPdf(String input) {
        File inputFile = null;
        File outFile = null;
        try {
            // 如果已存在的服務不能連接或者不存在服務，那麽開啟新的服務　　　　
            if (!reconnect()) {
                start();// 開啟服務
            }
            // filenameUtils是Apache對java io的封裝。　FilenameUtils.separatorsToSystem：轉換分隔符為當前系統分隔符　/ FilenameUtils.getFullPath:獲取文件的完整目錄
            // FilenameUtils.getBaseName:取出文件目錄和後綴名的文件名
            String output = FilenameUtils.separatorsToSystem(FilenameUtils.getFullPath(input) + FilenameUtils.getBaseName(input) + ".pdf");
            System.out.println("output :" + output);
            inputFile = new File(input);
            outFile = new File(output);
            System.out.println("開始轉換文檔：" + input + "=>" + output);
            OfficeDocumentConverter converter = new OfficeDocumentConverter(officeManager);
            converter.convert(inputFile, outFile); // 轉換文檔
        } catch (Exception e) {
            System.out.println("轉換文檔出錯" + e);
            outFile = null;
        } finally {
            System.out.println("結束轉換文檔");
            stop();
        }
        return outFile;
    }


//    // 測試工具類是否成功
//    public static void main(String[] args) {
//        //PdfUtils.convertToPdf("E:/test.ppt");
//        File sf = new File("E:/test.ppt");
//        System.out.println(sf.getPath());
//    }

}
