console.log('Bin Pack Test!');

var ThreeDimensionBinPack = require('./index.js')();

var bin = new ThreeDimensionBinPack.Bin(10, 9, 11); // dimensions of bin

bin.addPackage(2,4,8);
bin.addPackage(2,4,8);
bin.addPackage(2,4,8);
bin.addPackage(2,4,8);
bin.addPackage(2,4,8);
bin.addPackage(2,4,8);
bin.addPackage(2,2,10);
bin.addPackage(2,2,10);
bin.addPackage(2,2,10);
bin.addPackage(2,2,10);
bin.addPackage(2,2,10);
bin.addPackage(2,2,10);

bin.doesFit(function(packagesFitInsideBin){
    console.log('does it fit? '+packagesFitInsideBin);
});