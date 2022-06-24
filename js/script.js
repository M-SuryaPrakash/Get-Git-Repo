function downloadRepo(repoUrl) {

    // initializing repo parameters and progress.
    var parameters = {
        url: repoUrl || "",
        fileName: "",
        rootDirectory: "true"
    };
    var progress = {
        downloadedFiles: 0,
        totalFiles: 0,
        Status: "",
        errorMessage: ""
    };

    // creating proxy for progress inorder to update Download Status on UI when progress values are changed.
    var progressProxy = new Proxy(progress, {
        set: function (target, prop, value, receiver) {
            target[prop] = value;
            upadateDownloadStatus(target);

            return true;
        }
    });



    //status updater
    const loadingImg = '<div class="lds-facebook"><div></div><div></div><div></div></div>';
    const downloadCompleteImg = '<img src="../images/download-complete.webp" alt="download complete" class="download-complete">';
    const invalidUrlImg = '<i class="fa-solid fa-link-slash fa-2x"></i>';
    const errorImg = '<i class="fa-solid fa-triangle-exclamation fa-2x"></i>'

    function upadateDownloadStatus(progress) {

        $("#download-status").fadeOut(function () {
            $("#download-status").fadeIn();
        });

        switch (progress.Status) {

            case 1:
                $("#status-img").html(loadingImg);
                $("#status-msg").text("Checking URL . . .");
                $("#err-msg").text(" ");
                break;
            case 2:
                $("#status-img").html(loadingImg);
                $("#status-msg").text("Fetching Repository Info . . .");
                $("#err-msg").text(" ");
                break;
            case 3:
                $("#status-img").text(" ");
                $("#status-msg").text(" ");
                $("#err-msg").text(" ");
                break;
            case 4:
                $("#status-img").html(loadingImg);
                $("#status-msg").text("Downloading files . . . " + progress.downloadedFiles + " / " + progress.totalFiles);
                $("#err-msg").text(" ");
                break;
            case 5:
                $("#status-img").html(loadingImg);
                $("#status-msg").text("Generating Zip file . . .");
                $("#err-msg").text(" ");
                break;
            case 6:
                $("#status-img").html(loadingImg);
                $("#status-msg").text("Saving Zip file . . .");
                $("#err-msg").text(" ");
                break;
            case 7:
                $("#status-img").html(downloadCompleteImg);
                $("#status-msg").text("*Download Complete, Please check your downloads folder.");
                $("#err-msg").text(" ");
                break;
            case -1:
                $("#status-img").html(invalidUrlImg);
                $("#status-msg").text("*Invalid URL");
                $("#err-msg").text(" ");
                break;
            case -2:
                $("#status-img").html(errorImg);
                $("#status-msg").text("*Connection failure");
                $("#err-msg").text("( " + progress.errorMessage + " )");
                break;
        }


    }



    // call getGitRepo and start downloading files.
    getGitRepo().download(parameters, progressProxy, function () {
        console.log("exited from getGitRepo()");
    });



}





