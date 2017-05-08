var request = require('request');
var fs = require('fs');
require('dotenv').config();

var downloadPath = "./avatars/"


function getRepoContributors(repoOwner, repoName, cb) {
  var requestURL = 'https://'+ process.env.GITHUB_USER + ':' + process.env.GITHUB_TOKEN + '@api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors';

  var options = {
                  url: requestURL,
                  headers: {
                    'User-Agent': "ArmelChesnais' download avatars app"
                  }
  }

  var result = "";
  var contributorList;
  request.get( options )
         .on("error", function(err) {
          throw err;
         })
         .on("data", function(data) {
           result += data;
         })
         .on("end", function() {
           contributorList = JSON.parse(result);
           for (var i = 0; i < contributorList.length; i++) {
             var avatarUrl = contributorList[i]["avatar_url"];
             var filePath =  downloadPath + contributorList[i]["login"] + ".jpg"
             cb(avatarUrl, filePath);
           };
         });
  // console.log(requestURL);
}



function downloadImageByUrl(url, filePath) {
  request.get( url )
         .on("error", function(err) {
          throw err;
         })
         .on("end", function() {
           console.log(filePath, "download complete");
         })
         .pipe(fs.createWriteStream(filePath))
         ;
}

function processInput(inputs) {
  if ( inputs.length < 2 ) {
    console.log("Please provide two arguments: <owner> <repo>");
  }
  else {
    if (!fs.existsSync(downloadPath) ) {
      fs.mkdir(downloadPath);
    }

    console.log('Welcome to the GitHub Avatar Downloader!');

    getRepoContributors(inputs[0], inputs[1], downloadImageByUrl);
  }
}

processInput( process.argv.slice(2) );
// console.log(process.argv.slice(2));



