relay
=====

Relay is a framework for organizing Javascript applications into scoped 
modules that are tied to HTML nodes.

Relay is not a self-contained framework and does not duplicate the 
myriad of helper functions like [jQuery](http://www.jquery.com) or 
template systems like [mustache](http://mustache.github.com), which work 
fine in tandem with this framework.

Relay imposes an organization where messages are passed down the HTML 
tree to other Javascript objects, thereby eliminating the need to 
pass object references around.

Relay introduces a way, not only, for discrete objects/widgets to 
communicate with each other, but for isolated applications to 
communicate with each other.

Installation
------------

Add this to your HTML page inside the `<HEAD>` tag.

    <script src="relay.js"></script>
    <style>ins{text-decoration:none}</style>

Add this to the bottom of your page below most of your content, but 
before your `</BODY>` tag.

    <script>relay.start();</script>

Core Concepts
-------------

* Javascript objects should not be loaded/instantiated programmatically. 
They are automatically loaded when the `relay` parser finds an 
`<INS cite="js:.....">` tag that references a Javascript constructor.

* Relay will instantiate that object and store a reference to it. It 
cannot be referenced directly except through the node.

* Application objects should not reference each other directly, but 
should call each other by passing messages down the node tree.

* If a message is passed down by a node higher up in the tree and the 
current object cannot handle it (by not having a method of the same 
name), then the message is passed further down the tree until someone 
can handle it.

Example
-------

This is a fictional example of a web browser application:

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

The `relay` call does not have to be inline in the HTML, but can be 
called inside Javascript code.

Notice how there are multiple places where `go` is called, but `relay` 
knows whether to call `firefox.toolbar.go()` or `firefox.urlbar.go()`.

Syntax
------

#### `relay(functionName, [parameters,]*, thisNode)`

Example: `relay("showFolder", "C001", this);`

Walks down the node tree starting from the current node until 
it finds a Javascript object with a "showFolder" method and calls it 
with "C001" as the parameter.


#### `relay(inlineFunction, [parameters,]*, thisNode)`

Example: `relay(function() {this.showFolder();}, this);`

Walks down the node tree starting from the current node until
it find a Javascript object and calls the inline function with the 
Javascript object as the `this` scope.


#### `relay.start()` and `relay.initTree(node)`

Parses a node's children for `<INS>` tags that have objects to be 
instantiated. Or parses the document's root node.


#### `relay.byId(string)`

Gets the Javascript object that is hooked to the node with the 
specified ID attribute. The ID is retrieved using `getElementById` and 
this function is the same as calling 
`relay.getObjectFromNode(document.getElementById(id))`.
