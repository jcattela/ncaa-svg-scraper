
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const request = require('request');

//Create function to download files from URL
const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}

//Create asychronous function to fetch html from url
(async () => {
	
	//define number of NCAA team paginations
	let numPages = 24;
	
	//increment for pagination
	for (let j=0; j < numPages; j++) {

		let response = await fetch('https://www.ncaa.com/schools-index/' + j)
		
		//store response as text once loaded
		let text = await response.text();
		//use JSDOM to parse incoming html elements as JSON
		let dom = new JSDOM(text);
		//convert JSON items to variables
			//create array of svg icon paths
			let ncaaSvgs = dom.window.document.querySelectorAll("img.school-icon.lazyload");
			//create array to name said icons
			let ncaaTr = dom.window.document.querySelectorAll("tr > td");
		
		//loop to save each icon as an svg in local directory
		for (i=0; i < ncaaSvgs.length; i++) {
			//target the img element src property
			let imgSrc = ncaaSvgs[i].getAttribute('data-src');
			//target the textcontent of the 3rd table row of each array -- pattern is 2,5,8,11,14...
			let k = (i*3) + 2;
			let imgName = ncaaTr[k].textContent;
			
			//make sure the img source isnt empty
			if (imgSrc !== null) {
				//define path to save
				let savePath = "./svgs/" + imgName + ".svg";
				//run download function
				download (imgSrc, savePath, () => {
					console.log('✅ ' + imgName)

				} )
			}
		}					
	}
	
	
})();
