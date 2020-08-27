package com.servtech.servcloud.module.service.hippo;

import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.HippoFactory;
import com.servtech.hippopotamus.fileio.FileDBHippo;
import com.servtech.servcloud.core.util.SysPropKey;

/**
 * Created by Hubert
 * Datetime: 2016/1/13 上午 09:59
 */
public class HippoService {
    private static Hippo INSTANCE;

    public synchronized static Hippo getInstance() {
        if (INSTANCE == null) {
            INSTANCE = HippoFactory.getHippo(System.getProperty(SysPropKey.ROOT_PATH) + "WEB-INF/classes/hippo.xml");
        }
        return INSTANCE;
    }

    public synchronized static void reset() {
        if (INSTANCE instanceof FileDBHippo) {
            ((FileDBHippo) INSTANCE).shutdown();
        }
        INSTANCE = null;
    }

}
