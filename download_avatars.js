var request = require('request');
require('dotenv').config();


console.log('Welcome to the GitHub Avatar Downloader!');

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
           getAvatarLinks(contributorList, console.log);
         });
  // console.log(requestURL);
}

function getAvatarLinks(list, callback) {
  for (var i = 0; i < list.length; i++) {
    callback(list[i]["avatar_url"]);
  }
}

getRepoContributors("jquery", "jquery", function(err, result) {
  console.log("Errors:", err);
  console.log("Result:", result);
});

