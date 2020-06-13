import loginStyles from '../scss/logincss/login.lazy.scss3';




export class LoginPage {

    constructor(mountpoint) {
        this.mountpoint=mountpoint;
    }

    loadPage() {
        loginStyles.use();
        this.renderIntoMountpoint();
    }

    unLoadPage() {
        loginStyles.unuse();
        this.mountpoint.html("");
    }



    //private
    renderIntoMountpoint() {

        // language=HTML
        let data= `
            <div class="container">
                <div class="row">
                    <div class="col-sm-9 col-md-7 col-lg-5 mx-auto">
                        <div class="card card-signin my-5">
                            <div class="card-body">
                                <h5 class="card-title text-center">Sign In</h5>
                                <form class="form-signin">
                                    <div class="form-label-group">
                                        <input type="text" id="your-name" class="form-control" placeholder="Your-Name" required autofocus>
                                        <label for="your-name">Your-Name</label>
                                    </div>
                                    <button class="btn btn-lg btn-primary btn-block text-uppercase" type="submit">Sign in as Enduser</button>
                                    <button class="btn btn-lg btn-primary btn-block text-uppercase" type="submit">Sign in as Admin</button>
                                    <hr class="my-4">
                                   * The Your-Name is used for to save it along possible queries you will do. It must be not System-known
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

