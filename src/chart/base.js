/**
 *  class Chart.Base
 *  includes Krang.Mixin.Configurable
**/

Chart.Base = Class.create(Krang.Mixin.Configurable, {
  /**
   *  new Chart.Base(canvas)
  **/
  initialize: function(canvas) {
    this.canvas = $(canvas);
    this._datasets = [];
    
    // For keeping track of the active dataset.
    this._activeDataset = null;
    
    // For holding all the different shape layers of the chart.
    this._layerSet = new Krang.LayerSet();    
    this._drawn = false;
    
    // For associating datasets with colors on a graph.
    this._colors = {};
  },
  
  /**
   *  Chart.Base#addDataset(datasets...) -> this
  **/
  addDataset: function() {
    var datasets = $A(arguments);
    
    datasets.each( function(dataset) {
      if (dataset instanceof Dataset.Base) {
        this._datasets.push(dataset);
      } else {
        throw new Krang.Error("Dataset must inherit from a Dataset class!");
      }
    }, this);
    
    return this;
  },
  
  /**
   *  Chart.Base#removeDataset(datasets...) -> this
  **/
  removeDataset: function() {
    var datasets = $A(arguments);
    datasets.each( function(dataset) {
      this._datasets = this._datasets.without(dataset);
    }, this);
    return this;
  },
  
  /**
   *  Chart.Base#clearDatasets() -> this
  **/
  clearDatasets: function() {
    this._datasets = [];
    return this;
  },
  
  draw: function() {
    throw "Implement in subclass.";
  },
  
  clear: function() {
    if (this.R) this.R.clear();
    if (this._layerSet) {
      var keys = this._layerSet.keys();
      keys.each( function(k) { this._layerSet.unset(k) }, this);
    }
  },
  
  showLayer: function(key) {
    var layer = this._layerSet.get(key);
    if (!layer) {
      throw new Krang.Error("No such layer!");
    }
    
    layer.show();
  },
  
  hideLayer: function(key) {
    var layer = this._layerSet.get(key);
    if (!layer) {
      throw new Krang.Error("No such layer!");
    }
    
    layer.hide();
  },
  
  setActiveDataset: function(dataset, shouldAnimate) {
    shouldAnimate = shouldAnimate || true;
    
    // Figure out which dataset is meant. It can be referenced by index or by
    // name — or it could be the actual dataset.
    if (Object.isNumber(dataset)) {
      dataset = this._datasets[dataset];
    }
    
    if (Object.isString(dataset)) {
      dataset = this._datasets.detect( function(d) {
        return d.name === dataset;
      });
    }
    
    if (shouldAnimate) {
      this._animateDataset(dataset);
    } else {
      this._activeDataset = dataset;
      this.draw();
    }
  },
  
  getActiveDataset: function() {
    return this._activeDataset || this._datasets.first();
  },
  
  _animateDataset: function(dataset) {
    throw "Implement in subclass.";
  }
});

Object.extend(Chart.Base, {
  DEFAULT_OPTIONS: {
    data: {
      mode: 'single'
    },
    
    animate: {
      duration: 0.5,
      easing:   'linear'
    }
  }
});