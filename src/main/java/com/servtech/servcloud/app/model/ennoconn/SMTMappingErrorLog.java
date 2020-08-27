package com.servtech.servcloud.app.model.ennoconn;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_smt_mapping_error_log")
@IdName("log_id")
public class SMTMappingErrorLog extends Model {}
