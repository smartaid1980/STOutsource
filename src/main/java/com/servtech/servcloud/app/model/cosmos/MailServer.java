package com.servtech.servcloud.app.model.cosmos;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny on 2019/05/16 COSMOS自動寄送報表
 */
@Table("a_cosmos_mail_server")
@IdName("mail_server_ip")
public class MailServer extends Model {
}
