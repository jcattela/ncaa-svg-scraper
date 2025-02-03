const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

//Create function to download files from URL using fetch
//Updated in 2024 to use fetch instead of require
const download = async (url, filepath) => {
  const response = await fetch(url);
  const fileStream = fs.createWriteStream(filepath);
  return new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};

//Create asychronous function to fetch html from url
(async () => {
  //define number of NCAA team paginations
  let numPages = 24;

  //increment for pagination
  for (let j = 0; j < numPages; j++) {
    let response = await fetch("https://www.ncaa.com/schools-index/" + j);

    //store response as text once loaded
    let text = await response.text();
    //use JSDOM to parse incoming html elements as JSON
    let dom = new JSDOM(text);

    //convert JSON items to variables
    //create array of svg icon paths
    //I had to update this section in 2024 to target only the icons within a table and there was only 1 table on the page. This could change in the future
    let ncaaSvgs = dom.window.document.querySelectorAll(
      "table img.school-icon"
    );
    //create array to name said icons
    let ncaaTr = dom.window.document.querySelectorAll("tr > td");

    //loop to save each icon as an svg in local directory
    for (i = 0; i < ncaaSvgs.length; i++) {
      //target the img element src property
      let imgSrc = ncaaSvgs[i].getAttribute("src");
      //target the dark versions for the scoreboard
      let drkImgSrc = imgSrc.replace("/bgl/", "/bgd/");
      //   console.log(imgSrc);
      //target the textcontent of the 3rd table row of each array -- pattern is 2,5,8,11,14...
      let k = i * 3 + 2;
      let imgName = ncaaTr[k].textContent;

      //make sure the img source isnt empty
      if (imgSrc !== null) {
        //define path to save
        let savePath = "./svgsDark/" + imgName + ".svg";
        //run download function
        download(drkImgSrc, savePath, () => {
          console.log("✅ " + imgName);
        });
      }
    }
  }
})();
