


const scriptsInEvents = {

	async Gamesheet_Event230_Act1(runtime, localVars)
	{
		function hexToRgb(hex) {
		  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		  return result ? {
		    r: parseInt(result[1], 16),
		    g: parseInt(result[2], 16),
		    b: parseInt(result[3], 16)
		  } : null;
		}
		
		
		localVars.R = hexToRgb(localVars.vHex).r
		localVars.G = hexToRgb(localVars.vHex).g
		localVars.B = hexToRgb(localVars.vHex).b
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

