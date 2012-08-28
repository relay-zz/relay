/** Copyright 2012 mocking@gmail.com * http://relay.github.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

var relay = function(ctx) {
"use strict";

//a mapping of uniquely generated numbers to objects
var nodeObjMap = {};
var nodeObjMapIdx = 1;

var FUNCTION = "function",
    THIS_ERR = "invalid 'this'",
    ArraySlice = Array.prototype.slice;

function hookObjectToNode(obj, node) {
  if(node.nodeType != 1) throw node;
  if(!node._relayAppId) {
    node._relayAppId = ++nodeObjMapIdx;
    nodeObjMap[nodeObjMapIdx] = obj;
    obj.relayBaseNode = node;
  }
}

function unhookObject(node) {
  node = node.relayBaseNode || node;
  var id = node._relayAppId;
  nodeObjMap[id].relayBaseNode = node._relayAppId = null;
  delete nodeObjMap[id];
}

function getObjectFromNode(node) {
  if(typeof node == "string") node = ctx.document.getElementById(node);
  return nodeObjMap[node._relayAppId];
}

R.unload = function() {
  nodeObjMap = {};
};

R.start = R.initTree = function(root) {
  if(!root || !root.nodeType) root = ctx.document.body || ctx.document.documentElement;

  var appName,
    i = 0,
    list = root.getElementsByTagName("INS"),
    node = (root.nodeName == "INS") ? root : list[i++],
    loadObject = R.loadObject;

  do {
    if(!node._relayAppId) {
      if((appName = node.cite).substr(0, 3) == "js:") {
        //object names are stored as URIs in the CITE attribute: <INS CITE="js:com.acme.MyApp">
        appName = appName.substr(3);

        loadObject(appName, node);
      }
    }
  } while(node = list[i++]);
};

R.loadObject = function(appName, node) {  //this function can be overridden for requireJS
  //searches for a global variable or a property of a global variable by name
  var i, obj = ctx, path = appName;
  if((i = obj[path])) {
    obj = i;
  } else {
    i = 0;
    path = path.split(".");
    while(path[i] && (obj = obj[ path[i++] ]));
  }

  if(obj) R.initAndHookObject(obj, appName, node);
};

R.initAndHookObject = function(obj, appName, node) {
  //we allow instantiating objects by these methods:
  //= new com.acme.MyApp(appName, node)
  //= com.acme.MyApp.getInstance(appName, node)
  //otherwise we reference the object without instantiation
  if(typeof obj == FUNCTION) {
    obj = new obj(appName, node);
    //passing in the appName allows the object to map out further 
    //resources that are identified by the appName. e.g., templates

  } else if(typeof obj.getInstance == FUNCTION) {
    obj = obj.getInstance(appName, node);
    if(!obj) throw appName;
  }

  hookObjectToNode(obj, node);
};

function R(type, args, node) {
  args = ArraySlice.call(arguments, 1);
  node = args.pop();

  if(!node || node == ctx) throw THIS_ERR;

  //we allow passing in an Event or JSObject instead of Node
  if(!node.nodeType) node = node.relayBaseNode || (node.preventDefault && node.target) || node.srcElement || node;
  if(!node.nodeType) throw THIS_ERR;

  var value, obj;
  if(typeof type == FUNCTION) {
    //we allow inline functions to run with the JSObject set as the scope:
    //relay(function(){this.showMenu();}, this);
    while(node) {
      if(node._relayAppId && (obj = getObjectFromNode(node))) {
        return type.apply(obj, args) || obj;
      }
      node = node.parentNode;
    }

  } else {
    while(node) {
      if(node._relayAppId && (obj = getObjectFromNode(node)) && obj[type]) {
        value = obj[type].apply(obj, args);
        if(value != R.BUBBLE) return value || obj;
      }
      node = node.parentNode;
    }
    return value;
  }
}

//export functions
R.hookObjectToNode = hookObjectToNode;
R.unhookObject = unhookObject;
R.byId = R.getObjectFromNode = getObjectFromNode;
R.BUBBLE = {};

return R;

}(this);