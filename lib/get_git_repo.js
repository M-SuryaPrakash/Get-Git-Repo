function getGitRepo() {

    var repoInfo = {};

    function downloadRepo(parameters, progress, cb) {

        progress.Status = 2;
        repoInfo = getRepoInfo(parameters);

        if (!repoInfo.resPath || repoInfo.resPath == "") {
            if (!repoInfo.branch || repoInfo.branch == "") {
                repoInfo.branch = "master";
            }

            var downloadUrl = `https://github.com/${repoInfo.author}/${repoInfo.repository}/archive/${repoInfo.branch}.zip`;

            progress.Status = 3;
            cb();
            window.location = downloadUrl;

        } else {
            axios.get(repoInfo.urlPrefix + repoInfo.resPath + repoInfo.urlPostfix).then(function (response) {
                if (response.data instanceof Array) {
                    downloadDir(progress, cb);
                } else {
                    downloadFile(response.data.download_url, progress, cb);
                }

            }, function (err) {
                console.log(err);
                if (err.response && err.response.status == 404) {
                    progress.Status = -1;
                    cb();
                }
                else {
                    progress.Status = -2;
                    progress.errorMessage = err.code + " : " + err.message;
                    cb();
                }

            });
        }
    }



    // Get Repositry Info Using given URL
    function getRepoInfo(parameters) {
        var repoPath = new URL(parameters.url).pathname;
        var splitPath = repoPath.split("/");
        var info = {};

        info.author = splitPath[1];
        info.repository = splitPath[2];
        info.branch = splitPath[4];

        info.rootName = splitPath[splitPath.length - 1];
        if (!!splitPath[4]) {
            info.resPath = repoPath.substring(
                repoPath.indexOf(splitPath[4]) + splitPath[4].length + 1
            );
        }
        info.urlPrefix = "https://api.github.com/repos/" + info.author + "/" + info.repository + "/contents/";
        info.urlPostfix = "?ref=" + info.branch;

        if (!parameters.fileName || parameters.fileName == "") {
            info.downloadFileName = info.rootName;
        } else {
            info.downloadFileName = parameters.fileName;
        }

        if (parameters.rootDirectory == "false") {
            info.rootDirectoryName = "";

        } else if (!parameters.rootDirectory || parameters.rootDirectory == "" ||
            parameters.rootDirectory == "true") {
            info.rootDirectoryName = info.rootName + "/";

        } else {
            info.rootDirectoryName = parameters.rootDirectory + "/";
        }

        return info;
    }



    // Downloading Single File
    // (given url is a single file)

    function downloadFile(url, progress, cb) {
        progress.Status = 4;
        progress.downloadedFiles = 0;
        progress.totalFiles = 1;

        var zip = new JSZip();
        axios.get(url, { responseType: "arraybuffer" }).then(function (file) {
            progress.downloadedFiles = 1;
            zip.file(repoInfo.rootName, file.data);

            progress.Status = 5;
            zip.generateAsync({ type: "blob" }).then(function (content) {
                progress.Status = 6;
                saveAs(content, repoInfo.downloadFileName + ".zip");
                progress.Status = 7;
            });
            cb();

        }, function (err) {
            console.log(err);
            progress.Status = -2;
            progress.errorMessage = err.code + " : " + err.message;
            cb();
        });
    }



    // Downloading directory 
    // (given url is a directory)

    function downloadDir(progress, cb) {
        progress.Status = 4;

        var dirPaths = [];
        var files = [];
        var requestedPromises = [];

        dirPaths.push(repoInfo.resPath);
        getSubDirectoriesAndFiles(dirPaths, files, requestedPromises, progress, cb);
    }

    // Recursive function to download files and sub-directories in a directory.
    function getSubDirectoriesAndFiles(dirPaths, files, requestedPromises, progress, cb) {
        axios.get(repoInfo.urlPrefix + dirPaths.pop() + repoInfo.urlPostfix).then(function (response) {
            for (var i = response.data.length - 1; i >= 0; i--) {
                if (response.data[i].type == "dir") {
                    dirPaths.push(response.data[i].path);

                } else {
                    if (response.data[i].download_url) {
                        getFile(response.data[i].path,
                            response.data[i].download_url,
                            files, requestedPromises, progress
                        );
                    } else {
                        console.log(response.data[i]);
                    }
                }
            }

            // If there are more directories to be downloaded, call the function again. Otherwise, download the files.
            if (dirPaths.length > 0) {
                getSubDirectoriesAndFiles(dirPaths, files, requestedPromises, progress, cb);
            } else {
                saveFiles(files, requestedPromises, progress, cb);
            }

        }, function (err) {
            // If the directory is not found, show an error message. Otherwise, show a connection error message.
            console.log(err);
        });
    }

    // Download a file and add it to the files array.
    function getFile(path, url, files, requestedPromises, progress) {

        var promise = axios.get(url, { responseType: "arraybuffer" }).then(function (response) {

            var file = {};
            file.path = path;
            file.data = response.data;

            files.push(file);
            progress.downloadedFiles = files.length;

        }, function (error) {
            // If the file is not found, show an error message. Otherwise, show a connection error message.
            console.log(error);
        });

        // Add the promise to the array of promises. 
        // This will be used to check if all files have been downloaded. 
        requestedPromises.push(promise);
        progress.totalFiles = requestedPromises.length;

    }

    // Save all files in the files array. 
    function saveFiles(files, requestedPromises, progress, cb) {

        var zip = new JSZip();

        // Check if all files have been downloaded. 
        // wait for all promises to be resolved.
        Promise.all(requestedPromises).then(function (data) {

            // Add all files to the zip file.
            progress.Status = 5;

            for (var i = files.length - 1; i >= 0; i--) {
                zip.file(
                    repoInfo.rootDirectoryName + files[i].path.substring(decodeURI(repoInfo.resPath).length + 1),
                    files[i].data
                );
            }

            // Generate the zip file.
            zip.generateAsync({ type: "blob" }).then(function (content) {
                // Save the zip file.
                progress.Status = 6;
                saveAs(content, repoInfo.downloadFileName + ".zip");
                progress.Status = 7;
            });

            cb();

        });
    }



    return {
        download: function (parameters, progress, cb) {

            progress.Status = 1;

            // template to check given url is a valid github url.
            var templateUrl = "https?://github.com/.+/.+";

            // if the url is a valid github url, download the repo.
            if (parameters.url.match(templateUrl)) {
                downloadRepo(parameters, progress, cb);
            }
            else {
                console.log("ERROR: Invalid Url.");
                progress.Status = -1;
                cb();
            }

        }
    };

}



// progress.status
// 1 = checkng url
// 2 = fetching repo info
// 3 = downloading repo using git archive.zip
// 4 = downloading
// 5 = zipping
// 6 = saving
// 7 = done
// -1 = Invalid Url
// -2 = ERROR (server error, network error, etc.)

