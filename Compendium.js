#!/usr/bin/env node

var readline = require('readline');
var fs = require('fs');
var path = require('path');

var comp = null;

Compendium = function(file, code, opts){
	if(opts.no_requires === true){
		this.no_requires = true;
	}

	this.file = file;
	Compendium.exitcode = code;

	this.parse(function(linenum){
		console.log("Found on line: " + linenum);
	});
};

Compendium.prototype.parse = function(callbak){
	var rl = readline.createInterface({
		input: fs.createReadStream(this.file),
		terminal: false
	});
	Compendium.index = 1;
	rl.on('line', function(line){
		var code;
		if(code = line.match(/^\/\/\ \@\@code\=([0-9]+)/)){
			var ecode = parseInt(code[1]);

			if(ecode == Compendium.exitcode){
				callbak(Compendium.index);
			}
		}
		Compendium.index++;
	});
};

Compendium.version = "Compendium v0.1.0-alpha";

var main = function(argv){
	// Remove `node` & `path`
	argv = argv.slice(2);

	var file = null, opts = {}, code;

	for(var i = 0;i < argv.length;i++){
		var arg = argv[i].toString();

		if(!arg.startsWith('-')){
			if(arg.match(/^[A-Za-z\/_0-9\.]+\@[0-9]+$/)){
				if(file != null){
					console.log("Passed more than one files. I can't handle that many!");
					help();
				} else {
					var fpath = arg.match(/([A-Za-z\/_0-9\.]+)\@[0-9]+/)[1];
					console.log("Compendium: Using file: " + fpath);
					var exit = arg.match(/[A-Za-z\/_0-9\.]+\@([0-9]+)/)[1];
					console.log("Compendium: Using exit code: " + exit);

					file = fpath;
					code = exit;

					if(!path.isAbsolute(file)){
						file = path.resolve(__dirname, file);
					}

					try {
						var acc = fs.accessSync(file);
					} catch(err){
						console.log
					} finally {}
				}
			} else {
				console.log("Bad parameter:" + arg);
				help();
			}
		} else {
			switch(arg){
				case "--version":
				case "-v":
					console.log("Version: " + Compendium.version);
					process.exit(0);
				case "--help":
				case "-h":
					help();
				default:
					console.log("Compendium: Unknown argument => " + arg);
					help();
			}
		}
	}

	if(file == null){
		console.log("Compendium: No file specified");
		help();
	}

	var comp = new Compendium(file, code, opts);
};

var help = function(){
	console.log("");
	console.log("Usage: " + path.basename(process.argv[1], ".js") + " [--version|-v] [--help|-h] \x1b[4mfile\x1b[0m@\x1b[4mexitcode\x1b[0m")
	console.log("")
	console.log("Options:");
	console.log("  -v, --version\t\tPrint version and exit");
	console.log("  -h, --help\t\tPrint this help & exit");
	console.log("");

	process.exit(0);
};

main(process.argv);
