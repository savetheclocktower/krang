var Colorset = Class.create({
  initialize: function() {
    this._colors = $A(arguments);
    this._index  = 0;
  },
  
  next: function() {
    if (this._index === this._colors.length)
      this._index = 0;
      
    return this._colors[this._index++];
  }
});

Colorset.Default = Class.create({
  initialize: Prototype.emptyFunction,
  next: function() {
    return Raphael.getColor(0.7);
  }
});


Colorset.BLUES = new Colorset(
  "#003",
  "#03A",
  "#009",
  "#036",
  "#039",
  "#006"
);



Colorset.interpret = function(value) {
  return (typeof value === 'object') ? value.next() : value;
};