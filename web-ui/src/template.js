import {Page} from "./Page";
import {Testname} from "./status/Testname";
import {GraphiqlConsole} from "./graphiql/Graphiql-console";
import {FormQueryEditor} from "./query/FormQueryEditor";
import {GraphqlQueryEditor} from "./query/GraphqlQueryEditor";
import {CrawlerConfig} from "./crawler/CrawlerConfig";
import {HashQuery} from "./query/HashQuery";

class NavElement {
    constructor(name, selectorName, contentLoader) {
        this.name = name;
        this.selectorName = selectorName
        this.contentLoader = contentLoader;
    }
}

class NavGroup {
    constructor() {
        this.parent_nav = "";
        this.data = "";
        this.navElements = [];
    }

    addOneNavElement(navElement) {

        this.data += `
            <li class="nav-item container-${this.parent_nav}" style="display:none;">
              <a class="nav-link nav-element-${navElement.selectorName}" href="#" id="nav-element-${navElement.selectorName}">${navElement.name}</a>
            </li>`;
        this.navElements.push(navElement);

    }

    addMoreNavElementsToOneGroup(dropdownName, navElementArr) {

        let tmp = "";
        for (let value of navElementArr) {
            if (value.name === "divider") {
                tmp += ` <div class="dropdown-divider"></div>`;
            } else {
                tmp += `<a class="dropdown-item nav-element-${value.selectorName}" href="#" id="nav-element-${value.selectorName}">${value.name}</a>`;
                this.navElements.push(value);
            }
        }


        this.data += `
            <li class="nav-item dropdown container-${this.parent_nav}" style="display:none;">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ${dropdownName}
              </a>
              <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">

              ${tmp}

              </div>
            </li>`


    }
}


export class Template {

    constructor(graphQlFetcher) {
        this.thisdata = this;
        this.graphQlFetcher = graphQlFetcher;
        this.storage = {
            query_inject: null,
            openedFromEditor: null,
        };
        this.data = "";
        this.navbar = "";
        this.navGroups = [];

        //constraint -> both have to be null or not null
        this.currentSelectedElement = null;
        this.currentSelectedElementGroup = null;

        let thisdata = this;

        this.addNavGroup("nav_query", function (n) {
            n.addOneNavElement(new NavElement("Form-Query", "form-query", new FormQueryEditor(thisdata, "form-query")));
            n.addOneNavElement(new NavElement("Hash Query", "hash-query", new HashQuery(thisdata, "hash-query")));
            n.addOneNavElement(new NavElement("GraphQL-Query", "graphql-query", new GraphqlQueryEditor(thisdata, "graphql-query")));

        });

        this.addNavGroup("nav_graphiql", function (n) {
            n.addOneNavElement(new NavElement("GraphiQL-Console", "graphiql-console", new GraphiqlConsole(thisdata, "graphiql-console")));
        });

        this.addNavGroup("nav_crawler", function (n) {
              n.addOneNavElement(new NavElement("Crawler Config", "crawler-config", new CrawlerConfig(thisdata, "crawler-config")));
        });


        this.addNavGroup("nav_status", function (n) {
            n.addOneNavElement(new NavElement("Testname", "testname", new Testname(thisdata, "testname")));
            n.addOneNavElement(new NavElement("Testname2", "testname2", new Page(thisdata, "testname2")));
            n.addMoreNavElementsToOneGroup("MyDropdown", [new NavElement("Testname3", "testname3", new Page(thisdata, "testname3")),
                new NavElement("Testname4", "testname4", new Page(thisdata, "testname4")),
                new NavElement("divider"),
                new NavElement("Testname5", "testname5", new Page(thisdata, "testname5"))
            ]);
            n.addOneNavElement(new NavElement("Testname6", "testname6", new Page(thisdata, "testname6")));
        });

        this.addNavGroup("nav_help", function (n) {
            n.addOneNavElement(new NavElement("help1", "help1", new Page(thisdata, "help1")));
            n.addOneNavElement(new NavElement("help1", "help2", new Page(thisdata, "help2")));
        });


        this.addNavGroup("nav_about", function (n) {
            n.addOneNavElement(new NavElement("about1", "about1", new Page(thisdata, "about1")));
            n.addOneNavElement(new NavElement("about1", "about2", new Page(thisdata, "about2")));
        });


        this.addNavGroup("nav_logout", function (n) {
            n.addOneNavElement(new NavElement("Logout", "logout", new Page(thisdata, "logout")));
        });

        this.generateTemplate()
    }


    addNavGroup(parent_nav, consumer) {
        let navGroup = new NavGroup();
        navGroup.parent_nav = parent_nav
        this.navGroups.push({name: navGroup.parent_nav, data: navGroup});
        consumer(navGroup);
        this.navbar += navGroup.data;
    }


    injectinDomeAndRegisterListener(mountElement) {
        mountElement.html(this.data);

        $("#menu-toggle").click(function (e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });

        //Register eventListener
        let thisdata = this;
        for (let value of this.navGroups) {
            for (let value2 of value.data.navElements) {
                value2.contentLoader.onRegister();
                $("#nav-element-" + value2.selectorName).click(function () {
                    $(".nav-item").removeClass("active");//remove from all

                    if (thisdata.currentSelectedElement != null) {
                        thisdata.currentSelectedElement.contentLoader.unmount();//content-unloader
                        if (thisdata.currentSelectedElementGroup !== value.data) {
                            $(".container-" + thisdata.currentSelectedElementGroup.parent_nav).hide();
                            $(".x" + thisdata.currentSelectedElementGroup.parent_nav).removeClass("active_sidebar");
                        }
                    }

                    if (thisdata.currentSelectedElementGroup !== value.data) {
                        //alert("hi "+".container-" + value.data.parent_nav);
                        $(".container-" + value.data.parent_nav).show(1000);
                        $(".x" + value.data.parent_nav).addClass("active_sidebar");
                    }


                    $(this).closest(".nav-item").addClass("active");
                    value2.contentLoader.mount();//content-unloader
                    thisdata.currentSelectedElement = value2;
                    thisdata.currentSelectedElementGroup = value.data;
                    // alert("hey: " + value2.name);
                })
            }
        }
        $(".nav-query").click(function () { $("#nav-element-form-query").trigger("click"); });
        $(".nav-graphiql").click(function () { $("#nav-element-graphiql-console").trigger("click"); });
        $(".nav-crawler").click(function () { $("#nav-element-crawler-config").trigger("click"); });
        $(".nav-status").click(function () { $("#nav-element-testname").trigger("click"); });
        $(".nav-help").click(function () { $("#nav-element-help1").trigger("click"); });
        $(".nav-about").click(function () { $("#nav-element-about1").trigger("click"); });
        $(".nav-logout").click(function () { $("#nav-element-logout").trigger("click"); });

        //  $(".container-nav_query").show(4000);

    }


    generateTemplate() {
        this.data = `<div class="d-flex" id="wrapper">

    <!-- Sidebar -->
    <div class="bg-light border-right" id="sidebar-wrapper">
      <div class="sidebar-heading">Metadata-Hub</div>
      <div class="list-group list-group-flush">
        <a href="#" class="list-group-item list-group-item-action bg-light nav-query xnav_query">Query</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-graphiql xnav_graphiql">GraphiQl</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-crawler xnav_crawler">Crawler</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-status xnav_status" style="display:none">Status</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-help xnav_help" style="display:none">Help</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-about xnav_about" style="display:none">About</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-logout xnav_logout" style="display:none">Logout</a>
      </div>
    </div>

 <!-- /#sidebar-wrapper -->

    <!-- Page Content -->
    <div id="page-content-wrapper">

      <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <button class="btn btn-primary" id="menu-toggle">Toggle Menu</button>

        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ml-auto mt-2 mt-lg-0">


           ${this.navbar}

          </ul>
        </div>
      </nav>


      <div class="container-fluid">
        <h1 class="mt-4 our-title"></h1>
        <div id="small-nav-bar"></div>
        <div id="graphql-stuff" style=" margin:0; height:calc(100vh - 150px); min-height: 300px;" class="hide_active"></div>
        <div class="our-content"></div>
        </div>
    </div>
    <!-- /#page-content-wrapper -->
  </div>
  <!-- /#wrapper -->`;
    }


}
