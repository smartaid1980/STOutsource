package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_pickup")
@CompositePK({"pickup_timestamp", "work_order_no"})
@BelongsTo(foreignKeyName = "sender_key", parent = Sender.class)
public class Pickup extends Model {}
