
lychee.define('strainer.Main').requires([
	'lychee.Input',
	'strainer.Template'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _lychee   = lychee.import('lychee');
	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Input    = lychee.import('lychee.Input');
	const _Template = lychee.import('breeder.Template');



	/*
	 * FEATURE DETECTION
	 */

	let _DEFAULTS = {

		action:  null,
		project: null

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.settings = _lychee.assignunlink({}, _DEFAULTS, settings);
		this.defaults = _lychee.assignunlink({}, this.settings);


		_Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let action  = this.settings.action  || null;
			let project = this.settings.project || null;

			if (action !== null && project !== null) {

				lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
				lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;


				this.trigger('init', [ project, action ]);

			} else {

				console.error('strainer: FAILURE ("' + project + '") at "load" event');


				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function(project, action) {

			let template = new _Template({
				sandbox:  project,
				settings: this.settings
			});


			if (action === 'stash') {

				template.then('read');
				template.then('read-fix');
				template.then('read-api');
//				template.then('stash');
//				template.then('stash-fix');
//				template.then('stash-api');
				template.then('write');

			}


			template.bind('complete', function() {

				if (lychee.debug === true) {
					console.info('strainer: SUCCESS ("' + project + '")');
				}

				this.destroy(0);

			}, this);

			template.bind('error', function(event) {

				if (lychee.debug === true) {
					console.error('strainer: FAILURE ("' + project + '") at "' + event + '" template event');
				}

				this.destroy(1);

			}, this);


			template.init();


			return true;

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'strainer.Main';


			let settings = _lychee.assignunlink({}, this.settings);
			let blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');

		},

		destroy: function(code) {

			code = typeof code === 'number' ? code : 0;


			this.trigger('destroy', [ code ]);

		}

	};


	return Composite;

});

