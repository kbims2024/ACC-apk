const https = require("https");
const fs = require("fs");

const file = fs.createWriteStream("android/gradle/wrapper/gradle-wrapper.jar");
https.get("https://raw.githubusercontent.com/gradle/gradle/v8.2.0/gradle/wrapper/gradle-wrapper.jar", function(response) {
  response.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Downloaded successfully");
  });
});
