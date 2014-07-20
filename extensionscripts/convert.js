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

function parseNum(str,convfactor,convstring,callback) {
  
  var nextStr = str.replace(',','');
  var firstNumInd = nextStr.regexIndexOf(/\d/g);
  var lastNumInd = nextStr.regexLastIndexOf(/\d/g)+1;
  var before = nextStr.substring(0,firstNumInd);
  var after = nextStr.substring(lastNumInd);
  var toMult = parseFloat(nextStr.substring(firstNumInd,lastNumInd));
  if(isNaN(toMult)) {
    callback(null);
  } else {
    callback(before + (toMult*convfactor).toFixed(2) + convstring + after);
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
  console.log(conversionFactor+ " " + tag);
  parseNum(info.selectionText,conversionFactor,(tag === null) ? "" : tag, function(parsed) {
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
  });
}

function createContextMenusFromList(list,parentId) {
  $.each(list,function(index) {
    chrome.contextMenus.create({"title":"Convert %s (" + list[index].from + "->" + list[index].to + ")",
                                "contexts":["selection"],
                                "parentId":parentId,
                                "onclick":function(info,tab) {
        console.log(index);
        console.log(list[index]);        
        converter(info,tab,list[index].factor,'('+ list[index].to + ')');                       
      }
    });
  });
}

function createWeightConversions() {
  var weightconvlist = [{'from':'lbs','to':'kgs','factor':.453592},
                        {'from':'kgs','to':'lbs','factor':2.20462}];
  var weightconv = chrome.contextMenus.create({"title":"Weight Conversions",
                                                "contexts":["selection"]});
  createContextMenusFromList(weightconvlist,weightconv);
}

function createLengthConversions() {
  lengthconvlist = [{'from':'m','to':'ft','factor':3.28084},
                    {'from':'ft','to':'m','factor':0.3048},
                    {'from':'km','to':'mi','factor':0.621371},
                    {'from':'mi','to':'km','factor':1.60934},
                    {'from':'in','to':'cm','factor':2.54},
                    {'from':'cm','to':'in','factor':0.393701}];
  var lengthconv = chrome.contextMenus.create({"title":"Length Conversions",
                                                "contexts":["selection"]});
  createContextMenusFromList(lengthconvlist,lengthconv);
}

function createVolumeConversions() {
  var volconvlist = [{'from':'gal','to':'L','factor':3.785},
                        {'from':'L','to':'gal','factor':0.264}];
  var volconv = chrome.contextMenus.create({"title":"Volume Conversions",
                                                "contexts":["selection"]});
  createContextMenusFromList(volconvlist,volconv);
}

function createSpeedConversions() {
  var speedconvlist = [{'from':'kmph','to':'mph','factor':0.621371},
                       {'from':'mph','to':'kmph','factor':1.60934}];
  var speedconv = chrome.contextMenus.create({"title":"Speed Conversions",
                                                "contexts":["selection"]});
  createContextMenusFromList(speedconvlist,speedconv);
}

function createCurrencyConversions(Items) {
  var currencyconv = chrome.contextMenus.create({"title":"Currency Conversions",
                                                  "contexts":["selection"]});
  $.each(Items.userCurrencyConv,function(index) {
    var rate = 1;
    $.get("https://www.google.com/finance/converter?a=1&from=" + Items.userCurrencyConv[index].firstCurr + "&to=" + Items.userCurrencyConv[index].secondCurr,
      function(data) {
        var inputStr = $(data).find('.bld').text();
        rate = inputStr.substring(0,inputStr.lastIndexOf(' '));
        createContextMenusFromList([{'from':Items.userCurrencyConv[index].firstCurr,'to':Items.userCurrencyConv[index].secondCurr,'factor':rate}],currencyconv);
    });
  }); 
}

function createDefaults() {
  createWeightConversions();
  createLengthConversions();
  createVolumeConversions();
  createSpeedConversions();
}

function setDefaultCurrencyConv() {
  var newUserCurrencyConv = [{"firstCurr":'USD', "secondCurr":'EUR'},{"firstCurr":'EUR', "secondCurr":'USD'}];
  chrome.storage.sync.set({userCurrencyConv:newUserCurrencyConv});
}

function recreateUserConverts() {
  chrome.contextMenus.removeAll();
  chrome.storage.sync.get(function(Items) {
    if(Items.userCurrencyConv === undefined) {
      setDefaultCurrencyConv(function () {
        createCurrencyConversions(Items);
      });
    } else {
      createCurrencyConversions(Items);
    }
    $.each(Items.userConv,function(index){
      chrome.contextMenus.create({"title":Items.userConv[index].title,
                                  "contexts":["selection"],
                                  "onclick":function(info,tab) { 
         converter(info,tab,Items.userConv[index].factor,Items.userConv[index].tag);
        }
      }); 
    });
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