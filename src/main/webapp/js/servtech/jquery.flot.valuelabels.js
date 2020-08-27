/**
 * Value Labels Plugin for flot.
 * https://github.com/winne27/flot-valuelabels
 * https://github.com/winne27/flot-valuelabels/wiki
 *
 * Implemented some new options (useDecimalComma, showMinValue, showMaxValue)
 * changed some default values: align now defaults to center, hideSame now defaults to false
 * by Werner Schäffer, October 2014
 *
 * Using canvas.fillText instead of divs, which is better for printing - by Leonardo Eloy, March 2010.
 * Tested with Flot 0.6 and JQuery 1.3.2.
 *
 * Original homepage: http://sites.google.com/site/petrsstuff/projects/flotvallab
 * Released under the MIT license by Petr Blahos, December 2009.
 */
(function($) {
  var options = {
    series: {
      valueLabels: {
        show: false,
        showTextLabel: false,
        showMaxValue: false,
        showMinValue: false,
        showAsHtml: false, // Set to true if you wanna switch back to DIV usage (you need plot.css for this)
        showLastValue: false, // Use this to show the label only for the last value in the series
        labelFormatter: function(v) {
          return v;
        },
        // Format the label value to what you want
        align: 'center', // can also be 'center', 'left' or 'right'          it is possible for you
        valign: 'above', // can also be 'below', 'middle' or 'bottom'
        useDecimalComma: false,
        plotAxis: 'y', // Set to the axis values you wish to plot
        decimals: false,
        hideZero: false,
        hideSame: false, // Hide consecutive labels of the same value
        reverseAlignBelowZero: false, // reverse align and offset for values below 0
        insideBar: false, // assume label appears inside bar: if horizontal bar is smaller than label, move label next to bar (reverse align, offset and colour)
        showShadow: true, // false to not use canvas text shadow effect
        fontcolor: '#222222',
        shadowColor: false, // false = use ctx default
        useBackground: false, // set label into box with background color
        backgroundColor: '#cccccc', // set backgroundColor like #FFCC00 or darkred
        useBorder: false, // use a broder arround the label
        borderColor: '#999999'
      }
    }
  };

  function init(plot) {
    plot.hooks.draw.push(function(plot, ctx) {
      // keep a running total between series for stacked bars.
      var stacked = {};

      $.each(plot.getData(), function(ii, series) {
        if (!series.valueLabels.show) return;
        var showLastValue = series.valueLabels.showLastValue;
        var showAsHtml = series.valueLabels.showAsHtml;
        var showMaxValue = series.valueLabels.showMaxValue;
        var showMinValue = series.valueLabels.showMinValue;
        var showTextLabel = series.valueLabels.showTextLabel;
        var plotAxis = series.valueLabels.plotAxis;
        var labelFormatter = series.valueLabels.labelFormatter;
        var xoffset = series.valueLabels.xoffset || 0;
        var yoffset = series.valueLabels.yoffset || 0;
        var xoffsetMin = series.valueLabels.xoffsetMin || xoffset;
        var yoffsetMin = series.valueLabels.yoffsetMin || yoffset;
        var xoffsetMax = series.valueLabels.xoffsetMax || xoffset;
        var yoffsetMax = series.valueLabels.yoffsetMax || yoffset;
        var xoffsetLast = series.valueLabels.xoffsetLast || xoffset;
        var yoffsetLast = series.valueLabels.yoffsetLast || yoffset;
        var valign = series.valueLabels.valign;
        var valignLast = series.valueLabels.valignLast || valign;
        var valignMin = series.valueLabels.valignMin || 'below';
        var valignMax = series.valueLabels.valignMax || 'above';
        var align = series.valueLabels.align;
        var fontcolor = series.valueLabels.fontcolor || series.color || '#111111';
        var shadowColor = series.valueLabels.shadowColor || fontcolor;
        var font = series.valueLabels.font || '9pt san-serif';
        var hideZero = series.valueLabels.hideZero;
        var hideSame = series.valueLabels.hideSame;
        var reverseAlignBelowZero = series.valueLabels.reverseAlignBelowZero;
        var insideBar = series.valueLabels.insideBar;
        var showShadow = series.valueLabels.showShadow;
        var useDecimalComma = series.valueLabels.useDecimalComma;
        var stackedbar = series.stack;
        var decimals = series.valueLabels.decimals;
        var useBackground = series.valueLabels.useBackground;
        var backgroundColor = series.valueLabels.backgroundColor;
        var useBorder = series.valueLabels.useBorder;
        var borderColor = series.valueLabels.borderColor;

        // Workaround, since Flot doesn't set this value anymore
        series.seriesIndex = ii;
        if (showAsHtml) {
          plot.getPlaceholder().find("#valueLabels" + ii).remove();
        }
        var html = '<div id="valueLabels' + series.seriesIndex + '" class="valueLabels">';
        var last_val = null;
        var last_x = -1000;
        var last_y = -1000;
        var xCategories = series.xaxis.options.mode == 'categories';
        var yCategories = series.yaxis.options.mode == 'categories';

        if ((showMinValue || showMaxValue) && typeof(series.data[0]) != 'undefined') {
          var xMin = +series.data[0][0];
          var xMax = +series.data[0][0];
          var yMin = +series.data[0][1];
          var yMax = +series.data[0][1];
          for (var i = 1; i < series.data.length; ++i) {
            if (+series.data[i][0] < xMin) xMin = +series.data[i][0];
            if (+series.data[i][0] > xMax) xMax = +series.data[i][0];
            if (+series.data[i][1] < yMin) yMin = +series.data[i][1];
            if (+series.data[i][1] > yMax) yMax = +series.data[i][1];
          }
        } else {
          showMinValue = false;
          showMaxValue = false;
        }

        var notShowAll = showMinValue || showMaxValue || showLastValue;
        for (var i = 0; i < series.data.length; ++i) {
          if (series.data[i] === null) continue;
          var x = series.data[i][0],
            y = series.data[i][1];

          if (showTextLabel && series.data[i].length > 2) {
            t = series.data[i][2];
          } else {
            t = false;
          }

          if (notShowAll) {
            var doWork = false;
            if (showMinValue && ((yMin == y && plotAxis == 'y') || (xMin == x && plotAxis == 'x'))) {
              doWork = true;
              var xdelta = xoffsetMin;
              var ydelta = yoffsetMin;
              var valignWork = valignMin;
              showMinValue = false;
            } else if (showMaxValue && ((yMax == y && plotAxis == 'y') || (xMax == x && plotAxis == 'x'))) {
              doWork = true;
              var xdelta = xoffsetMax;
              var ydelta = yoffsetMax;
              var valignWork = valignMax;
              showMaxValue = false;
            } else if (showLastValue && i == series.data.length - 1) {
              doWork = true;
              var xdelta = xoffsetLast;
              var ydelta = yoffsetLast;
              var valignWork = valignLast;
            }
            if (!doWork) continue;
          } else if (reverseAlignBelowZero && y < 0 && plotAxis == 'y') {
            var xdelta = xoffset;
            var ydelta = -1 * yoffset;
            if (valign == 'above') {
              valign = 'below';
            } else if (valign == 'below') {
              valign = 'above';
            }
            var valignWork = valign;
          } else if (reverseAlignBelowZero && x < 0 && plotAxis == 'x') {
            var xdelta = -1 * xoffset;
            var ydelta = yoffset;
            var valignWork = valign;
            if (align == 'left') {
              align = 'right';
            } else if (align == 'right') {
              align = 'left';
            }
          } else {
            var xdelta = xoffset;
            var ydelta = yoffset;
            var valignWork = valign;
          }

          // for backward compability
          if (valignWork == 'top') {
            valignWork = 'above';
          }

          if (xCategories) {
            x = series.xaxis.categories[x];
          }
          if (yCategories) {
            y = series.yaxis.categories[y];
          }
          if (x < series.xaxis.min || x > series.xaxis.max || y < series.yaxis.min || y > series.yaxis.max) continue;

          if (t !== false) {
            var val = t;
          } else {
            var val = (plotAxis === 'x') ? x : y;
            if (val == null) {
              val = ''
            }

            if (val === 0 && (hideZero || stackedbar)) continue;

            if (decimals !== false) {
              var mult = Math.pow(10, decimals);
              val = Math.round(val * mult) / mult;
            }

            if (useDecimalComma) {
              val = val.toString().replace('.', ',');
            }
          }

          if (series.valueLabels.valueLabelFunc) {
            val = series.valueLabels.valueLabelFunc({
              series: series,
              seriesIndex: ii,
              index: i
            });
          }
          val = "" + val;
          val = labelFormatter(val);

          if (!hideSame || val != last_val || i == series.data.length - 1) {
            if (insideBar && plotAxis == 'x') {
              ctx.font = font;
              if (Math.abs(series.xaxis.p2c(x) - series.xaxis.p2c(0)) < ctx.measureText(val).width + Math.abs(xdelta)) {
                xdelta = -1 * xdelta;
                if (align == 'left') {
                  align = 'right';
                } else if (align == 'right') {
                  align = 'left';
                }
                fontcolor = series.color;
              }
            }

            ploty = y;
            if (valignWork == 'bottom') {
              ploty = 0;
            } else if (valignWork == 'middle') {
              ploty = ploty / 2;
              ydelta = 11 + ydelta;
            } else if (valignWork == 'below') {
              ydelta = 20 + ydelta;
            }

            // add up y axis for stacked series
            var addstack = 0;
            if (stackedbar) {
              if (!stacked[x]) stacked[x] = 0.0;
              addstack = stacked[x];
              stacked[x] = stacked[x] + y;
            }

            var xx = series.xaxis.p2c(x) + plot.getPlotOffset().left;
            var yy = series.yaxis.p2c(+ploty + addstack) - 12 + plot.getPlotOffset().top;
            if (!hideSame || Math.abs(yy - last_y) > 20 || last_x < xx) {
              last_val = val;
              last_x = xx + val.length * 8;
              last_y = yy;
              if (!showAsHtml) {
                x_pos = xx + xdelta;
                y_pos = yy + 6 + ydelta;
                // If the value is on the top of the canvas, we need
                // to push it down a little
                if (yy <= 0) y_pos = y_pos + 16;
                // The same happens with the x axis
                if (xx >= plot.width() + plot.getPlotOffset().left) {
                  x_pos = plot.width() + plot.getPlotOffset().left + xdelta - 3;
                  var actAlign = 'right';
                } else {
                  var actAlign = align;
                }
                ctx.font = font;

                if (useBorder || useBackground) {
                  var width = ctx.measureText(val).width + 3;
                  if (width % 2 == 1) {
                    width++;
                  }
                  var height = parseInt(font, 10) + 6;
                  if (valignWork == 'above') {
                    y_pos = y_pos - 2;
                  }

                  if (valignWork == 'below') {
                    y_pos = y_pos + 2;
                  }

                  if (actAlign == 'right') {
                    var x_diff = -width + 2;
                  } else {
                    var x_diff = -width / 2;
                  }

                  ctx.shadowOffsetX = 0;
                  ctx.shadowOffsetY = 0;
                  ctx.shadowBlur = 0;
                  if (useBorder) {
                    ctx.strokeStyle = borderColor;
                    ctx.strokeRect(x_pos + x_diff, y_pos - height + 3, width, height);
                  }
                  if (useBackground) {
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(x_pos + x_diff, y_pos - height + 3, width, height);
                  }
                }

                ctx.fillStyle = fontcolor;

                if (showShadow) {
                  ctx.shadowOffsetX = 0;
                  ctx.shadowOffsetY = 0;
                  ctx.shadowBlur = 1.5;
                  ctx.shadowColor = shadowColor;
                } else {
                  ctx.shadowBlur = 0;
                }

                ctx.textAlign = actAlign;
                ctx.fillText(val, x_pos, y_pos);
              } else {
                //allow same offsets for html rendering
                xx = xx + xoffset;
                yy = yy + 6 + yoffset;

                var head = '<div style="left:' + xx + 'px;top:' + yy + 'px;" class="valueLabel';
                var tail = '">' + val + '</div>';
                html += head + "Light" + tail + head + tail;
              }
            }
          }
        }

        if (showAsHtml) {
          html += "</div>";
          plot.getPlaceholder().append(html);
        }
      });
    });
  }
  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'valueLabels',
    version: '1.7.0'
  });
})(jQuery);