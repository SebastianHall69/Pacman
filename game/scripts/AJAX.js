function UploadScore(userid, score) {
    $.ajax({
        url: 'scripts/addhighscore.php?userid=' + userid + '&score=' + score,
        complete: function (response) {
            console.log(response.responseText);
            parent.window.location.href = parent.window.location.href;
        },
        error: function () {
            console.log(response.resonseText);
        }
    });
    return false;
}