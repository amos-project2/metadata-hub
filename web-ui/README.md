# HOWTO BUILD

1. Make sure, you have nodeJs and npm installed
2. Then go into the web-ui folder and do the following

```console
$ npm install
$ npm run build
```

3. In the folder ./dist are then the output

4. Open in then in ./ the index.html and enjoy^^


#### Informations about my webpack and Bootstrap

https://webpack.js.org/

https://getbootstrap.com/docs/4.0/getting-started/webpack/

https://stevenwestmoreland.com/2018/01/how-to-include-bootstrap-in-your-project-with-webpack.html


#### Howto build in combination with the server

Each time you do a maven package/compile/..., maven would call the nodeJs webpack module
and let it bundle it into the resource-folder, which goes in the last step to the jar-file.

You will see, each time you do a maven compile, it needs a lot of time. Time that you dont want to wait, if
you change something in web-ui and want to test.

There is third option, that you can webpack build into to the target-directory.
You start the Server. Each time you change something in the web-ui, you only have to call the specific
npm webpack command. The Server looks (if you start it in your IDEA) in that folder for the web stuff.
It works, cause the Server dont cache it.

Go into the webui-folder, there you have the following commands
```console
npm run build  //this command bundles the output to ./dist
npm run dev-build //this command is used by maven to bundle to ressource/file-static
npm run runtime-build //this command you can use, if the server is in the IDEA started and you want to hot-reload
```

#### How you can extend web-ui

I wrote a small framework for this, so that we can split the pages into different files.
Webpack bundles it to a Single-page-application.

There is a template.js file. Here you must hook in your pages.

```javascript
 this.addNavGroup("nav_crawler", function (n) {
    n.addOneNavElement(new NavElement("crawler1", "crawler1", new BigCrawler("crawler1")));
    n.addOneNavElement(new NavElement("crawler2", "crawler2", new SmallCrawler("crawler2")));
 });
```

so there you can add more n.addOneN.... Give it a name, a unique-id (it should be a string), new-Statement of the class (with that unique_id) in that the page is.

One more example:

```javascript
 this.addNavGroup("nav_status", function (n) {
    n.addOneNavElement(new NavElement("Testname", "testname", new Testname("testname")));
    n.addOneNavElement(new NavElement("Testname2", "testname2", new Page("testname2")));
    n.addMoreNavElementsToOneGroup("MyDropdown", [new NavElement("Testname3", "testname3", new Page("testname3")),
        new NavElement("Testname4", "testname4", new Page("testname4")),
        new NavElement("divider"),
        new NavElement("Testname5", "testname5", new Page("testname5"))
    ]);
    n.addOneNavElement(new NavElement("Testname6", "testname6", new Page("testname6")));
});
```

here with a dropdown list. You also can see here the new Page(...). The Page-Class is the base-Class of all sub-Classes, like the BigCrawler-Class

So how you should create the sub-classes. They must extend Page and override a few methods.
In The constructor-body of the new class you can set a few attributes, like caching-behaviour

```javascript
import {Page} from "../Page";

export class FormQueryEditor extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Form Query Editor";
        //here you set the title-attribut
        //you can here also set the caching_behavour and much more
        //take a look in class Page
    }

    content() {
        return `nothing rigth now`;
        //here you can return back the html content which should be shown
    }

    onMount() {
        //here you can register event-listener
        //for example: $(".hallo").click(function() {alert("asdf");});
        //which alerts asdf each time you click on any html element with the class hallo

        //$("#hallo") this here would select not classes but one html-elemnt with id=hallo
    }

    onUnMount() {
        //often you dont need that method
    }

    onRegister() {
        //often you dont need that method
    }

    onFirstLoad() {
        //this method is called on the first-load
    }

    onLoad() {
        //this method is called on each load
    }

    onUnLoad() {
        //this method is called on each unload
    }


}
```
here you see a example, how you can subclass from Page.

Don't forget to add the imports in all files and use the export-keyword.

**Caching:**

```javascript

 /**
 * level = 0 -> no cache
 * level = 1 -> cache into javascript-memory, but remove from dome + onUnMountCall()
 * level = 2 -> cache, dont remove from dome + hide() + onUnMountCall()
 * level = 3 -> cache, dont remove from dome + hide() + no onMount()-call, if cache have data + no onUnMountCall()
 */

    //this variable you should override in the subclasses, to adjust the cache-behaviour
    this.cacheLevel = 0;



    //you also can call in the subclasses the following methods, to clear the cache
    super.clearCache();

    //and reload a fresh site
    super.reload();

```

**Check if there is no Code error:**

webpack doesnt show so much errors. So for now you only can find them
if you start the page in the browser. Take a look in the developer-console (F12 in chrome)
for debugging you also can use
```javascript
alert(variable);
console.log(variable); //here you get more informations into the console
```

You should take a look in Jquery: https://api.jquery.com/

One last note: JavaScript and the problem with this:

```javascript
let thisdata=this;
//here thisdata is of course equal to this

$(".my-html-class-xy").click(function(){
    //here in that function it isnt
    //so if you need state from extern, then you should use thisdata
    //cause this points in that function to something else
});
```

