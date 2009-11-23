# Krang

(A charting library built on [Prototype](http://prototypejs.org) and [Raphaël](http://raphaeljs.com))

## About

Krang wraps around the excellent Raphaël library (a JavaScript vector drawing library using SVG/VML) and handles the ugly details of drawing charts. Supply a dataset, pick a chart type, and you're good to go.

Krang differs from other drawing libraries in a few important ways:

  * Unlike `canvas` solutions, Krang draws vectors. The individual regions
    of an SVG/VML graph can respond to events in ways that `canvas` cannot.
    Your charts can be interactive.
    
  * Unlike Flash solutions, Krang draws charts that can be viewed on the
    iPhone.
    
  * Unlike [g.raphaël](http://github.com/DmitryBaranovskiy/g.raphael) and
    [ico](http://github.com/Kilian/ico), Krang is built upon Prototype, and
    therefore is architected in a way that will be familiar to users of the
    library.

## Status

Krang is in late-alpha, early-beta stage. It has been used on a couple different public-facing web sites without issue. I don't yet consider it feature-complete, so if there's something you want it to do, please let me know.

## Documentation

The beginnings of [PDoc](http://pdoc.org) documentation exist in the source files, and I've tried my best to add comments where the code itself is not self-explanatory. Also, look in `test/functional` for demonstrations of different chart types.

## License

Just like its dependencies — Prototype and Raphaël — Krang carries the [MIT License](http://www.opensource.org/licenses/mit-license.php).