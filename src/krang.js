var Krang = {};

//= require "error"

if (!window.Raphael) {
  throw new Krang.Error("Raphaël must be loaded before Krang! (You can download Raphaël at http://raphaeljs.com/)");
}

//= require "util"

//= require "mixins"

//= require "dataset"

//= require "color"

//= require "chart"