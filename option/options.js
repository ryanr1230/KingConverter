
var listOfAdded = document.getElementById('listofadded');
function relist () {
  chrome.storage.sync.get(function(Items) {
    listOfAdded.innerHTML = '';
    for(var q in Items.userConv) {
      addRadioAdded(q,Items.userConv[q].title + " with conversion factor " + Items.userConv[q].factor + "and Tag" + Items.userConv[q].tag + "<br>");
    }
  });
}

function addRadioAdded(value,inside) {
  var label = document.createElement('label');
  var newRadio = document.createElement('input');
  newRadio.setAttribute('type','radio');
  newRadio.setAttribute('value',value);
  newRadio.setAttribute('name','added');
  label.appendChild(newRadio);
  label.innerHTML += inside;
  listOfAdded.appendChild(label);
}

function add_options() {
  chrome.storage.sync.get(function(Items) {
    var inTitle = document.getElementById('title').value;
    var inFactor = document.getElementById('factor').value;
    var inTag = document.getElementById('tag').value;
    var newUserConv = Items.userConv;
    newUserConv.push({"title":"Convert %s " + inTitle, "factor":inFactor,"tag":inTag});
    chrome.storage.sync.set({userConv:newUserConv}, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options added.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
      relist();
    });
  });
}


function delete_options() {
  chrome.storage.sync.get(function(Items) {
    var newUserConv = Items.userConv;
    var tempButtons = document.getElementsByName('added');
    for(var z in tempButtons) {
      if(tempButtons[z].checked) {
        newUserConv.splice(tempButtons[z].value,1);
      }
    }
    chrome.storage.sync.set({userConv:newUserConv}, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options deleted.';
      setTimeout(function() {
      status.textContent = '';
      }, 750);
      relist();
    });
  });
}

function delete_all_options() {
  chrome.storage.sync.get(function(Items) {
    var newUserConv = [];
    chrome.storage.sync.set({userConv:newUserConv}, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options deleted.';
      setTimeout(function() {
      status.textContent = '';
      }, 750);
      relist();
    });
  });
}


window.onload=relist;
document.getElementById('delete').addEventListener('click',
    delete_options);
document.getElementById('add').addEventListener('click',
    add_options);
document.getElementById('delete_all').addEventListener('click',
    delete_all_options);
