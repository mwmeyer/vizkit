# vizkit

vizkit.js is an opinionated little charting library built on top of the amazing and wonderful d3.js visualization framework. For examples of some of the charts currently available, have a gander at the documentaion.

## Contributing

To hack on an individual chart type, add a new .js file to the src directory (or use an exisiting one), ensure it is included in the src list in the Makefile and then run:

```shell
$ make clean
$ make vizkit.js
```

This will generate a new file with your additions. Pull requests are welcome!