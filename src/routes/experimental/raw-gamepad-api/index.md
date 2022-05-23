${meta({
	title: "Raw Gamepad API Test"
})}

This page is just a test of the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad), and a dumping ground for my notes of the raw API.

The test code is very straightforward, and is just intended as a reference to help me see what the data out of the API looks like and therefore how to consume it at a raw level. It's essentially this:

```js
JSON.stringify(
	[...navigator.getGamepads()]
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
	})),
	null,
	2
);
```

([source](https://github.com/svidgen/thepointless.com/tree/master/src/routes/experimental/raw-gamepad-api/index.js))

It runs on a [loop](https://github.com/svidgen/www.thepointless.com/blob/master/src/lib/loop.js) so I can see gamepad activity in realtime. And I must say, there's something satisfying about just seeing gamepad updated in realtime on a web page, even if it's not doing anything "meaningful" yet.

A few notable points:
1. The key mappings on a <i>same</i> controller differ on Windows/ChromeOS
2. The d-pad on ChromeOS register as a set of axes; as buttons on Windows
3. The L/R rudders on ChromeOS also register as axes; as buttons with values on Windows
4. Rumble strength and responsiveness is highly dependent on the OS and/or mobility. (My Pixelbook rumble's the controller very sluggishly as compared to my desktop running Windows.)
5. The joystick axes are not reliably calibrated to \`0\`. They consistently hover around 1% off center, and can sometimes be seen sitting idly around 5% off center.
6. ChromeOS appears to merge rumble magnitudes in some way, whereas Windows simply gives precende to the "weak" (fast) rumble.
7. The returned Gamepad objects aren't "live", so you need to call [\`navigator.getGamepads()\`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getGamepads) on a loop to watch for updates.

Some mappings appear consistent enough to depend on them out of the gate, such as the left joystick and A, B, X, Y buttons. I'll likely just **assume** these mappings are correct as I build out functional experiments and sample games. And when I need more buttons, I'll have to experiment between a few different browsers and physical devices to check for consistency.

It *probably* goes without saying, but the Gamepad API is pretty raw &mdash; in that the interface doesn't provide much "semantic help". You get \`axes\` data, \`buttons\` data, and the distinction between the two isn't even always consistent. (Point #3) There's also no event-based interface that I can see. And with the joysticks not being very well calibrated to the zero position, I'll need to build a good abstraction layer.

I'm sure there are already good abstraction libraries out there. And I *may* poke around for one. But, getting something simple off the ground seems reasonably tractible, and I usually opt to "roll my own" for tractible problems, rather than take on a dependency. But, we'll see. 🤷 ... As a general rule, I enjoy writing my own abstractions about a thousand times more than I enjoy learning and managing dependencies.

<div>
	<tpdc:subscribe></tpdc:subscribe>
	<tpdc:gamepadtest></tpdc:gamepadtest>
</div>

If data shows an empty array (\`[]\`) and you have a gamepad plugged in, *press one of its buttons!*

<script src='index.js'></script>