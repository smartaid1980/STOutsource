package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_store")
@IdName("store_id")
@BelongsTo(parent = StoreType.class, foreignKeyName = "store_type_id")
public class Store extends Model {
}
