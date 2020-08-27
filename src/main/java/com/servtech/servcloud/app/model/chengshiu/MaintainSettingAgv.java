package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2018/04/10.
 */
@Table("a_chengshiu_ma_setting_agv")
@CompositePK({ "rule_id", "machine_id" })
public class MaintainSettingAgv extends Model {
}

