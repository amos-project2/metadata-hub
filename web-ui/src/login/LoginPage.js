import loginStyles from '../scss/logincss/login.lazy.scss3';


export class LoginPage {

    constructor(template, utilities, mountpoint) {
        this.template = template;
        this.utilities = utilities;
        this.mountpoint = mountpoint;
    }

    loadPage() {
        loginStyles.use();
        this.renderIntoMountpoint();
        $("title").html("Metadata-Hub");
        this.registerListener();
    }

    unLoadPage() {
        loginStyles.unuse();
        this.mountpoint.html("");
    }

    registerListener() {

        let thisdata=this;

        $(".login-action-button").click(function () {
            alert("blub");
            thisdata.enterMainPage();
        })
    }

    enterMainPage() {
        this.unLoadPage();
        this.template.injectinDomeAndRegisterListener(this.mountpoint);
        this.template.goToPage(this.utilities.getUrlParam("p", "form-query"));
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
                                        <input type="text" id="your-name" class="form-control" placeholder="Your-Name" required autofocus>
                                        <label for="your-name">Your-Name</label>
                                    </div>
                                    <button class="btn btn-lg btn-primary btn-block text-uppercase login-action-button" type="button">Sign in as Enduser</button>
                                    <button class="btn btn-lg btn-primary btn-block text-uppercase login-action-button" type="button">Sign in as Admin</button>
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

