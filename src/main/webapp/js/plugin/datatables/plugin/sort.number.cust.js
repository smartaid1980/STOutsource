jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "num-cust-pre": function ( a ) {
    if (a === '+++') {
      return Number.MIN_SAFE_INTEGER - 2;
    } else if (a === '---') {
      return Number.MIN_SAFE_INTEGER - 1;
    } else {
      return isNaN(a) ? Number.MIN_SAFE_INTEGER : a;
    }
  },
});