
var Dataset = {
  UID: 1,
  
  /**
   *  Dataset.identify(dataset) -> Number
   *  - dataset (Dataset.Base): Any dataset.
  **/
  identify: function(dataset) {
    dataset._uid = Dataset.UID++;
    return dataset._uid;
  }
};



//= require "dataset/base"
//= require "dataset/array"
//= require "dataset/table"
