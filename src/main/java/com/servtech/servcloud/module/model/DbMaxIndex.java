package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2016/5/4.
 */

/*
 * 給系統用
 * 用來編pk為流水號對大值，因為有些pk會被其他table當fk用，若使用流水號，當db要還原時，
 * 會因為插入順序造成其他table的fk ref到的pk錯誤，所以當pk要使用流水號同時還要用來當fk時，
 * 就需要自己建立max_index，當db要還原時fk才會與pk一致
 */
@Table(value = "m_db_max_index")
@IdName(value = "table_name")
public class DbMaxIndex extends Model {
}
