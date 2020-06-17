import {Page} from "./Page";
import {Testname} from "./status/Testname";
import {GraphiqlConsole} from "./graphiql/Graphiql-console";
import {FormQueryEditor} from "./query/FormQueryEditor";
import {GraphqlQueryEditor} from "./query/GraphqlQueryEditor";
import {HashQuery} from "./query/HashQuery";
import {CrawlerController} from "./crawler/CrawlerController";
import {CrawlerScheduler} from "./crawler/CrawlerScheduler";
import {ErrorPage} from "./ErrorPage";
import {Logout} from "./logout/Logout";

import {
    enable as enableDarkMode,
    disable as disableDarkMode,
    auto as followSystemColorScheme,
} from 'darkreader';


class NavElement {
    constructor(scope, name, selectorName, contentLoaderLambda) {
        this.scope = scope;
        this.name = name;
        this.selectorName = selectorName
        this.contentLoaderLambda = contentLoaderLambda;
        this.contentLoader = null;
    }

    init(templateRef) {
        this.contentLoader = this.contentLoaderLambda(templateRef); //templateRef is needed directly in the constructor, cause of dependencies
        this.contentLoader.setIdentifier(this.selectorName); //its ok initalize this a short time later
    }

}

class NavGroup {
    constructor(usedScope, name, parent_nav) {
        this.usedScope = usedScope;
        this.name = name;
        this.parent_nav = parent_nav;
        this.data = "";
        this.navElements = [];
    }

    addOneNavElement(navElement) {

        if (this.usedScope.indexOf(navElement.scope) === -1) {
            //the element is not in the usedScope, so we dont add it
            return;
        }

        // language=HTML
        this.data += `
            <li class="nav-item container-${this.parent_nav}" style="display:none;">
                <a class="my-nav-element nav-link nav-element-${navElement.selectorName}" href="/${navElement.selectorName}" id="nav-element-${navElement.selectorName}">${navElement.name}</a>
            </li>`;
        this.navElements.push(navElement);

    }

    addMoreNavElementsToOneGroup(dropdownName, navElementArr) {

        let tmp = "";
        for (let value of navElementArr) {

            if (this.usedScope.indexOf(value.scope) === -1) {
                //the element is not in the usedScope, so we dont add it
                continue;
            }

            if (value.name === "divider") {
                tmp += ` <div class="dropdown-divider"></div>`;
            } else {
                tmp += `<a class="dropdown-item my-nav-element nav-element-${value.selectorName}" href="/${value.selectorName}" id="nav-element-${value.selectorName}">${value.name}</a>`;
                this.navElements.push(value);
            }
        }

        // language=HTML
        this.data += `
            <li class="nav-item dropdown container-${this.parent_nav}" style="display:none;">
                <a class="my-nav-element nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${dropdownName}
                </a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">

                    ${tmp}

                </div>
            </li>`
    }

    firstElement() {
        if (this.navElements.length === 0) return null;
        return this.navElements[0];
    }
}


export class Template {

    /**
     *
     * JavaScript dont have static const in ES6, maybe in the next version, so i stick to just and not so nice integers
     *
     * scope = 0 -> not-crawler- ,not-query-constructor- related-stuff, like the about/help-section
     * scope = 1 -> query-constructor-related
     * scope = 2 -> crawler-related
     * scope = 3 -> unready functionality
     */


    constructor(dependencies, usedScope) {
        // this.thisdata = this;
        this.dependencies = dependencies;
        this.config=dependencies.config;
        this.usedScope = usedScope;
        this.storage = {
            query_inject: null,
            openedFromEditor: null,
        };
        this.data = "";
        this.navsidebar = "";
        this.navbar = "";
        this.navGroups = [];
        this.parentNavCounter = 0;

        //constraint -> both have to be null or not null
        this.currentSelectedElement = null;
        this.currentSelectedElementGroup = null;

        //this.errorPage = new ErrorPage(this, "error-404")

        this.replaceState = false;


        // let thisdata = this;

        this.addNavGroup(0, null, n => {
            n.addOneNavElement(new NavElement(0, "Error 404", "error-404", t => {return new ErrorPage(t);}));

        });


        this.addNavGroup(1, "Query", n => {
            n.addOneNavElement(new NavElement(1, "Form-Query", "form-query", t => {return new FormQueryEditor(t)}));
            n.addOneNavElement(new NavElement(1, "Hash Query", "hash-query", t => {return new HashQuery(t)}));
            n.addOneNavElement(new NavElement(1, "GraphQL-Query", "graphql-query", t => {return new GraphqlQueryEditor(t)}));

        });

        this.addNavGroup(1, "GraphiQL", n => {
            n.addOneNavElement(new NavElement(1, "GraphiQL-Console", "graphiql-console", t => {return new GraphiqlConsole(t)}));
        });

        this.addNavGroup(2, "Crawler", n => {
            n.addOneNavElement(new NavElement(2, "Controller", "crawler-controller", t => {return new CrawlerController(t)}));
            n.addOneNavElement(new NavElement(2, "Scheduler", "crawler-scheduler", t => {return new CrawlerScheduler(t)}));
        });


        this.addNavGroup(3, "status", n => {
            n.addOneNavElement(new NavElement(3, "Testname", "testname", t => {return new Testname(t)}));
            n.addOneNavElement(new NavElement(3, "Testname2", "testname2", t => {return new Page(t)}));
            n.addMoreNavElementsToOneGroup("MyDropdown", [
                new NavElement(3, "Testname3", "testname3", t => {return new Page(t)}),
                new NavElement(3, "Testname4", "testname4", t => {return new Page(t)}),
                new NavElement(3, "divider"),
                new NavElement(3, "Testname5", "testname5", t => {return new Page(t)})
            ]);
            n.addOneNavElement(3, new NavElement(3, "Testname6", "testname6", t => {return new Page(t)}));
        });

        this.addNavGroup(3, "Help", n => {
            n.addOneNavElement(new NavElement(3, "help1", "help1", t => {return new Page(t)}));
            n.addOneNavElement(new NavElement(3, "help1", "help2", t => {return new Page(t)}));
        });


        this.addNavGroup(3, "About", n => {
            n.addOneNavElement(new NavElement(3, "about1", "about1", t => {return new Page(t)}));
            n.addOneNavElement(new NavElement(3, "about1", "about2", t => {return new Page(t)}));
        });


        this.addNavGroup(0, "Logout", n => {
            n.addOneNavElement(new NavElement(0, "Logout", "logout", t => {return new Logout(t)}));
        });

        this.generateTemplate();
    }


    addNavGroup(scope, name, consumer) {

        if (this.usedScope.indexOf(scope) === -1) {
            //the navGroup is not in the usedScope, so we dont add it
            return;
        }

        this.parentNavCounter++;
        let parent_nav = "pn_" + this.parentNavCounter;

        let navGroup = new NavGroup(this.usedScope, name, parent_nav);
        //navGroup.parent_nav = parent_nav
        this.navGroups.push({name: navGroup.parent_nav, data: navGroup});
        consumer(navGroup);

        for (let value of navGroup.navElements) {value.init(this);}


        this.navbar += navGroup.data;

        if (name != null && navGroup.firstElement() != null) {

            this.navsidebar += `<a href="/${navGroup.firstElement().selectorName}" class="list-group-item list-group-item-action bg-light my-nav-element y${parent_nav} x${parent_nav}">${name}</a>`;
            //this.navsidebar + `<a href="/form-query" class="list-group-item list-group-item-action bg-light my-nav-element nav-query xnav_query">Query</a>`;
        }

    }


    injectinDomeAndRegisterListener(mountElement) {
        mountElement.html(this.data);


        let thisdata = this;

        $("#menu-toggle").click(function (e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });

        $("#dark-white-toggler").change(function () {
            if (this.checked) {
                thisdata.dependencies.styles.dark.use();

                enableDarkMode({
                    brightness: 100,
                    contrast: 90,
                    sepia: 10,
                });
                localStorage.setItem("darkmode", "true");


            } else {
                thisdata.dependencies.styles.dark.unuse();
                disableDarkMode();
                localStorage.removeItem("darkmode");
            }
        });

        if (localStorage.getItem("darkmode") === "true") {
            $("#dark-white-toggler").trigger("click");
        }


        //Register eventListener
        // let thisdata = this;
        for (let value of this.navGroups) {

            //it is similar to this:  $(".nav-query").click(function () { $("#nav-element-form-query").trigger("click"); });
            $(`.x${value.data.parent_nav}`).click(function () {
                $(`#nav-element-${value.data.firstElement().selectorName}`).trigger("click");
            });

            for (let value2 of value.data.navElements) {
                value2.contentLoader.onRegister();
                $("#nav-element-" + value2.selectorName).click(function (event) {
                    $(".nav-item").removeClass("active");//remove from all

                    if (thisdata.currentSelectedElement != null) {
                        thisdata.currentSelectedElement.contentLoader.unmount();//content-unloader
                        if (thisdata.currentSelectedElementGroup !== value.data) {
                            $(".container-" + thisdata.currentSelectedElementGroup.parent_nav).hide();
                            $(".x" + thisdata.currentSelectedElementGroup.parent_nav).removeClass("active_sidebar");
                        }
                    }

                    if (thisdata.currentSelectedElementGroup !== value.data) {
                        if (thisdata.config.pageChangeAnimation) {
                            $(".container-" + value.data.parent_nav).show(1000);
                        } else {
                            $(".container-" + value.data.parent_nav).show(1);
                        }

                        $(".x" + value.data.parent_nav).addClass("active_sidebar");
                    }


                    $(this).closest(".nav-item").addClass("active"); //for this "this" i need the redirect trigger
                    if (thisdata.replaceState) {
                        thisdata.replaceState = false;
                        history.replaceState('no-data', value2.contentLoader.title, '?p=' + value2.selectorName);
                    } else {
                        history.pushState('no-data', value2.contentLoader.title, '?p=' + value2.selectorName);
                    }
                    value2.contentLoader.mount();//content-loader
                    thisdata.currentSelectedElement = value2;
                    thisdata.currentSelectedElementGroup = value.data;
                })
            }
        }

        $(".my-nav-element").click(function (event) {event.preventDefault();})

        window.onpopstate = function (event) {
            let page = thisdata.dependencies.utilities.getUrlVars()["p"];
            thisdata.goToPage(page);
        };
    }

    goToPage(page) {
        // alert(page);
        this.replaceState = true;
        for (let value of this.navGroups) {
            for (let value2 of value.data.navElements) {
                if (value2.selectorName === page) {
                    $("#nav-element-" + value2.selectorName).trigger("click");
                    return;
                }
            }
        }

        $("#nav-element-error-404").trigger("click");
    }


    generateTemplate() {

        // language=HTML
        this.data = `
            <div class="d-flex" id="wrapper">

                <!-- Sidebar -->
                <div class="bg-light border-right" id="sidebar-wrapper">
                    <div class="sidebar-heading" style="padding:0px;">
                        <img src="logo.png"  alt="Metadata-Hub" style="width:240px">
                    </div>

                    <div class="list-group list-group-flush">
                        ${this.navsidebar}
                    </div>

                    <div style="margin:12px;" class="text-info text-center">
                        Logged in as <b>${localStorage.getItem("username")}</b><br><span style="text-uppercase">[${localStorage.getItem("logged_in")}]</span>
                    </div>


                </div>

                <!-- /#sidebar-wrapper -->

                <!-- Page Content -->
                <div id="page-content-wrapper">

                    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                        <button class="btn btn-primary" id="menu-toggle">Toggle Menu</button>

                        <div class="custom-control custom-switch" style="margin-left:20px;">
                            <input type="checkbox" class="custom-control-input" id="dark-white-toggler">
                            <label class="custom-control-label" for="dark-white-toggler">Dark-Mode</label>
                         </div>

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
