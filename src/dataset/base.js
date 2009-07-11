var Dataset = {};

/**
 *  class Dataset.Base
**/

Dataset.Base = Class.create({
  /**
   *  new Dataset.Base(labels, values)
  **/
  initialize: function(labels, values) {
    this.labels = labels || [];
    this.values = values || [];
  },
  
  /**
   *  Dataset.Base#toArray() -> Array
  **/
  toArray: function() {
    var result = [];
    for (var i = 0; i < this.labels.length; i++) {
      result.push({ label: this.labels[i], value: this.values[i] });
    }
     
    return result;
  },
  
  /**
   *  Dataset.Base#dataLength() -> Number
  **/
  dataLength: function() {
    return this.labels.length;
  },
  
  /**
   *  Dataset.Base#maxValue() -> Number
  **/
  maxValue: function() {
    return Math.max.apply(Math, this.values);
  },
  
  /**
   *  Dataset.Base#reverse() -> this
  **/
  reverse: function() {
    this.labels = this.labels.reverse();
    this.values = this.values.reverse();
    
    return this;
  }  
});