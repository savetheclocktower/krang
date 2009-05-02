Chart.Base = Class.create(Krang.Mixin.Configurable, {
  initialize: function(canvas) {
    this.canvas = $(canvas);
    this._datasets = [];
  },
  
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
  
  removeDataset: function() {
    var datasets = $A(arguments);
    datasets.each( function(dataset) {
      this._datasets = this._datasets.without(dataset);
    }, this);
  },
  
  clearDatasets: function() {
    this._datasets = [];
  },
  
  draw: function() {
    throw "Implement in subclass.";
  }
});

