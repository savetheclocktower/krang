

Chart.Bar = Class.create(Chart.Base, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);
    this.R = Raphael(canvas, this.options.width, this.options.height);
  },
  
  draw: function() {
    if (!this._dataset) {
      throw new Krang.Error("No dataset!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter;
    var max = this._dataset.maxValuesSum();
    
    // Width of each bar.
    var xScale = (opt.width - (g.left + g.right)) / 
     (this._dataset.dataLength() - 1);
     
    // Vertical scale of chart.
    var yScale = (opt.height - (g.bottom + g.top)) / max;
    
    // Draw the background grid.
    R.drawGrid(
      g.left,                           /* X                 */
      g.top,                            /* Y                 */
      opt.width  - (g.left + g.right),  /* width             */
      opt.height - (g.top + g.bottom),  /* height            */
      0,                                /* number of columns */
      10,                               /* number of rows    */
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
    var label, value, x = 0, y, rect, startingY;
    function plotDataset(dataset, index) {
      console.log("DATASET", index || 0);
      //if (index === 1) return;
      var data = dataset.toArray();
      var color = Colorset.interpret(opt.bar.color);
      
      var yRange = opt.height - (g.top + g.bottom);

      for (var i = 0, l = data.length; i < l; i++) {
        label = data[i].label, value = data[i].value;
        
        y = Math.round((yScale * value));
        x = Math.round(g.left + ((xScale / 2) * i));
        
        // Because the bars stack in the case of multiple datasets, we have to
        // keep track of the total height of each bar.
        if (Object.isUndefined(barTotals[i])) {
          startingY = 0;
          barTotals[i] = y;
        } else {
          startingY = barTotals[i];
          barTotals[i] += y;
        }
        
        barWidth = Math.round((xScale / 2) - opt.bar.gutter);
        
        // Draw the bar.
        R.rect(
          x,
          (g.top + yRange) - y - startingY,
          barWidth,
          y
        ).attr({
          stroke: 'none',
          fill: color
        });
      }
    }
    
    if (this._dataset instanceof Dataset.Multiple) {
      this._dataset.each(plotDataset, this);
    } else {
      plotDataset(this._dataset);
    }
  }
});


Object.extend(Chart.Bar, {
  DEFAULT_OPTIONS: {
    width:  800,
    height: 250,
    bar: {
      color: Colorset.BLUES,
      gutter: 5
    },
    
    fill: {
      color: '#039',
      opacity: 0.3
    },
    
    gutter: {
      top:    20,
      bottom: 20,
      left:   30,
      right:  30
    },
    
    grid: {
      color: '#ddd'
    },
    
    border: {
      color: '#999'
    }
  }
});