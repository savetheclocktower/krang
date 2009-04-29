Chart.Base = Class.create(Krang.Mixin.Configurable, {
  initialize: function(canvas) {
    this.canvas = $(canvas);
  },
  
  addDataset: function(dataset) {
    if (dataset instanceof Dataset.Base) {
      this._dataset = dataset;
    } else {
      throw new Krang.Error("Dataset must inherit from class Dataset!");
    }
    
    return this;
  },
  
  draw: function() {
    throw "Implement in subclass.";
  }
});

