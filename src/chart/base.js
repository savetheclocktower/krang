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
    this._layerSet = new Krang.LayerSet();
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
  }
});

