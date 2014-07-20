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

function converter(info, tab, conversionFactor, tag) {

  var parsed = parseNum(info.selectionText,conversionFactor,(tag === null) ? "" : tag);
  var toReturn = (parsed === null) ? info.selectionText : parsed;
  chrome.tabs.query({active:true,currentWindow:true},function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"toReplace" : toReturn, "original":info.selectionText});
  });
  if(listids === 0) {
    origId = chrome.contextMenus.create({"title":"Revert last change", 
                              "contexts":["all"],
                              "onclick":revert});
  }
  listids++;
}


function createDefaults() {
  chrome.contextMenus.create({"title":"Convert %s (lbs->kgs)",
                              "contexts":["selection"],
                              "onclick":function(info,tab) {
      converter(info,tab,.453592,"(kgs)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (kgs->lbs)",
                              "contexts":["selection"],
                              "onclick":function(info,tab) {
      converter(info,tab,2.20462,"(lbs)")                       
    }
  });
}


function recreateUserConverts() {
  chrome.contextMenus.removeAll();
  createDefaults();
  chrome.storage.sync.get(function(Items) {
    for(var j in Items.userConv) {
      chrome.contextMenus.create({"title":Items.userConv[j].title,
                                  "contexts":["selection"],
                                  "onclick":function(info,tab) { 
         converter(info,tab,Items.userConv[j].factor,Items.userConv[j].tag);
        }
      }); 
    } 
  });
}

recreateUserConverts();



chrome.storage.onChanged.addListener(function(changes,namespace) {
  recreateUserConverts();
});