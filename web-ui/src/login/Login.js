import loginStyles from '../scss/logincss/login.lazy.scss3';
import {Template} from "../template";


export class Login {

    constructor(dependencies, mountpoint) {
        this.dependencies = dependencies
        this.config=dependencies.config;
        this.utilities = dependencies.utilities;
        this.mountpoint = mountpoint;

        if (localStorage.getItem("username") === null) {
            localStorage.setItem("username", this.config.defaultUsername);
        }

        if (localStorage.getItem("logged_in") === null) {
            localStorage.setItem("logged_in", this.config.autoLogin);
        }


        this.adminLoginVisible = "";
        if (!this.config.adminLoginEnabeled) {
            this.adminLoginVisible = "hide_active";
        }

        this.endUserLoginVisible = "";
        if (!this.config.enduserLoginEnabled) {
            this.endUserLoginVisible = "hide_active";
        }

    }


    getScope(userType) {
        let scope = [0];
        let startpage = "logout";
        if (userType === "admin") {
            if (this.config.queryConstructorEnabled) {
                scope.push(1);
                startpage = "form-query";
            }
            if (this.config.crawlerEnabled) {
                scope.push(2);
                startpage = "crawler-controller";
            }
        } else {
            if (this.config.queryConstructorEnabled) {
                scope.push(1);
                startpage = "form-query";
            }
        }
        return {scope, startpage};
    }


    loadPage() {

        let logged_in = localStorage.getItem('logged_in');
        if (logged_in === "enduser") {
            let scopeData = this.getScope("enduser");
            this.enterMainPage(scopeData.startpage, scopeData.scope);
            return;
        } else if (logged_in === "admin") {
            let scopeData = this.getScope("admin");
            this.enterMainPage(scopeData.startpage, scopeData.scope);
            return;
        }

        loginStyles.use();
        this.renderIntoMountpoint();
        $("title").html("Metadata-Hub");
        this.registerListener();

        if (localStorage.getItem("username") !== undefined) {
            $("#your-name").val(localStorage.getItem("username"));
            $("#your-name").trigger('propertychange');
        }


    }


    unLoadPage() {
        loginStyles.unuse();
        this.mountpoint.html("");
    }

    registerListener() {

        let thisdata = this;

        $(".form-signin").submit(function (e) {
            e.preventDefault();
        });

        $(".login-action-button-enduser").click(function () {
            if ($("#your-name").val().length > 2 && $(this).val().length < 21) {
                localStorage.setItem("logged_in", "enduser");
                let scopeData = thisdata.getScope("enduser");
                thisdata.saveNameAndEnterMainPage(scopeData.startpage, scopeData.scope);
            }
        });

        $(".login-action-button-admin").click(function () {
            if ($("#your-name").val().length > 2 && $(this).val().length < 21) {
                localStorage.setItem("logged_in", "admin");
                let scopeData = thisdata.getScope("admin");
                thisdata.saveNameAndEnterMainPage(scopeData.startpage, scopeData.scope);
            }
        });


        let isButtonHide = true;

        $("#your-name").on('input propertychange', function () {
            if ($(this).val().length > 2 && $(this).val().length < 21) {

                $(this).addClass("is-valid");
                $(this).removeClass("is-invalid");
                if (isButtonHide) {
                    isButtonHide = false;

                    $(".login-action-button").slideDown(2000);
                }
                //$(".login-action-button").removeClass("hide_active");

            } else {

                $(this).addClass("is-invalid");
                $(this).removeClass("is-valid");
                if (!isButtonHide) {
                    isButtonHide = true;
                    $(".login-action-button").stop(true);
                    $(".login-action-button").slideUp(1000);
                }

                //$(".login-action-button").addClass("hide_active");
            }

        });


    }

    saveNameAndEnterMainPage(defaultStartPage, usedScope) {
        localStorage.setItem("username", $("#your-name").val());
        this.enterMainPage(defaultStartPage, usedScope)
    }

    enterMainPage(defaultStartPage, usedScope) {

        let template = new Template(this.dependencies, usedScope);
        this.unLoadPage();
        template.injectinDomeAndRegisterListener(this.mountpoint);
        //this.template.goToPage(this.utilities.getUrlParam("p", "form-query"));
        template.goToPage(this.utilities.getUrlParam("p", defaultStartPage));
    }


    //private
    renderIntoMountpoint() {

        // language=HTML
        let data = `
            <div class="container">
                <div class="row">
                    <div class="col-sm-9 col-md-7 col-lg-5 mx-auto">
                        <div class="card card-signin my-5">
                            <div class="card-body">
                                <div class="text-center" style="width:100%">
                                    <img src="logo.png" alt="Metadata-Hub" style="width:180px;"> <!--style="width:240px">-->
                                    <img src="logo.png" alt="Metadata-Hub" style="width:180px;"> <!--style="width:240px">-->
                                </div>
                                <h4 class="card-title text-center font-weight-bold">Sign In</h4>
                                <form class="form-signin">
                                    <div class="form-label-group">
                                        <input type="text" id="your-name" class="form-control is-invalid" placeholder="Your-Name" autofocus>
                                        <div class="invalid-feedback">Your name must have 3 - 20 characters</div>
                                        <label for="your-name">Your-Name</label>
                                    </div>
                                    <div class="login-action-button" style="display:none">
                                        <button class="btn btn-lg btn-primary btn-block text-uppercase login-action-button-enduser ${this.endUserLoginVisible}" type="button">Sign in as Enduser</button>
                                        <button class="btn btn-lg btn-primary btn-block text-uppercase login-action-button-admin ${this.adminLoginVisible}" type="button">Sign in as Admin</button>
                                    </div>
                                    <hr class="my-4">
                                    <span class="text-secondary">* The Your-Name is used for save it along possible queries you will do. It must be not System-known.</span>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.mountpoint.html(data)

    }


}

