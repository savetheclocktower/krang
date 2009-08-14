/**
 *  class Dataset.Array < Dataset.Base
**/
Dataset.Array = Class.create(Dataset.Base, {
  /**
   *  new Dataset.Array(array)
  **/
  initialize: function($super, name, array) {
    $super(name);
    
    array.each( function(pair) {
      this.labels.push(pair[0]);
      this.values.push(pair[1]);
    }, this);
  }
});
