relay
=====

Relay is a framework for organizing Javascript applications into scoped 
modules that are tied to HTML nodes.

Relay is not a closed framework and does not duplicate the 
myriad of helper functions like [jQuery](http://www.jquery.com) or 
template systems like [mustache](http://mustache.github.com), which work 
fine in tandem with this framework.

Relay imposes an organization where messages are passed down the HTML 
tree to other Javascript objects, thereby eliminating the need to 
pass object references around.


Installation
------------

Add this to your HTML page inside the `<HEAD>` tag.

    <script src="relay.js"></script>
    <style>ins{text-decoration:none}</style>

Add this to the bottom of your page below most of your content, but 
before your `</BODY>` tag.

    <script>relay.start();</script>


Concepts
--------

#### Little windows

Think of each module as being a separate browser window. Each "window" 
has it's own set of global variables and functions which can be invoked 
from anywhere within the window. The global variables are not exposed 
to the outside world, thereby creating a nice self-contained cocoon.

The global functions can also be called inline by the HTML and calling 
them inline will not affect other functions outside of the window, in 
say, an iframe or a parent frame.

These windows serve as nice self-contained modules that allow functions 
to be freely shared within itself, yet separated from the world outside.

Think of the parallels in the follow examples:

`<INS cite="js:.....">` maps to `window.onload = function() {}`

`relay("openLightbox", "/", this)` maps to `window.open("/", "_blank")`

`<div onclick="relay('setCount', 1, this);">` maps to `<div onclick="count=1;">`


#### Inline event handlers

If you yearn for the good old days of inline event handlers, but don't 
want to pollute the global object or need the handler to be specific 
to a particular instance, then `relay` can help you.

    <INS cite="js:ui.Button">
      <input type="checkbox" onclick="relay('checkMe', 1, this);">
    </INS>
    <INS cite="js:ui.Button">
      <input type="checkbox" onclick="relay('checkMe', 1, this);">
    </INS>

Clicking on either checkboxes won't mix up their code as they refer 
to different instances of `Button`.


#### Localized handlers

Since messages are passed down the node tree until it meets an object 
which is able to handle it, you can implement what we call localized 
handlers.

An ideal example is in making status/loading indicators.

When a status event propagates out from within a module, if the module 
can show it's own status, then it can handle it by itself. If 
not, then a higher up module can use it's own status indicator. If it 
still can't, then it will propagate to the top and the main application 
can use the ultimate status indicator to indicate status.


Rules of engagement
-------------------

* Javascript objects should not be loaded/instantiated programmatically. 
They are automatically loaded when the `relay` parser finds an 
`<INS cite="js:.....">` tag that references a Javascript constructor.

* Relay will instantiate that object and store a reference to it 
privately. It cannot be referenced directly except through the node.

* Application objects should not reference each other directly, but 
should call each other by passing messages down the node tree.

* If a message is passed down by a node higher up in the tree and the 
current object cannot handle it (because it doesn't have a method of 
the correct name), then the message is passed further down the tree 
until someone can handle it.


Examples
--------

#### Asking parents for permission

A module can send a message to it's parents asking if any of them have 
objections to navigating away from the current page.

    ChatWidget.loadURL = function(url) {
      var ok = this.relay("canUnload");
      if(ok) location.href = url;
    };

#### Asking parents to handle an unknown action

A module can handle an unknown request by passing it to it's parents 
to be handled.

    ChatWidget.mailtoButton.onClick = function(node) {
      this.relay("sendmail", node.href);
    };

#### A web browser application that uses inline handlers

    <body>
    <ins cite="js:firefox">
      <ins cite="js:firefox.toolbar">
        <button onclick="relay('go', -1, this);">Back</button>
        <button onclick="relay('go', 1, this);">Forward</button>
        <button onclick="relay('go', 0, this);">Reload</button>
        <button onclick="relay('stop', this);">Stop</button>
        <ins cite="js:firefox.urlbar">
          <input type="text">
          <button onclick="relay('go', this);">Go</button>
        </ins>
        <ins cite="js:firefox.spinner">
          <img src="">
        </ins>
      </ins>
      <ins cite="js:firefox.iframe">
      </ins>
    </ins>
    </body>

Notice how there are multiple places where `go` is called, but `relay` 
knows whether to call `firefox.toolbar.go()` or `firefox.urlbar.go()`.

Syntax
------

#### `relay(functionName, [parameters,]*, thisNode)`

Example: `relay("showFolder", "C001", this);`

Walks down the node tree starting from the current node until 
it finds a Javascript object with a "showFolder" method and calls it 
with "C001" as the parameter. If the "showFolder" method returns the 
object `relay.BUBBLE`, then we continue to walk down the node tree to 
the next node with a Javascript object with a "showFolder" method.

This function returns whatever "showFolder" returns.


#### `relay(inlineFunction, [parameters,]*, thisNode)`

Example: `relay(function() {this.showFolder();}, this);`

Walks down the node tree starting from the current node until
it find a Javascript object and calls the inline function with the 
Javascript object as the `this` scope.


#### `relay.start()` and `relay.initTree(node)`

Parses a node's children for `<INS>` tags that have objects to be 
instantiated. Or parses the document's root node.


#### `relay.byId(string)`

Returns the Javascript object that is hooked to the node with the 
specified ID attribute. The ID is retrieved using `getElementById` and 
this function is equivalent to calling 
`relay.getObjectFromNode(document.getElementById(id))`.
