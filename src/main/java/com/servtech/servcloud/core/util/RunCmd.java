package com.servtech.servcloud.core.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by Jenny on 2015/10/19.
 */
public class RunCmd{
    private static final Logger logger = LoggerFactory.getLogger(RunCmd.class);

    private String[] cmd;
    private String[] envp;
    private File file;
    private boolean isPrint;

    public RunCmd(String[] cmd){
        this.cmd = cmd;
        this.envp = null;
        this.file = null;
        this.isPrint = true;
    }

    public RunCmd(String[] cmd, String[] envp, File file){
        this.cmd = cmd;
        this.envp = envp;
        this.file = file;
        this.isPrint = true;
    }

    public void exec(){
        Runtime rt = Runtime.getRuntime();
        try {
            Process proc = rt.exec(cmd, envp, file);
            new Thread(new ClearProcessStream(proc.getErrorStream(), "ERROR", isPrint)).start();
            new Thread(new ClearProcessStream(proc.getInputStream(), "OUTPUT", isPrint)).start();
            int exitVal = proc.waitFor();
            if(isPrint){
                logger.info("Process exitValue: " + exitVal);
            }
        } catch (IOException e) {
            logger.warn("RunCmd io exception: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            logger.warn("RunCmd interrupt exception: " + e.getMessage(), e);
        }
    }

    public int execAndReturn(){
        Runtime rt = Runtime.getRuntime();
        int exitVal = 0;
        try {
            Process proc = rt.exec(cmd, envp, file);
            new Thread(new ClearProcessStream(proc.getErrorStream(), "ERROR", isPrint)).start();
            new Thread(new ClearProcessStream(proc.getInputStream(), "OUTPUT", isPrint)).start();
            exitVal = proc.waitFor();
            if(isPrint){
                logger.info("Process exitValue: " + exitVal);
            }
        } catch (IOException e) {
            e.printStackTrace();
            logger.warn("RunCmd io exception: " + e.getMessage(), e);
            exitVal = 1;
        } catch (InterruptedException e) {
            e.printStackTrace();
            logger.warn("RunCmd interrupt exception: " + e.getMessage(), e);
            exitVal = 1;
        }
        return exitVal;
    }

    public void setPrint(boolean isPrint) {
        this.isPrint = isPrint;
    }
}

class ClearProcessStream implements Runnable{
    private static final Logger logger = LoggerFactory.getLogger(ClearProcessStream.class);

    private boolean isPrint;
    private InputStream is;
    private String type;

    private Thread thread;

    public ClearProcessStream(InputStream is, String type, boolean isPrint){
        this.is = is;
        this.type = type;
        this.isPrint = isPrint;
    }

    public void start(){
        this.thread = new Thread(this);
        this.thread.start();
    }

    @Override
    public void run() {
        InputStreamReader isr = null;
        BufferedReader br = null;
        try {
            isr = new InputStreamReader(is);
            br = new BufferedReader(isr);
            String line = null;

            while ( (line = br.readLine()) != null) {
                if(isPrint) logger.info(type + ">" + line);
//                System.out.flush();
            }
        } catch (IOException e) {
            logger.warn("RunCmd exception:{}" + e.getMessage(), e);
        }
    }
}
