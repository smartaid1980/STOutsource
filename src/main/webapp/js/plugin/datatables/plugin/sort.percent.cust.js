/**
 * 參考 https://datatables.net/plug-ins/sorting/percent
 * -pre方法 和 (-asc, -desc)方法 不能同時使用
 * 這裡只用-pre方法，作百分比字串的前處理
 * 順序：非百分比字串, ---', '+++', ...'0%', ...'100%', ...
 */
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "percent-pre": function ( a ) {
    if (a === '+++') {
      return Number.MIN_SAFE_INTEGER - 2;
    } else if (a === '---') {
      return Number.MIN_SAFE_INTEGER - 1;
    } else {
      const x = parseFloat(a.replace(/%/, ''));
      return isNaN(x) ? Number.MIN_SAFE_INTEGER : x;
    }
  },
});