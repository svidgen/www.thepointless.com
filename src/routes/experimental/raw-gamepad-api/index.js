const { DomClass } = require('wirejs-dom');

const { MainLoop } = require('/src/lib/loop');

const markup = `<tpdc:gamepadtest>
	<h3>Gamepad data</h3>
	<pre data-id='data'></pre>
</tpdc:gamepadtest>`;

const GamepadTest = DomClass(markup, function _GamepadTest() {
	const self = this;

	let pads = [];

	MainLoop.addObject({
		step() {
			pads = [...navigator.getGamepads()]
				.filter(p => p)
				.map(pad => ({
					index: pad.index,
					id: pad.id,
					mapping: pad.mapping,
					axes: pad.axes,
					buttons: [...pad.buttons].map(b => ({
						pressed: b.pressed,
						touched: b.touched,
						value: b.value
					})),
					vibrationActuator: pad.vibrationActuator
				}))
			;
		},
		draw() {
			self.data = `updated: ${new Date()}\n${
				JSON.stringify(pads, null, 2)
			}`;
			if (pads.length > 0) {
				const p0 = pads[0];
				if (p0.buttons[2].pressed) {
					p0.vibrationActuator.playEffect('dual-rumble', {
						startDelay: 0,
						duration: 100,
						weakMagnitude: 0.0,
						strongMagnitude: 1.0,
					});
				}
				if (p0.buttons[3].pressed) {
					p0.vibrationActuator.playEffect('dual-rumble', {
						startDelay: 0,
						duration: 100,
						weakMagnitude: 1.0,
						strongMagnitude: 0.0,
					});
				}
			}
		}
	});
});

module.exports = GamepadTest;
