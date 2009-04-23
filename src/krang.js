var Krang = {};

//= require "error"

if (!window.Raphael) {
  throw new Krang.Error("Raphaël must be loaded before Krang! (You can download Raphaël at http://raphaeljs.com/)");
}

//= require "mixins"

//= require "dataset"

//= require "colorset"

//= require "chart"