/**
 *  class Chart.Area < Chart.Base
 *  
 *  An abstract class containing common logic for line and bar charts.
**/

Chart.Area = Class.create(Chart.Base, {  
  _drawGrid: function() {
    var opt = this.options, R = this.R, g = opt.gutter;        
    var og = opt.grid, v = og.vertical, h = og.horizontal;
       
    var columns = v.enabled ? v.lines : 0;
    var rows    = h.enabled ? h.lines : 0;
    
    // Do a separate background fill before creating the grid.
    R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({ fill: og.backgroundColor });    
    
    // Background grid.
    R.drawGrid(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top  + g.bottom),
      columns,
      rows,
      og.color
    );
    
    // Outer frame.
    this._frame = R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top  + g.bottom)
    ).attr({
      'stroke':       opt.border.color,
      'stroke-width': opt.border.width
    });    
  }
});

Object.extend(Chart.Area, {
  DEFAULT_OPTIONS: {
    /* 
     *  How much space to leave around the chart itself. There are non-zero
     *  defaults here to leave room for axis labels.
     */ 
    gutter: {
      top:    20,
      bottom: 30,
      left:   100,
      right:  30
    },
    
    /* The chart's grid. */
    grid: {               
      color: '#eee',      /* Color of the gridlines. */
      backgroundColor: '#fff',
      
      horizontal: {
        enabled: true,    /* Whether to draw horizontal gridlines. */
        lines: 10
      },
      
      vertical: {
        enabled: false,   /* Whether to draw vertical gridlines. */
        lines: 0
      },
      
      /* Callbacks that format the labels for display. */
      labelX: Prototype.K,  
      labelY: function(value) {
        return value.toFixed(1);
      }, 
      
      /* 
       * If set to 'auto', will determine a good max value based on the 
       * scale of the chart. Otherwise one can specify a max value to use.
       */ 
      maxY: 'auto'
    },
    
    /* Border around the chart itself. */    
    border: {           
      color: '#bbb',
      width: 1
    }    
  }
});
