package com.servtech.servcloud.connect.bean;

import com.servtech.servcloud.module.service.adapter.bean.MachineInfo;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by hubertlu on 2017/3/14.
 */
public class ResponseBody4 {
    private List<MachineInfo> infos = new ArrayList<MachineInfo>();

    public boolean addMachineInfo(MachineInfo machineInfo) {
        return infos.add(machineInfo);
    }
}
