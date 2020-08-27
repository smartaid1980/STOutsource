CREATE VIEW a_servtrack_view_tracking_kpi AS
SELECT
wo.process_code,
wt.*

FROM a_servtrack_work_tracking wt

INNER JOIN
a_servtrack_work_op wo
on wt.work_id = wo.work_id and wt.op = wo.op;

CREATE VIEW a_servtrack_view_tracking_ng_quality AS
SELECT
wt.shift_day,
vwo.process_code,
vwo.process_name,
wtng.ng_code,
psng.ng_name,
wtng.ng_quantity,
wt.output,
vwo.product_name,
vwo.product_id,
wt.line_id,
l.line_name

FROM a_servtrack_work_tracking_ng wtng

INNER JOIN
a_servtrack_process_ng psng
on psng.process_code = wtng.process_code and
psng.ng_code = wtng.ng_code

RIGHT JOIN
a_servtrack_work_tracking wt
on wtng.move_in = wt.move_in and
wtng.line_id = wt.line_id and
wtng.work_id = wt.work_id and
wtng.op = wt.op

INNER JOIN
a_servtrack_view_work_op vwo
on wt.work_id = vwo.work_id and wt.op = vwo.op

INNER JOIN
a_servtrack_line l
on l.line_id = wt.line_id;