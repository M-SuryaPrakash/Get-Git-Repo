$(document).ready(function () {
    initSocialMeadiaButtons();

    const currentYear = new Date().getFullYear();
    $("#year").text(currentYear);

    $("#download-form").submit(function(e){
        e.preventDefault();

        var repoUrl = $("#repoUrl").val();

        downloadRepo(repoUrl);
    });


});





// Social Meadia Buttons
function initSocialMeadiaButtons() {
    const waBtn = $(".wa");
    const fbBtn = $(".fb");
    const twBtn = $(".tw");
    const liBtn = $(".li");
    const rdBtn = $(".rd");

    let postUrl = encodeURI(document.location.href);
    let postTitle = encodeURI("Hey Everyone! Check this out. Now you can download whole GitHub repository or specific sub-folders or specific files with a single click!");
    let waTitle = encodeURI("Hey! Check this out. Now you can download whole GitHub repository or specific sub-folders or specific files with a single click!");

    fbBtn.attr("href", `https://www.facebook.com/sharer.php?u=${postUrl}`);
    waBtn.attr("href", `https://wa.me/?text=${waTitle}${postUrl}`);
    liBtn.attr("href", `https://www.linkedin.com/shareArticle?url=${postUrl}&title=${postTitle}`);
    twBtn.attr("href", `https://twitter.com/share?url=${postUrl}&text=${postTitle}`)
    rdBtn.attr("href", `https://reddit.com/submit?url=${postUrl}&title=${postTitle}`)
}
