var listids = 0;
var origId = null;
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

function removeRevertOption () {
  if(origId != null) {
    chrome.contextMenus.remove(origId);
    origId = null;
    listids = 0;
  }
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
    removeRevertOption();
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
function createWeightConversions() {
  var weightconv = chrome.contextMenus.create({"title":"Weight Conversions",
                                                "contexts":["selection"]});
  chrome.contextMenus.create({"title":"Convert %s (lbs->kgs)",
                              "contexts":["selection"],
                              "parentId":weightconv,
                              "onclick":function(info,tab) {
      converter(info,tab,.453592,"(kgs)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (kgs->lbs)",
                              "contexts":["selection"],
                              "parentId":weightconv,
                              "onclick":function(info,tab) {
      converter(info,tab,2.20462,"(lbs)")                       
    }
  });
}

function createLengthConversions() {
  var lengthconv = chrome.contextMenus.create({"title":"Length Conversions",
                                                "contexts":["selection"]});
  chrome.contextMenus.create({"title":"Convert %s (m->ft)",
                              "contexts":["selection"],
                              "parentId":lengthconv,
                              "onclick":function(info,tab) {
      converter(info,tab,3.28084,"(ft)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (ft->m)",
                              "contexts":["selection"],
                              "parentId":lengthconv,
                              "onclick":function(info,tab) {
      converter(info,tab,0.3048,"(m)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (km->mi)",
                              "contexts":["selection"],
                              "parentId":lengthconv,
                              "onclick":function(info,tab) {
      converter(info,tab,0.621371,"(mi)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (mi->km)",
                              "contexts":["selection"],
                              "parentId":lengthconv,
                              "onclick":function(info,tab) {
      converter(info,tab,1.60934,"(km)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (in->cm)",
                              "contexts":["selection"],
                              "parentId":lengthconv,
                              "onclick":function(info,tab) {
      converter(info,tab,2.54,"(cm)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (cm->in)",
                              "contexts":["selection"],
                              "parentId":lengthconv,
                              "onclick":function(info,tab) {
      converter(info,tab,0.393701,"(in)")                       
    }
  });
}

function createVolumeConversions() {
  var volconv = chrome.contextMenus.create({"title":"Volume Conversions",
                                                "contexts":["selection"]});
  chrome.contextMenus.create({"title":"Convert %s (gal->L)",
                              "contexts":["selection"],
                              "parentId":volconv,
                              "onclick":function(info,tab) {
      converter(info,tab,3.785,"(L)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (L->gal)",
                              "contexts":["selection"],
                              "parentId":volconv,
                              "onclick":function(info,tab) {
      converter(info,tab,0.264,"(gal)")                       
    }
  });
}

function createSpeedConversions() {
  var speedconv = chrome.contextMenus.create({"title":"Speed Conversions",
                                                "contexts":["selection"]});
  chrome.contextMenus.create({"title":"Convert %s (kmph->mph)",
                              "contexts":["selection"],
                              "parentId":speedconv,
                              "onclick":function(info,tab) {
      converter(info,tab,0.621371,"(mph)")                       
    }
  });
  chrome.contextMenus.create({"title":"Convert %s (mph->kmph)",
                              "contexts":["selection"],
                              "parentId":speedconv,
                              "onclick":function(info,tab) {
      converter(info,tab,1.60934,"(kmph)")                       
    }
  });
}

function createCurrencyConversions() {
  var currencyconv = chrome.contextMenus.create({"title":"Currency Conversions",
                                                  "contexts":["selection"]});
  $.get("https://www.google.com/finance/converter?a=1&from=USD&to=EUR", function(data) {
      var inputStr = $(data).find('.bld').text();
      var rate = inputStr.substring(0,inputStr.lastIndexOf(' '));
      chrome.contextMenus.create({"title":"Convert %s (USD->EUR)",
        "contexts":["selection"],
        "parentId":currencyconv,
        "onclick":function(info,tab) {
          converter(info,tab,rate,"(EUR)");                      
        }
      });  
  });
  $.get("https://www.google.com/finance/converter?a=1&from=EUR&to=USD", function(data) {
      var inputStr = $(data).find('.bld').text();
      var rate = inputStr.substring(0,inputStr.lastIndexOf(' '));
      chrome.contextMenus.create({"title":"Convert %s (EUR->USD)",
        "contexts":["selection"],
        "parentId":currencyconv,
        "onclick":function(info,tab) {
          converter(info,tab,rate,"(USD)");                      
        }
      });  
  });
}

function createDefaults() {
  createWeightConversions();
  createLengthConversions();
  createVolumeConversions();
  createSpeedConversions();
  createCurrencyConversions();
}


function recreateUserConverts() {
  chrome.contextMenus.removeAll();
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
  createDefaults();
}

recreateUserConverts();


chrome.tabs.onUpdated.addListener(function(activeInfo) {
  removeRevertOption();
});

chrome.storage.onChanged.addListener(function(changes,namespace) {
  recreateUserConverts();
});