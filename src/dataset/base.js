var Dataset = {};

Dataset.Base = Class.create({
  initialize: function(labels, values) {
    this.labels = labels || [];
    this.values = values || [];
  },
  
  toArray: function() {
    var result = [];
    for (var i = 0; i < this.labels.length; i++) {
      result.push({ label: this.labels[i], value: this.values[i] });
    }
     
    return result;
  },
  
  dataLength: function() {
    return this.labels.length;
  },
  
  maxValue: function() {
    return Math.max.apply(Math, this.values);
  }  
});