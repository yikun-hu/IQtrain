var script1 = document.createElement('script');
script1.setAttribute('src', './crypto_min.js');


function loadScripts() {
	document.head.appendChild(script1);
}

script1.onload = script1.onreadystatechange = function() {
	c3_callFunction("ScriptsLoaded")
}


var variation = 0;

function getRandomFloat(seed, level, type, min, max) {
	// Generate a hash using the seed
	var hash = CryptoJS.MD5(seed + "," + level + "," + type + "," + variation ).toString();
	variation++

	// Convert the hash into a number between 0 and 1
	var num = parseInt(hash.substr(0, 16), 16) / Math.pow(2, 64);

	// Scale the number to fit between min and max
	var scaledNum = min + num * (max - min);

	// Return the scaled number
	return scaledNum;
}



const scriptsInEvents = {

	async Gamesheet_Event34_Act1(runtime, localVars)
	{
		variation = 0
	},

	async Gamesheet_Event35_Act1(runtime, localVars)
	{
		variation = 0
	},

	async Gamesheet_Event40_Act1(runtime, localVars)
	{
		variation = 0
	},

	async Gamesheet_Event110_Act1(runtime, localVars)
	{
		localVars.vRes = getRandomFloat(localVars.vSeed, localVars.vLevel, localVars.vType , localVars.vMin, localVars.vMax)
	},

	async Loadersheet_Event2_Act1(runtime, localVars)
	{
		loadScripts()
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

