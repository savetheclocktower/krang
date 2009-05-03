

Chart.Bar = Class.create(Chart.Base, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);
    this.canvas = canvas;
  },
  
  draw: function() {
    if (this.R) this.R.remove();
    this.R = Raphael(this.canvas, this.options.width, this.options.height);
    if (this._datasets.length === 0) {
      throw new Krang.Error("No datasets!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter;
    
    var max;
    
    if (opt.grid.maxY === 'auto') {
      if (opt.stack) {
        max = Math.sum.apply(Math, this._datasets.invoke('maxValue'));
      } else {
        max = Math.max.apply(Math, this._datasets.invoke('maxValue'));
      }
    } else {
      max = opt.grid.maxY;
    }
    
    // Width of each bar.
    var xScale = (opt.width - (g.left + g.right)) / 
     (this._datasets.first().dataLength());
     
    // Vertical scale of chart.
    var yRange = opt.height - (g.top + g.bottom);    
    var yScale = yRange / max;
    
    var columns = opt.grid.vertical.enabled   ? opt.grid.vertical.lines   : 0;
    var rows    = opt.grid.horizontal.enabled ? opt.grid.horizontal.lines : 0;
    
    // Draw the background grid.
    R.drawGrid(
      g.left,                           /* X                 */
      g.top,                            /* Y                 */
      opt.width  - (g.left + g.right),  /* width             */
      opt.height - (g.top + g.bottom),  /* height            */
      columns,                          /* number of columns */
      rows,                             /* number of rows    */
      opt.grid.color                    /* color             */
    );
    
    // Draw the outer frame.
    R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({ stroke: opt.border.color });
    
    var barTotals = [];
    var label, value, x = 0, y, rect, startingY, barX, barY;
    
    var $color = opt.bar.color;
    if (opt.bar.color instanceof Krang.Colorset) {
      opt.bar.color.setLength(this._datasets.length);
    }
    
    function plotDataset(dataset, index) {
      var data = dataset.toArray();
      var color = $color.toString();
      

      for (var i = 0, l = data.length; i < l; i++) {
        label = data[i].label, value = data[i].value;
        
        y = Math.round((yScale * value) - (opt.bar.border.width));
        x = Math.round(g.left + (xScale * i));
        
        // Because the bars may stack in the case of multiple datasets, we
        // have to keep track of the total height of each bar.
        if (Object.isUndefined(barTotals[i])) {
          startingY = 0;
          barTotals[i] = y;
        } else {
          startingY = barTotals[i];
          barTotals[i] += y;
        }
        
        
        textBoxWidth = Math.round(xScale - opt.bar.gutter);
        if (opt.stack) {
          barWidth = textBoxWidth;
        } else {
          barWidth = Math.round(
           (xScale - opt.bar.gutter) / this._datasets.length);
        }
        
        var attrs = {
          fill:    color,
          opacity: opt.bar.opacity,
          stroke: 'none'
        };
        
        if (opt.bar.border.width > 0) {
          var borderColor = opt.bar.border.color;
          
          borderColor = (borderColor === 'auto') ?
            Krang.Color.fromString(color).darkerBy(0.05).toHexString() :
            Krang.Colorset.interpret(borderColor);
            
          Object.extend(attrs, {
            'stroke':       borderColor,
            'stroke-width': opt.bar.border.width
          });
        }
        
        var colorObj = Krang.Color.fromString(color);
        
        var gradient = {
          type: 'linear',
          dots: [
            { color: colorObj.lighterBy(0.05).toHexString() },
            { color: colorObj.darkerBy( 0.05).toHexString() }
          ],
          vector: [0, 0, '100%', 0]
        };
        
        barY = opt.stack ? startingY : 0;
        barX = opt.stack ? (x + (opt.bar.gutter / 2)) : 
          x + (opt.bar.gutter / 2) + (barWidth * index);
        
        
        // Draw the bar.
        R.rect(
          barX,
          (g.top + yRange) - y - barY - (opt.bar.border.width / 2),
          barWidth,
          y
        ).attr(attrs).attr({ gradient: gradient });
        
        if (opt.bar.label.enabled) {
          var topOfBar    = (g.top + yRange) - y - barY;
          var bottomOfBar = g.top + yRange;
          var positions = {
            above:  topOfBar - 15,
            top:    topOfBar + 10,
            bottom: bottomOfBar - 10,
            below:  bottomOfBar + 15
          };
          
          var textStartY = positions[opt.bar.label.position] || position.above;
          
          var text = R.text(x, textStartY, opt.bar.label.filter(value)).attr({
            font: '#{0} #{1}'.interpolate(
             [opt.bar.label.fontSize, opt.bar.label.fontFamily]),
             stroke: 'none',
             fill: opt.bar.label.color
          });
          
          var textWidth = text.getBBox().width;
          var textX     = Math.round(textBoxWidth / 2);
          text.attr({ x: Math.round(x + textX + (opt.bar.gutter / 2)) });          
        }
        
        
        // Only draw X-axis labels for the first set.
        if (!index) {
          textStartY = g.top + yRange + Math.round(g.bottom / 2);

          text = R.text(x, textStartY, label).attr({
            font: '#{0} #{1}'.interpolate([opt.text.fontSize, opt.text.fontFamily]),
            stroke: 'none',
            fill: opt.text.color          
          });

          textWidth = text.getBBox().width;
          textX     = Math.round(textBoxWidth / 2);
          
          text.attr({ x: Math.round(x + textX + (opt.bar.gutter / 2)) });
        }
      }
    }
    
    // Draw Y-axis labels.
    var yStart = g.bottom, yEnd = opt.height - g.top;
    
    
    var value, yLabel, yPlot, text;
    for (var j = 0, yLabel; j <= rows; j++) {
      value = (j / rows) * max;
      yLabel = opt.grid.labelY(value);
      yPlot = yStart + ((j * yRange) / rows);
      
      text = R.text(Math.round(g.left / 2), (opt.height - yPlot), yLabel).attr({
        font: '#{0} #{1}'.interpolate([opt.text.fontSize, opt.text.fontFamily]),
        stroke: 'none',
        fill: opt.text.color          
      });
      
      // Fake right-alignment.
      var textWidth = text.getBBox().width;
      var textX = g.left - 15 - textWidth;
      
      text.attr({ x: textX, 'text-anchor': 'start' });
    }
        
    this._datasets.each(plotDataset, this);
  }
});


Object.extend(Chart.Bar, {
  DEFAULT_OPTIONS: {
    width:  800,
    height: 300,
    bar: {
      color: new Krang.Colorset({
        vary: 'l',
        hue: 0.25,
        saturation: 0.6
      }),
      border: {
        width: 0,
        color: 'auto'
      },
      gutter: 5,
      opacity: 1.0,
      label: {
        enabled: false,
        position: 'above',
        fontFamily: '"Lucida Grande"',
        fontSize:   '12px',
        color:      "#000"
      }
    },
    
    fill: {
      color: '#039',
      opacity: 0.3
    },
    
    gutter: {
      top:    20,
      bottom: 30,
      left:   100,
      right:  30
    },
    
    grid: {
      color: '#ddd',
      
      horizontal: {
        enabled: true,
        lines: 10
      },
      
      vertical: {
        enabled: false,
        lines: 0
      },
      
      labelX: Prototype.K,
      labelY: function(value) {
        return value.toFixed(1);
      },
      
      maxY: 'auto'
    },
    
    border: {
      color: '#999'
    },
    
    text: {
      fontFamily: '"Lucida Grande"',
      fontSize:   '12px',
      color:      "#000"
    },
    
    stack: false
  }
});