var Krang = {
  VERSION: '0.0.1',
  PROTOTYPE_VERSION: '>= 1.6.1',
  
  $debug: false
};

//= require "error"

if (!window.Raphael) {
  throw new Krang.Error("Raphaël must be loaded before Krang! (You can download Raphaël at http://raphaeljs.com/)");
}

//= require "util"
//= require "mixins"
//= require "dataset"
//= require "color"
//= require "text"
//= require "ordered_hash"
//= require "layer_set"

//= require "chart"