
/**
 *  class Dataset.Table < Dataset.Base
 *  includes Krang.Mixin.Configurable
 *  
 *  A dataset that draws its labels and values from an HTML table somewhere
 *  on the page.
**/
Dataset.Table = Class.create(Dataset.Base, Krang.Mixin.Configurable, {
  /**
   *  new Dataset.Table(name, element[, options])
   *  - name (String): The name of the dataset. Will be used to represent
   *    the dataset in the chart (e.g., in a legend).
   *  - element (Element): The `TABLE` element (as a DOM node).
   *  - options (Object): An optional set of options.
   *  
   *  Instantiate the dataset.
  **/
  initialize: function($super, name, element, options) {
    $super(name);
    this.element = $(element);
    this.setOptions(options);
    var opt = this.options;
    
    if (opt.hideTable) this.element.hide();
    
    this.labels = this.element.select(opt.labels).map( function(node) {
      return opt.labelFilter(node.innerHTML);
    });
    this.values = this.element.select(opt.values).map( function(node) {
      return opt.valueFilter(node.innerHTML);
    });    
  }
});


Object.extend(Dataset.Table, {
  /**
   *  Dataset.Table.DEFAULT_OPTIONS = Object
  **/
  DEFAULT_OPTIONS: {
    hideTable: true,
    
    labels: 'tbody > tr > td:first-child',
    values: 'tbody > tr > td:last-child',
    
    labelFilter: function(text) {
      return text.strip();
    },
    valueFilter: function(text) {
      return Number(text.strip());
    }
  }
});