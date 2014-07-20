
var listOfAdded = document.getElementById('listofadded');
var listOfCurrencyAdded = document.getElementById('listofcurrencyadded');
function relist () {
  chrome.storage.sync.get(function(Items) {
    listOfAdded.innerHTML = '';
    listOfCurrencyAdded.innerHTML = '';
    for(var q in Items.userConv) {
      addRadioAdded(listOfAdded,q,Items.userConv[q].title + " with conversion factor " + Items.userConv[q].factor + " and Tag " + Items.userConv[q].tag + "<br>");
    }
    for(var x in Items.userCurrencyConv) {
      addRadioAdded(listOfCurrencyAdded,x,"Currency Conversion from " + Items.userCurrencyConv[x].firstCurr + " to " + Items.userCurrencyConv[x].secondCurr + "<br>")
    }
  });
}

function addRadioAdded(loc,value,inside) {
  var label = document.createElement('label');
  label.setAttribute('class','containradio');
  var newRadio = document.createElement('input');
  newRadio.setAttribute('type','radio');
  newRadio.setAttribute('value',value);
  newRadio.setAttribute('name', loc.id);
  newRadio.setAttribute('class','radiobutton');
  label.appendChild(newRadio);
  label.innerHTML += "<span>" + inside + "</span>";
  loc.appendChild(label);
}

function add_options() {
  chrome.storage.sync.get(function(Items) {
    var inTitle = document.getElementById('title').value;
    var inFactor = document.getElementById('factor').value;
    var inTag = document.getElementById('tag').value;
    if(inTitle != '' && !isNaN(inFactor)){
      var newUserConv = Items.userConv;
      newUserConv.push({"title":"Convert %s " + inTitle, "factor":inFactor,"tag":inTag});
      chrome.storage.sync.set({userConv:newUserConv}, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options added.';
        relist();
      });
    } else if(inTitle!=''){
      var status = document.getElementById('status');
      status.textContent = 'Conversion factor must be a number';
    } else {
      var status = document.getElementById('status');
      status.textContent = 'Title of conversion must contain something';
    }
  });
}

function add_currency_options() {
  chrome.storage.sync.get(function(Items) {
    var inFirstCurr = document.getElementById('to').value;
    var inSecondCurr = document.getElementById('from').value;
    var newUserCurrencyConv = Items.userCurrencyConv;
    newUserCurrencyConv.push({"firstCurr":inFirstCurr, "secondCurr":inSecondCurr});
    newUserCurrencyConv.push({"firstCurr":inSecondCurr, "secondCurr":inFirstCurr});
    chrome.storage.sync.set({userCurrencyConv:newUserCurrencyConv}, function() {
      var status = document.getElementById('status');
      status.textContent = 'Currency options added.';
      relist();
    });
  });
}


function delete_options() {
  chrome.storage.sync.get(function(Items) {
    var newUserConv = Items.userConv;
    var newUserCurrencyConv = Items.userCurrencyConv;
    var tempButtons = document.getElementsByName('listofadded');
    for(var z in tempButtons) {
      if(tempButtons[z].checked) {
        newUserConv.splice(tempButtons[z].value,1);
      }
    }
    var tempCurrencyButtons = document.getElementsByName('listofcurrencyadded');
    for(var z in tempCurrencyButtons) {
      if(tempCurrencyButtons[z].checked) {
        newUserCurrencyConv.splice(tempCurrencyButtons[z].value,1);
      }
    }
    chrome.storage.sync.set({userConv:newUserConv,userCurrencyConv:newUserCurrencyConv}, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options deleted.';
      relist();
    });
  });
}




function delete_all_options() {
  var newUserConv = [];
  var newUserCurrencyConv = [{"firstCurr":'USD', "secondCurr":'EUR'},{"firstCurr":'EUR', "secondCurr":'USD'}];
  chrome.storage.sync.set({userConv:newUserConv, userCurrencyConv:newUserCurrencyConv}, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options deleted.';
    relist();
  });
}


window.onload=relist;
document.getElementById('delete').addEventListener('click',
    delete_options);
document.getElementById('add').addEventListener('click',
    add_options);
document.getElementById('addcurren').addEventListener('click',
    add_currency_options);
document.getElementById('delete_all').addEventListener('click',
    delete_all_options);
