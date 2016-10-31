#!/usr/local/bin/lycheejs-helper env:node


const _fs   = require('fs');
const _path = require('path');
const _ROOT = _path.resolve(__dirname, '../');


if (_fs.existsSync(_ROOT + '/libraries/lychee/build/node/core.js') === false) {
	require(_ROOT + '/bin/configure.js');
}


const lychee = require(_ROOT + '/libraries/lychee/build/node/core.js')(_ROOT);



/*
 * USAGE
 */

const _print_help = function() {

	let libraries = _fs.readdirSync(_ROOT + '/libraries').sort().filter(function(value) {
		return _fs.existsSync(_ROOT + '/libraries/' + value + '/lychee.pkg');
	}).map(function(value) {
		return '/libraries/' + value;
	});

	let projects = _fs.readdirSync(_ROOT + '/projects').sort().filter(function(value) {
		return _fs.existsSync(_ROOT + '/projects/' + value + '/lychee.pkg');
	}).map(function(value) {
		return '/projects/' + value;
	});


	console.log('                                                   ');
	console.info('lychee.js ' + lychee.VERSION + ' Breeder');
	console.log('                                                   ');
	console.log('Usage: lycheejs-breeder [Action] [Library/Project] ');
	console.log('                                                   ');
	console.log('                                                   ');
	console.log('Available Actions:                                 ');
	console.log('                                                   ');
	console.log('    init, fork, pull, push                         ');
	console.log('                                                   ');
	console.log('Available Libraries:                                ');
	console.log('                                                    ');
	libraries.forEach(function(library) {
		let diff = ('                                                ').substr(library.length);
		console.log('    ' + library + diff);
	});
	console.log('                                                    ');
	console.log('Available Projects:                                 ');
	console.log('                                                    ');
	projects.forEach(function(project) {
		let diff = ('                                                ').substr(project.length);
		console.log('    ' + project + diff);
	});
	console.log('                                                   ');
	console.log('Examples:                                          ');
	console.log('                                                   ');
	console.log('    cd /projects/my-project;                       ');
	console.log('                                                   ');
	console.log('    # Use either init or fork to start             ');
	console.log('    lycheejs-breeder init;                         ');
	console.log('    lycheejs-breeder fork /projects/boilerplate;   ');
	console.log('                                                   ');
	console.log('    lycheejs-breeder pull /libraries/harvester;    ');
	console.log('    lycheejs-breeder push;                         ');
	console.log('                                                   ');

};

const _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');

	let environment = new lychee.Environment({
		id:      'breeder',
		debug:   false,
		sandbox: false,
		build:   'breeder.Main',
		timeout: 1000,
		packages: [
			new lychee.Package('lychee',     '/libraries/lychee/lychee.pkg'),
			new lychee.Package('fertilizer', '/libraries/fertilizer/lychee.pkg'),
			new lychee.Package('breeder',    '/libraries/breeder/lychee.pkg')
		],
		tags:     {
			platform: [ 'node' ]
		}
	});


	lychee.setEnvironment(environment);


	environment.init(function(sandbox) {

		if (sandbox !== null) {

			let lychee     = sandbox.lychee;
			let breeder    = sandbox.breeder;
			let fertilizer = sandbox.fertilizer;


			// Show less debug messages
			lychee.debug = true;


			// This allows using #MAIN in JSON files
			sandbox.MAIN = new breeder.Main(settings);

			sandbox.MAIN.bind('destroy', function() {
				process.exit(0);
			});

			sandbox.MAIN.init();


			process.on('SIGHUP',  function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGINT',  function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGQUIT', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGABRT', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGTERM', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('error',   function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('exit',    function() {});


			new lychee.Input({
				key:         true,
				keymodifier: true
			}).bind('escape', function() {

				console.warn('breeder: [ESC] pressed, exiting ...');
				sandbox.MAIN.destroy();

			}, this);

		} else {

			console.error('BOOTUP FAILURE');

			process.exit(1);

		}

	});

};



const _SETTINGS = (function() {

	let args     = process.argv.slice(2).filter(val => val !== '');
	let settings = {
		action:   null,
		project:  null,
		library:  null
	};


	let action       = args.find(val => /^(init|fork|pull|push)/g.test(val));
	let library      = args.find(val => /^\/(libraries|projects)\/([A-Za-z0-9-_\/]+)$/g.test(val));
	let project      = args.find(val => /--project=\/(libraries|projects)\/([A-Za-z0-9-_\/]+)/g.test(val));
	let debug_flag   = args.find(val => /--([debug]{5})/g.test(val));
	let sandbox_flag = args.find(val => /--([sandbox]{7})/g.test(val));


	if (project !== undefined) {

		let tmp = project.substr(10);
		if (tmp.indexOf('.') === -1) {

			try {

				let stat1 = _fs.lstatSync(_ROOT + tmp);
				if (stat1.isDirectory()) {
					settings.project = tmp;
				}

			} catch(e) {

				settings.project = null;

			}

		}

	}


	if (action === 'pull' || action === 'fork') {

		if (library !== undefined) {

			settings.action = action;


			try {

				let stat1 = _fs.lstatSync(_ROOT + library);
				let stat2 = _fs.lstatSync(_ROOT + library + '/lychee.pkg');
				if (stat1.isDirectory() && stat2.isFile()) {
					settings.library = library;
				}

			} catch(e) {

				settings.library = null;

			}

		}

	} else if (action !== undefined) {

		settings.action = action;

	}


	return settings;

})();



(function(settings) {

	/*
	 * IMPLEMENTATION
	 */

	let action      = settings.action;
	let has_project = settings.project !== null;
	let has_library = settings.library !== null;


	if (action === 'init' && has_project) {

		_bootup({
			action:  'init',
			project: settings.project
		});


	} else if (action === 'fork' && has_project && has_library) {

		_bootup({
			action:  'fork',
			project: settings.project,
			library: settings.library
		});

	} else if (action === 'pull' && has_project && has_library) {

		_bootup({
			action:  'pull',
			project: settings.project,
			library: settings.library
		});

	} else if (action === 'push' && has_project) {

		_bootup({
			action:  'push',
			project: settings.project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

