var relay=function(f){function k(a){var c,b=f;if(c=b[a])return c;c=0;for(a=a.split(".");a[c]&&(b=b[a[c++]]););return b}function l(a,c){if(1!=c.nodeType)throw c;c._relayAppId||(c._relayAppId=++m,g[m]=a,a.relayBaseNode=c)}function i(a){"string"==typeof a&&(a=f.document.getElementById(a));return g[a._relayAppId]}function n(a,c){d(a,c,this)}function d(a,c,b){c=o.call(arguments,1);b=c.pop();if(!b||b==f)throw a;b.nodeType||(b=b.relayBaseNode||b.target||b.srcElement);var h,e;if(typeof a==j)for(;b;){if(b._relayAppId&& (e=i(b)))return a.apply(e,c)||e;b=b.parentNode}else{for(;b;){if(b._relayAppId&&(e=i(b))&&e[a])if(h=e[a].apply(e,c),h!=d.BUBBLE)return h||e;b=b.parentNode}return h}}var g={},m=1,j="function";d.start=d.initTree=function(a){if(!a||!a.nodeType)a=f.document.body||f.document.documentElement;for(var c,b,d=a.getElementsByTagName("INS"),e=0;a=d[e];e++)if(!a._relayAppId&&"js:"==(c=a.cite).substr(0,3)){c=c.substr(3);b=k(c);if(typeof b==j)b=new b(c,a);else if(typeof b.getInstance==j&&(b=b.getInstance(c,a),!b))throw c; l(b,a);b.relay||(b.relay=n)}};var o=Array.prototype.slice;d.findNestedObject=k;d.hookObjectToNode=l;d.unhookObject=function(a){var a=a.relayBaseNode||a,c=a._relayAppId;g[c].relayBaseNode=a._relayAppId=null;delete g[c]};d.byId=d.getObjectFromNode=i;d.BUBBLE={};return d}(this);