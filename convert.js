var listids = 0;
var origId;
String.prototype.regexLastIndexOf = function(regex) { 
  var lastIndexOf = -1;
  var tempStr = this;
  var iter = 0;
  result = regex.exec(this);
  while(result != null) {
    lastIndexOf = result.index;
    regex.lastIndex = ++iter;
    result = regex.exec(this);
  }
  return lastIndexOf;
}
String.prototype.regexIndexOf = function(regex) { 
  return this.search(regex);
}


function parseNum(str,convfactor,convstring) {
  
  var nextStr = str.replace(',','');
  var firstNumInd = nextStr.regexIndexOf(/\d/g);
  var lastNumInd = nextStr.regexLastIndexOf(/\d/g)+1;
  var before = nextStr.substring(0,firstNumInd);
  var after = nextStr.substring(lastNumInd);
  var toMult = parseFloat(nextStr.substring(firstNumInd,lastNumInd));
  if(isNaN(toMult)) {
    return null;
  } else {
    return before + toMult*convfactor + convstring + after; 
  } 
}

function revert(info,tab) {
  listids--;
  if(listids === 0) {
    chrome.contextMenus.remove(origId);
  }
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"revert": "true"});
  })
}
function converterkgtolbs(info, tab) {
  var parsed = parseNum(info.selectionText,2.20462,"(lbs)");
  var toReturn = (parsed === null) ? info.selectionText : parsed;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"toReplace": toReturn, "original":info.selectionText});
  });
  if(listids === 0) {
    origId = chrome.contextMenus.create({"title":"Revert last change",
                              "contexts":["all"],
                              "onclick":revert});
  }
  listids++;
}

function converterlbstokgs(info, tab) {
  var parsed = parseNum(info.selectionText,0.453592,"(lbs)");
  var toReturn = (parsed === null) ? info.selectionText : parsed;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"toReplace": toReturn, "original":info.selectionText});
  });
  if(listids === 0) {
    origId = chrome.contextMenus.create({"title":"Revert last change",
                              "contexts":["all"],
                              "onclick":revert});
  }
  listids++;
}


chrome.contextMenus.create({"title":"Convert %s (kg->lbs)",
                            "contexts":["selection"],
                            "onclick":converterkgtolbs});

chrome.contextMenus.create({"title":"Convert %s (lbs->kg)",
                            "contexts":["selection"],
                            "onclick":converterlbstokgs});
