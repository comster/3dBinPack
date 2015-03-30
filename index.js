(exports = module.exports = function(){
    
    var spawn = require('child_process').spawn;
    var fs = require('fs');
    
    var ThreeDimensionBinPack = {};
    
    ThreeDimensionBinPack.Bin = function(h,w,d) {
        this.packages = [];
        this.initialize.apply(this, arguments);
    }
    ThreeDimensionBinPack.Bin.prototype.initialize = function(h,w,d) {
        this.setDimensions(h,w,d);
    }
    
    ThreeDimensionBinPack.Bin.prototype.setDimensions = function(h,w,d) {
        if(h) {
            this.dimH = h;
        }
        if(w) {
            this.dimW = w;
        }
        if(d) {
            this.dimD = d;
        }
    }
    
    ThreeDimensionBinPack.Bin.prototype.addPackage = function(h,w,d) {
        this.packages.push([h,w,d]);
    }
    
    ThreeDimensionBinPack.Bin.prototype.doesFit = function(callback) {
        this.runCalc(function(result){
            console.log(result);
            callback(result.TotalBoxes === result.PackedBoxes);
        });
    }
    
    var normalizeNum = function(n) {
        return Math.floor(n * 1000);
    }
    
    ThreeDimensionBinPack.Bin.prototype.getBoxFileStr = function() {
        var str = '';
        
        str = normalizeNum(this.dimH) + ', ' + normalizeNum(this.dimW) + ', ' + normalizeNum(this.dimD); // container
        // console.log(this.packages)
        for(var p in this.packages) {
            var pack = this.packages[p];
            str = str + '\n' + (parseInt(p, 10)+1) + '. ' + normalizeNum(pack[0]) + ', ' + normalizeNum(pack[1]) + ', ' + normalizeNum(pack[2]) +', 1';
        }
        str = str + '\n';
        // EXAMPLE OUTPUT
        // 104, 96, 84
        // 1. 70, 104, 24, 4
        // 2. 14, 104, 48, 2
        // 3. 40, 52, 36, 3
        
        return str;
    }
    
    ThreeDimensionBinPack.Bin.prototype.parseOutput = function(output) {
        var parsed = {};
        
        var lines = output.split('\n');
        // console.log(lines)
        
        for(var l in lines) {
            var line = lines[l];
            var lineCols = line.split(':');
            // console.log(lineCols)
            
            if(lineCols.length > 1) {
                var f = lineCols[0].trim();
                parsed[f] = lineCols[1].trim();
                
                if(f === 'TOTAL NUMBER OF BOXES') {
                    parsed['TotalBoxes'] = parseInt(parsed[f], 10);
                } else if(f === 'PACKED NUMBER OF BOXES') {
                    parsed['PackedBoxes'] = parseInt(parsed[f], 10);
                } else if(f === 'TOTAL VOLUME OF ALL BOXES') {
                    parsed['TotalVolume'] = parseInt(parsed[f], 10);
                } else if(f === 'PALLET VOLUME') {
                    parsed['BinVolume'] = parseInt(parsed[f], 10);
                }
            }
        }
        
        return parsed;
    }
    
    ThreeDimensionBinPack.Bin.prototype.runCalc = function(callback) {
        var self = this;
        var boxFile = '/tmp/box.txt';
        var boxFileStr = this.getBoxFileStr();
        fs.writeFileSync(boxFile, boxFileStr);
        
        var runOutput = '';
        
        // console.log('write to tmp file: '+boxFile);
        
        var spawnBoxologic = spawn("boxologic", ["-f", boxFile]);
        spawnBoxologic.stdout.on("data", function(data) {
            // console.log('out');
            runOutput = runOutput + data.toString();
        });
        spawnBoxologic.stderr.on("data", function(data) {
            console.log("stderr: " + data);
            console.dir(data);
            // runOutput = runOutput + data;
        });
        spawnBoxologic.on("close", function(code) {
            // console.log("spawnBoxologic exited with code " + code);
            if(code == 0) {
                // fs.rmdirSync(path+'/apps');
                // fs.symlinkSync('/usr/lib/node_modules/house/lib/endPoints/', path+'/endPoints');
                // fs.symlinkSync('/usr/lib/node_modules/house/apps/', path+'/apps');
                
                // console.log(runOutput);
                var parsedOutput = self.parseOutput(runOutput);
                // console.log(parsedOutput);
                
                callback(parsedOutput);
            } else {
                console.log('err with spawnBoxologic');
            }
        });
    }
    
    return ThreeDimensionBinPack;
});