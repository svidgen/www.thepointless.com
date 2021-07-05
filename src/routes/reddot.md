<?php
	$meta_title = "the red dot";
?>

<script>
var lines = [
	"This is my red dot. It doesn't do anything if you click on it.",
	"Really, you can click on my red dot all you want. It won't do a thing.",
	"See what I mean? It didn't do anything did it? Try again.",
	"In doing nothing, my red dot is a great success. It'll <b>never</b> do a thing. Don't you believe me?",
	"You seem to want to think this red dot is here to entertain you.",
	"It's not.",
	"Alright dot-clicker, you keep trying.",
	"You really think it's going to do something for you.",
	"Fine.",
	"As long as you think (wrongly) that something is going to come of this, let's try working on your technique.",
	"Maybe you're clicking too quickly. Try slower.",
	"No dice? Hmm ... try again.",
	"Maybe if you tried clicking it faster?",
	"No dice again, eh?",
	"Maybe if you sweet-talked it for awhile.",
	"I said <b>sweet-talk</b> it.",
	"The mighty red dot isn't going to change its very purpose without some <b>serious</b> sweet-talking.",
	"OK. Looks like a bad solution for you. Try something else.",
	"I don't know what you tried, but if <b>I</b> don't even notice, the dot's not going to.",
	"How about you go pretty yourself up. Maybe the dot thinks you're ugly.",
	"Not quite up to par. Try again.",
	"OK--Time for drastic measures.",
	"Go away for a minute while I try to talk the red dot into doing something for you.",
	"Bloody hell! That wasn't nearly enough time. Go away again, and this time, give me some bloody time!",
	"... Sorry. The dot didn't appreciate your interruption the first time. It's mad at you. Better say you're sorry.",
	"It doesn't think you were sincere.",
	"The red dot's not doing a thing unless you're really sorry.",
	"You don't sound too convincing.",
	"Fine.",
	"The dot is giving you the benefit of the doubt.",
	"You still can't expect it to just change its nature to do nothing for you.",
	"Maybe if you click a little lower you'll find a ticklish spot.",
	"Not that low, pervert.",
	"No no! To the right!",
	"You don't seem to get it. Try again.",
	"Nope. Try again.",
	"Bloody hell! What kind of dolt doesn't know where dots are ticklish!?",
	"Click!",
	"CLICK!",
	"c l i c k !",
	"Yeah, that's right. I'm making fun of you.",
	"Look at yourself--sitting at a computer clicking on a damn dot, knowing very well it won't do anything for you.",
	"Nothing good on TV?",
	"No good books to read?",
	"You realize you're addicted to clicking on a red dot, right?",
	"You realize that clicking on this dot will accomplish nothing, right?",
	"Wow. You're still clicking.",
	"You know, while you're here waiting for a lifeless dot to do something fantastic for you, the rest of the world is out having a life.",
	"Don't care? Well then, we could <b>both</b> be here awhile.",
	"I'm almost kind of wishing the dot would do something myself at this point.",
	"At least I'm going to profit from this. Every time you click the dot, I get a little bit of your soul.",
	"Don't believe me? Keep clicking.",
	"One piece of soul ...",
	"Two pieces of soul ...",
	"Three piece of soul ...",
	"Four piece of soul ...",
	"<b>I'm a SOUL man!</b>",
	"OK. I'm not really taking your soul. But, I'm sure as hell wasting a lot of your time.",
	"Why don't you stop?",
	"Why do you need to keep clicking?",
	"Are you addicted?",
	"Is it the red dot?",
	"Or is it just the clicking?",
	"Who are you abusing?",
	"The dot?",
	"... or yourself.",
	"I think we both know what's going on here.",
	"You needed someplace to run--somebody to listen to you.",
	"Well that someone isn't here.",
	"All we have here is a red dot that does nothing.",
	"It doesn't care about your sorrows.",
	"Take them somewhere else, emo kid.",
	"Lonely lifeless person ... keep clicking. You deserve it.",
	"Really. You do deserve it. Think of all the great things you've done for society lately.",
	"All those dots you've mercilessly clicked.",
	"All that sitting you've done.",
	"Maybe you're clicking standing up.",
	"That would be impressive.",
	"Society should thank you for all your clicking.",
	"How about I thank you.",
	"Thank-you for clicking my red dot.",
	"Sorry, I can't reward you by making the dot do something.",
	"I already told you it wouldn't do anything.",
	"Perhaps if you reach enlightenment somehow, you and the red dot can transcend each other.",
	"If you could do that, the dot wouldn't even have to do anything fancy.",
	"It would be you and the dot, existing together in all that exists.",
	"Wouldn't that be great?",
	"You and the red dot.",
	"Together at last?",
	"I have a feeling the dot's not going to leave you very satisfied though.",
	"I mean, it just sits there.",
	"See?",
	"Maybe you like that.",
	"That's probably how you've chosen all your friends.",
	"You keep clicking on them and they just sit there.",
	"You're Weird.",
	"You click on your friends.",
	"I'm not saying the dot is your friend.",
	"It's not.",
	"It really doesn't even know you.",
	"All it knows about you is that you like to harass it.",
	"You like to click on it, even when it ignores you.",
	"You sound pretty annoying.",
	"Maybe you've just forgotten what's going on here."
	];

var clicks = 0;

function dotClick() {
	clicks++;
	var line = clicks % lines.length;
	document.mainForm.clicks.value = clicks;
	document.getElementById('message').innerHTML = lines[line];
} // dotClick()
</script>


<p align="center">
	<img src="images/reddot.jpg" onClick="dotClick();" />
</p>

<div id="message" style="text-align: center; margin: 5px; font-size: big;">
	This is my red dot. It doesn't do anything when you click on it.
</div>

<form style="text-align: center;" name="mainForm" method="get" action="dotresults">
	<input type="hidden" name="clicks" value="0" />
	<input type="hidden" name="dot" value="red" />
	<input type="submit" value="I'm done harassing the dot." />
</form>

<div style='display: none; margin-top: 40px; text-align: center;'>
	Wait! <a href='/dots'>This isn't the dot I want to harass!</a>
</div>
