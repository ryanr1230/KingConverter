$(document).ready(function(){

  function replaceWith(text,original) {
      var ta = $(window.getSelection().anchorNode.parentElement);
      var inside = ta.html();
      var newin = ta.html().replace(original,text,"g");
      ta.html(newin);
   }


  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      replaceWith(request.toReplace,request.original);
    });
})