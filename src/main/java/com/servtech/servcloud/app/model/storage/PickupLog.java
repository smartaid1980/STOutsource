package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_pickup_log")
@CompositePK({"pickup_timestamp", "work_no", "order_no"})
@BelongsTo(parent = Sender.class, foreignKeyName = "sender_key")
public class PickupLog extends Model {}
