

document.addEventListener("DOMContentLoaded", function() {
    // Display the content and hide the loading spinner after 3 seconds
    setTimeout(function() {
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }, 1000); // 3000 milliseconds = 3 seconds
});