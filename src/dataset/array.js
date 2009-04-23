
Dataset.Array = Class.create(Dataset.Base, {
  initialize: function($super, array) {
    $super();
    
    array.each( function(pair) {
      this.labels.push(pair[0]);
      this.values.push(pair[1]);
    }, this);
  }
});
