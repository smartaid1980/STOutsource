package com.servtech.servcloud.app.controller.shayangye;

import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.RequestResult.*;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

@RestController
@RequestMapping("/shayangye/machine/sync")
public class MachineSyncController {

    private static final Logger log = LoggerFactory.getLogger(MachineSyncController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = GET)
    public RequestResult<?> get() {

        String batTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/app/Management/program/ShayangyeMachineSync";
        String runBatPath = batTarget + "/run.bat";

        String[] commands = new String[]{runBatPath};
        ShayangyeMachineSyncCmd cmd = new ShayangyeMachineSyncCmd.Builder().setCommands(commands)
                .setEnvp(null)
                .setFile(new File(batTarget))
                .build();

        ShayangyeMachineSyncCmd.ResponseData data = cmd.runCmd();
        if (data.status == 0) {
            return success(data);
        } else {
            return fail(data);
        }
    }


    public static class ShayangyeMachineSyncCmd {

        private String[] commands;
        private String[] envp;
        private File file;

        private ShayangyeMachineSyncCmd(Builder builder) {
            this.commands = builder.commands;
            this.envp = builder.envp;
            this.file = builder.file;
        }


        public static class Builder {
            private String[] commands;
            private String[] envp;
            private File file;
            public Builder setCommands(String[] commands) {
                if (commands == null || commands.length == 0) {
                    throw new BuilderExection("commands is null or isEmpty");
                }
                this.commands = commands;
                return this;
            }

            public Builder setEnvp(String[] envp) {
                this.envp = envp;
                return this;
            }

            public Builder setFile(File file) {
                this.file = file;
                return this;
            }

            public ShayangyeMachineSyncCmd build() {
                return new ShayangyeMachineSyncCmd(this);
            }
        }

        ResponseData runCmd() {
            try {
                ProcessBuilder pb = new ProcessBuilder(this.commands).directory(this.file).redirectErrorStream(true);
                Process proc = pb.start();
                ExecutorService executor = Executors.newCachedThreadPool();
                Callable<ResponseData> task = new Message(proc.getInputStream());
                Future<ResponseData> future = executor.submit(task);
                proc.waitFor();
                return future.get();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
            return null;
        }

        static class Message implements Callable<ResponseData> {

            private InputStream is;
            static final String SEP = System.getProperty("line.separator");

            Message(InputStream is) {
                this.is = is;
            }

            @Override
            public ResponseData call() throws Exception {
                List<String> exMsg = new ArrayList<String>();
                List<String> infoMsg = new ArrayList<String>();
                List<String> warnMsg = new ArrayList<String>();
                try {
                    BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));

                    String line = "";
                    while ((line = br.readLine()) != null) {
                        if (line.indexOf("#info#") > -1) {
                            infoMsg.add(line.substring(line.indexOf("#info#") + 7));
                        } else if (line.indexOf("#warn#") > -1) {
                            warnMsg.add(line.substring(line.indexOf("#warn#") + 7));
                        } else if (line.indexOf("#ex#") > -1) {
                            exMsg.add(line.substring(line.indexOf("#ex#") + 5));
                        } else {
                            System.out.println(line);
                        }
                    }
                } catch (IOException e) {
                    exMsg.add(e.getMessage());
                    e.printStackTrace();
                } catch (Exception e) {
                    exMsg.add(e.getMessage());
                    e.printStackTrace();
                }
                if (exMsg.size() > 0) {
                    return new ResponseData(1, infoMsg, warnMsg, exMsg);
                } else {
                    return new ResponseData(0, infoMsg, warnMsg, exMsg);
                }
            }

        }

        static class ResponseData<I, W, E> {
            int status;
            I infoData;
            W warnData;
            E exData;

            ResponseData(int status, I infoData, W warnData, E exData) {
                this.status = status;
                this.infoData = infoData;
                this.exData = exData;
                this.warnData = warnData;
            }

        }

        static class BuilderExection extends RuntimeException {
            public BuilderExection(String msg) {
                super(msg);
            }
        }

    }

}
