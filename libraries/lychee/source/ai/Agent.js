
lychee.define('lychee.ai.Agent').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _validate_brain = function(brain) {

		if (brain instanceof Object) {

			if (
				typeof brain.update === 'function'
				&& typeof brain.setControls === 'function'
				&& typeof brain.setSensors === 'function'
			) {

				return true;

			}

		}


		return false;

	};

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {
			return true;
		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.brain    = null;
		this.controls = [];
		this.entity   = null;
		this.fitness  = 0;
		this.sensors  = [];

		this.__training  = null;
		this.__trainings = [];


		this.setBrain(settings.brain);
		this.setControls(settings.controls);
		this.setEntity(settings.entity);
		this.setFitness(settings.fitness);
		this.setSensors(settings.sensors);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let brain = lychee.deserialize(blob.brain);
			if (brain !== null) {
				this.setBrain(brain);
			}

			let entity = lychee.deserialize(blob.entity);
			if (entity !== null) {
				this.setEntity(entity);
			}


			if (blob.controls instanceof Array) {
				this.controls = blob.controls.map(lychee.deserialize);
			}

			if (blob.sensors instanceof Array) {
				this.sensors = blob.sensors.map(lychee.deserialize);
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.fitness !== 0) settings.fitness = this.fitness;


			if (this.brain !== null)      blob.brain    = lychee.serialize(this.brain);
			if (this.controls.length > 0) blob.controls = this.controls.map(lychee.serialize);
			if (this.entity !== null)     blob.entity   = lychee.serialize(this.entity);
			if (this.sensors.length > 0)  blob.sensors  = this.sensors.map(lychee.serialize);


			return {
				'constructor': 'lychee.ai.Agent',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		update: function(clock, delta) {

			let brain = this.brain;
			if (brain !== null) {
				this.__training = brain.update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		crossover: function(agent) {

			agent = agent instanceof Composite ? agent : null;


			if (agent !== null) {

				// XXX: This is implemented by AI Agents

				return [ this, agent ];

			}


			return null;

		},

		mutate: function() {

			// XXX: This is implemented by AI Agents

		},

		reward: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			this.fitness += diff;


			let training = this.__training;
			if (training !== null) {

				training.iterations = diff;
				this.__trainings.push(training);

				let brain = this.brain;
				if (brain !== null) {
					brain.train(training);
				}

			}

		},

		punish: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			this.fitness -= diff;

		},

		setBrain: function(brain) {

			brain = _validate_brain(brain) === true ? brain : null;


			if (brain !== null) {

				this.brain = brain;

				return true;

			}


			return false;

		},

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				this.controls = controls.filter(function(control) {
					return control instanceof Object;
				});

				this.controls.forEach(function(control) {
					control.setEntity(this.entity);
				}.bind(this));


				let brain = this.brain;
				if (brain !== null) {
					brain.setControls(this.controls);
				}


				return true;

			}


			return false;

		},

		setEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				this.entity = entity;


				this.controls.forEach(function(control) {
					control.setEntity(this.entity);
				}.bind(this));

				this.sensors.forEach(function(sensor) {
					sensor.setEntity(this.entity);
				}.bind(this));


				return true;

			}


			return false;

		},

		setFitness: function(fitness) {

			fitness = typeof fitness === 'number' ? (fitness | 0) : null;


			if (fitness !== null) {

				this.fitness = fitness;

				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors : null;


			if (sensors !== null) {

				this.sensors = sensors.filter(function(sensor) {
					return sensor instanceof Object;
				});

				this.sensors.forEach(function(sensor) {
					sensor.setEntity(this.entity);
				}.bind(this));


				let brain = this.brain;
				if (brain !== null) {
					brain.setSensors(this.sensors);
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

