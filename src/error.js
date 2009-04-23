Krang.Error = Class.create({
  initialize: function(error) {
    this.error = error;
  },
  
  toString: function() {
    return "Krang error: " + error;
  }
});