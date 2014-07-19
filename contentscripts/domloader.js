$(document).ready(function(){
  var toRevert = [];
  function replaceWith(text,original) {
      var taDom = window.getSelection().anchorNode.parentElement;
      var ta = $(taDom);
      var inside = ta.text();
      var newin = ta.text().replace(original,text,"g");
      ta.text(newin);
      toRevert.push({"item":taDom, "original":inside});
   }

  function revertLast() {
    var revertObj = toRevert[toRevert.length-1];
    toRevert.pop();
    $(revertObj['item']).text(revertObj['original']);
  }

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.revert==="true") { 
        revertLast();
      } else {
        replaceWith(request.toReplace,request.original);
      }
    });
})
