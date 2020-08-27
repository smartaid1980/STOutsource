package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_document")
@IdName("doc_id")
public class Document extends Model {
}
