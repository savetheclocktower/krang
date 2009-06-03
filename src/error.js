/** section: krang
 * class Krang.Error < Error
**/

Krang.Error = function(message) {
  this._message = message;
};

Krang.Error.prototype = new Error();

Krang.Error.prototype.toString = function() {
  return "Krang error: " + this._message;
};