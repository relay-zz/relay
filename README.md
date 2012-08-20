relay
=====

Relay is a framework for organizing Javascript applications into scoped 
modules that are tied to HTML nodes.

Relay imposes an organization where messages are passed down the HTML 
tree to other Javascript objects, thereby eliminating the need to 
pass object references around, which simplifies application design.

Relay serves as the pipelining and scaffolding only and does not duplicate 
the myriad of helper functions like [jQuery](http://www.jquery.com) or 
template systems like [mustache](http://mustache.github.com), which work 
in tandem with this framework.


Installation
------------

Add this to your HTML page inside the `<HEAD>` tag.

    <script src="relay.js"></script>
    <style>ins{text-decoration:none}</style>

Add this to the bottom of your page below most of your content, but 
before your `</BODY>` tag.

    <script>relay.start();</script>


Benefits
--------

Relay allows you to write application modules without needing to worry 
about how they link together. This is particularly useful when writing 
single-page web application. You can swap modules in and out or nest 
modules within one another simply by manipulating the HTML at any time 
even when the application is already running.

One of the pains in writing complex applications is the need to add 
callback functions (event listeners) in all child objects and removing 
the callbacks when the child object is removed. Relay eliminates the 
need for these callback functions by allowing child objects to dispatch 
events to it's parent and ancestor objects systematically following 
the path of the HTML tree.

This reduces a lot of the clean up code that typically needs to be 
written when making single-page web applications.

### The power of relays

Event handling is the ugliest part of a program. Not hardest, but 
ugliest.

For event handling, typically one resorts to `addEventListener` and 
`handleEvent`. But let's face it, every object will have to expose an 
event handler that is registered with another object so that the other 
object can call the handler when something exciting happens. Then you 
have to call `removeEventListener` whenever an object changes so now 
you have to keep track of when objects arrive and go. And for every 
separate event you need to have a separate event listener dance ritual. 
Catch my drift? What if your object is thrown away and you forgot to 
`removeEventListener`, well now you got unexpected behavior and possibly 
memory leaks. The ugly just got uglier.

Another technique is to resort to `publish-subscribe` which is 
essentially a giant singleton that everyone hooks up with. It is a giant 
event bus where raised events get published to and interested parties 
can subscribe to. It's quite the decoupling, but again, you need to 
remember to unsubscribe when objects go away or you will get unexpected 
behavior. It sounds nice, but what you've just done is thrown a bunch 
of events into the sea and see which fishing net picks out which events.
You're betting that someone else with the same sized net hasn't caught 
your fish first (intentionally or accidentally). After all, how can you 
know who else is finishing in the same lake?

Then comes `relay` to the rescue. It introduces structure in a simple 
way. And it doesn't it by free riding on top of your HTML DOM tree. 
After all, what is more structured than HTML, and what is more free 
than what the browser has already built for you?

It's clean and follows a predefined path without deviation. There is 
no mixing with the wrong crowd. And there is no dance ritual and 
no housekeeping.

### Modular

#### Imagine modules as iframes

Think of each module as being a separate browser window in an iframe. 
Each "window" has it's own set of global variables and global functions 
which can be invoked from anywhere within the window. The global 
variables are also not exposed to the outside world.

The global functions can also be called inline by the HTML and calling 
them inline will not affect other functions outside of the window, in 
say, an iframe or a parent frame.

Think of the parallels in the follow examples:

`<INS cite="js:.....">` maps to `window.onload = function() {}`

`relay("openLightbox", "://yahoo.com", this)` maps to `window.open("://yahoo.com", "_blank")`

`<div onclick="relay('setCount', 1, this);">` maps to `<div onclick="count=1;">`


#### Imagine modules with inline event handlers

If you yearn for the good old days of inline event handlers, but don't 
want to pollute the global object or want the handler to be specific 
to a particular instance of multiple objects, then `relay` can help you.

    <INS cite="js:ui.Button">
      <input type="checkbox" onclick="relay('checkMe', 1, this);">
    </INS>
    <INS cite="js:ui.Button">
      <input type="checkbox" onclick="relay('checkMe', 1, this);">
    </INS>

Clicking on either checkboxes won't mix up their code as they refer 
to different instances of `Button`.

Note that inline event handlers is optional and you may use `relay` 
with `addEventLister` too.

    $(".nav button").click(function(event) {
      relay("checkMe", 1, event);
    });


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
      </ins>
      <ins cite="js:firefox.iframe">
      </ins>
    </ins>
    </body>

Notice how there are multiple places where `go` is called, but `relay` 
knows whether to call `firefox.toolbar.go()` or `firefox.urlbar.go()`.

#### Working with mustache

    <INS cite="js:ui.DatePicker"></INS>

    <script>
    ui.DatePicker = function(appName, node) {
      //initialize our view
      node.innerHTML = Mustache.render(document.getElementById(appName).innerHTML, this.getData());
    };
    </script>
    <script type="text/x-template" id="ui.DatePicker">
      <table>...</table>
    </script>


#### Localized handlers

Since events are passed down the node tree until it meets an object 
which is able to handle it, you can implement what we call localized 
handlers.

An ideal example is in making loading indicators. Sometimes we want the 
loading indicator to be near the object which is loading. But sometimes 
the object itself doesn't have it's own loading indicator so a global 
loading indicator needs to be used.

When a status event propagates out from within a module, if the module 
can show it's own status, then it can handle it by itself. If 
not, then a higher up module can use it's own status indicator. If it 
still can't, then it will propagate to the top and the main application 
can use the ultimate status indicator to indicate status.


Syntax
------

#### `relay(functionName, [parameters,]*, thisNode)`

Example: `var retVal = relay("showFolder", "C001", this);`

Walks down the node tree starting from the current node until 
it finds a Javascript object with a "showFolder" method and calls it 
with "C001" as the parameter. If the "showFolder" method returns the 
object `relay.BUBBLE`, then we continue to walk down the node tree to 
the next node with a Javascript object with a "showFolder" method.

This function returns whatever "showFolder" returns.

If the call is being made inside an object backed by an `INS` node, 
you can also make the call using this syntax: 
`this.relay("showFolder", "C001");`

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
`relay.getObjectFromNode(document.getElementById(id) || id)`.


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


Browser support
---------------
Relay works on IE6+, Firefox 1.0+, Opera 8+, Safari, iOS 4+