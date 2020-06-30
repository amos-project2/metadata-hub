/* Actions of the Crawler controller

These actions must be statically rendered in the `content` method of the
calling class in order to work. Otherwise, listeners have to be added.
*/


export class Action {

    constructor(identifier, description, name) {
        this.identifier = identifier;
        this.description = description;
        this.name = name
    }

    render() {
        return `
            <div class="row mt-1 mb-1 ${this.identifier}">
                <div class="col-md-12 col-lg-8">
                    <p>${this.description}</p>
                </div>
                <div class="col-md-12 col-lg-2"></div>
                <div class="col-md-12 col-lg-2 mb-5" align="center">
                    <button
                        id="${this.identifier}-button" type="button"
                        class="btn btn-primary btn-block font-weight-bold"
                    >
                        ${this.name.toUpperCase()}
                    </button>
                </div>
            </div>
        `
    }

}
