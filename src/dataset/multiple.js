

Dataset.Multiple = Class.create(Dataset.Base, Enumerable, {
  initialize: function($super) {
    $super();
    
    var args = $A(arguments);
    args.shift();
    
    this._datasets = args;
  },
  
  _each: function(iterator) {
    return this._datasets._each(iterator);
  },
  
  dataLength: function() {
    var lengths = this.map( function(set) { return set.dataLength(); });
    return Math.min.apply(Math, lengths);
  },
  
  maxValue: function() {
    var maxes = this.map( function(set) { return set.maxValue(); });
    return Math.max.apply(Math, maxes);
  }
});