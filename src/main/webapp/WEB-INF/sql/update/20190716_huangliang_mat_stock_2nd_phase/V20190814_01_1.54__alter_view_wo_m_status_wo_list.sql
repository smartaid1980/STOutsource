USE `servcloud`;
CREATE 
     OR REPLACE ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `a_huangliang_view_wo_m_status_wo_list` AS
    SELECT 
        `a`.`order_id` AS `order_id`,
        `a`.`machine_id` AS `machine_id`,
        `a`.`wo_m_time` AS `wo_m_time`,
        `a`.`m_qty` AS `m_qty`,
        `a`.`m_pqty` AS `m_pqty`,
        `a`.`m_bqty` AS `m_bqty`,
        `a`.`w_m_status` AS `w_m_status`,
        `a`.`exp_mdate` AS `exp_mdate`,
        `a`.`exp_edate` AS `exp_edate`,
        `a`.`act_mdate` AS `act_mdate`,
        `a`.`act_edate` AS `act_edate`,
        `a`.`m_ptime` AS `m_ptime`,
        `a`.`m_usage` AS `m_usage`,
        `a`.`pg_seq` AS `pg_seq`,
        `a`.`mat_control` AS `mat_control`,
        `a`.`create_by` AS `create_by`,
        `a`.`create_time` AS `create_time`,
        `a`.`modify_by` AS `modify_by`,
        `a`.`modify_time` AS `modify_time`,
        `b`.`product_id` AS `product_id`,
        `b`.`product_pid` AS `product_pid`,
        `b`.`customer_id` AS `customer_id`,
        `b`.`order_qty` AS `order_qty`,
        `b`.`wo_pqty` AS `wo_pqty`,
        `b`.`wo_bqty` AS `wo_bqty`,
        `b`.`wo_mqty` AS `wo_mqty`,
        `b`.`exp_date` AS `exp_date`,
        `b`.`wo_status` AS `wo_status`,
        `b`.`create_time` AS `wo_list_create_time`,
        `b`.`modify_time` AS `wo_list_modify_time`,
        `b`.`create_by` AS `wo_list_create_by`,
        `b`.`modify_by` AS `wo_list_modify_by`,
        (SELECT 
                COUNT(0)
            FROM
                `a_huangliang_wo_m_mat` `b`
            WHERE
                ((`a`.`order_id` = `b`.`order_id`)
                    AND (`a`.`machine_id` = `b`.`machine_id`)
                    AND (`a`.`wo_m_time` = `b`.`wo_m_time`)
                    AND (`b`.`m_mat_status` <> 99)
                    AND (`b`.`type` = 1))) AS `material_assign_count`
    FROM
        (`a_huangliang_wo_m_status` `a`
        LEFT JOIN `a_huangliang_wo_list` `b` ON ((`a`.`order_id` = `b`.`order_id`)));
