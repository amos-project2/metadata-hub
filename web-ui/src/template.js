class NavElement {
    constructor(name, selectorName, contentLoader) {
        this.name = name;
        this.selectorName = selectorName
        this.contentLoader = contentLoader;
    }
}

class NavGroup {
    constructor() {
        this.data = "";
        this.navElements = [];
    }

    addOneNavElement(navElement) {

        this.data += `
 <li class="nav-item active">
              <a class="nav-link nav-element-${navElement.selectorName}" href="#">${navElement.name}</a>
            </li>`;
        this.navElements.push(navElement);

    }

    addMoreNavElementsToOneGroup(dropdownName, navElementArr) {

        var tmp = "";
        for (let value of navElementArr) {
            if (value.name === "divider") {
                tmp += ` <div class="dropdown-divider"></div>`;
            } else {
                tmp += `<a class="dropdown-item nav-element-${value.selectorName}" href="#">${value.name}</a>`;
            }
        }


        this.data += `
            <li class="nav-item dropdown">
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

    constructor() {
        this.data = "";
        this.navbar = "";
        this.navGroups = [];

        let navGroup = new NavGroup();
        this.navGroups.push(navGroup);
        navGroup.addOneNavElement(new NavElement("Testname", "testname", function () {
        }));
        navGroup.addOneNavElement(new NavElement("Testname2", "testname2", function () {
        }));
        navGroup.addMoreNavElementsToOneGroup("MyDropdown", [new NavElement("Testname3", "testname3", function () {
        }),
            new NavElement("Testname4", "testname4", function () {
            }),
            new NavElement("divider"),
            new NavElement("Testname5", "testname5", function () {
            })

        ]);
        navGroup.addOneNavElement(new NavElement("Testname6", "testname6", function () {
        }));
        this.navbar += navGroup.data;


        this.generateTemplate()
    }

    injectinDomeAndRegisterListener(mountElement) {
        mountElement.html(this.data);

        $("#menu-toggle").click(function (e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });

        //TODO register eventListener
    }


    generateTemplate() {
        this.data = `<div class="d-flex" id="wrapper">

    <!-- Sidebar -->
    <div class="bg-light border-right" id="sidebar-wrapper">
      <div class="sidebar-heading">Start Bootstrap </div>
      <div class="list-group list-group-flush">
        <a href="#" class="list-group-item list-group-item-action bg-light nav-query">Query</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-graphiql">GraphIQl</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-crawler">Crawler</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-status">Status</a>
        <a href="#" class="list-group-item list-group-item-action bg-light nav-logout">Logout</a>
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
        <h1 class="mt-4 our-title">Simple Sidebar</h1>
        <div class="our-content">CONTENT</div>
        </div>
    </div>
    <!-- /#page-content-wrapper -->
  </div>
  <!-- /#wrapper -->`;
    }




}
