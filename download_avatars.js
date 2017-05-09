var request = require('request');
var fs = require('fs');
require('dotenv').config();

var downloadPath = "./avatars/" // set default download folder location

// make a get request to obtain list of avatar links, and applies callback function to each.
function getRepoContributors(repoOwner, repoName, cb) {
  // prepare request URL. Uses .env info to avoid revealing API key.
  var requestURL = 'https://'+ process.env.GITHUB_USER + ':' + process.env.GITHUB_TOKEN + '@api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors';

  // sets options for get request, so header is provided.
  var options = {
                  url: requestURL,
                  headers: {
                    'User-Agent': "ArmelChesnais' download avatars app"
                  }
  }

  var result = ""; // default output from get request is empty.
  var contributorList;
  request.get( options )
         .on("error", function(err) {
          throw err;
         })
         .on('response', function(response) {
          if ( 401 === response.statusCode || response.statusCode === 403 ) {
            throw new Error("Please verify your credentials in .env");
          }
         })
         .on("data", function(data) {
           result += data; // append each chunk of data to output.
         })
         .on("end", function() {
           // Once complete, parse all chunks into JSON object
           contributorList = JSON.parse(result);
           processAndCallback(contributorList, cb);
         });
  // console.log(requestURL);
}

function processAndCallback(data, cb) {
  if ( data.message && data.message.toLowerCase() === "not found") {
    throw new Error("Repo or owner incorrect" );
  } else {
    // iterate through object to pull avatar URL and set individual download path as per user's login name
    for (var i = 0; i < data.length; i++) {
     var avatarUrl = data[i]["avatar_url"];
     var filePath =  downloadPath + data[i]["login"] + ".jpg"
     cb(avatarUrl, filePath); // callback invoked to download each individual image.
    }
  }
}


function downloadImageByUrl(url, filePath) {
  request.get( url )
         .on("error", function(err) {
          throw err;
         })
         .on("end", function() {
           // output message to notify user when each individual file is done.
           console.log(filePath, "download complete");
         })
         .pipe(fs.createWriteStream(filePath)); // pipe image data to the prior-defined file path.
}

function checkRequirements(inputs) {
  if ( inputs.length !== 2 ) { // rejects inputs if there are fewer than 2 arguments
    throw new Error("Please provide two arguments: <owner> <repo>\n");
  }
  if ( !fs.existsSync(".env") ) {
    throw new Error("No .env document specified, please include in app folder\n");
  }
  if ( !process.env.GITHUB_USER  || !process.env.GITHUB_TOKEN) {
    throw new Error("Please specify GITHUB_USER and GITHUB_TOKEN in .env file\n");
  }
}
function processInput(inputs) {
  try {
    checkRequirements(inputs);

    // if there are at least 2 argument, first ensure download folder exists.
    if (!fs.existsSync(downloadPath) ) {
      fs.mkdir(downloadPath); // create if not.
    }

    console.log('Welcome to the GitHub Avatar Downloader!\n');

    // start processing the data.
    getRepoContributors(inputs[0], inputs[1], downloadImageByUrl);
  }
  catch (exception) {
    console.log(exception);
  }
}

processInput( process.argv.slice(2) );


