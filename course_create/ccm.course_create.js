/**
 * @component ccm-course_create
 * @author René Müller <rene.mueller@smail.inf.h-brs.de> 2019
 * @license MIT License
 */

'use strict';

(() => {

    const component = {

        name: 'course_create',
        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-21.2.0.min.js',

        config: {
            web3: [
                'ccm.instance',
                '../web3/versions/ccm.web3-4.0.0.js'
            ],
            metamask: [
                'ccm.instance',
                '../metamask/versions/ccm.metamask-2.0.0.js'
            ],
            deploy: [
                'ccm.load',
                '../course_create/resources/deploy.js'
            ],
            html: [
                'ccm.load',
                '../course_create/resources/html.js'
            ],
            css: [
                'ccm.load',
                'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css'
            ],
            store: ['ccm.store', {'name': 'rmuel12s_courses'}]
        },

        Instance: function () {

            /* Lifecycle */

            this.init   = async () => {};
            this.ready  = async () => {};
            this.start  = async () => {

                !this.metamask.isMetaMask() && console.error ('MetaMask is required!', 'https://metamask.io/');
                !this.data.storeUrl         && console.error ('Store URL is missing!');

                this.store.url = this.data.storeUrl;

                this.web3.setProvider (this.metamask.getProvider(), { transactionConfirmationBlocks: 1 });

                this.data.contract = this.web3.eth.contract (this.deploy.abi);

                this.renderHTML();

                this.metamask.enable            (this.accountChanged);
                this.metamask.onAccountsChanged (this.accountChanged);
            };


            /* Functions */

            this.accountChanged = accounts => {

                this.data.universityAddress     = this.web3.utils.toChecksumAddress (accounts [0]);
                this.elements.university.value  = this.data.universityAddress;
            };

            this.renderHTML = () => {

                this.ccm.helper.setContent (this.element, this.ccm.helper.html (this.html, {
                    click: this.createCourse
                }));

                this.elements = {
                    university  : this.element.querySelector ('input[name=university]'),
                    courseName  : this.element.querySelector ('input[name=course-name]'),
                    spinner     : this.element.querySelector ('.spinner-border')
                };
            };

            this.toggleSpinner = () => {

                if (this.elements.spinner.classList.contains ('d-none')) {

                    this.elements.spinner.parentElement.setAttribute ('disabled', 'disabled');
                    this.elements.spinner.classList.remove ('d-none');

                } else {

                    this.elements.spinner.parentElement.removeAttribute ('disabled');
                    this.elements.spinner.classList.add ('d-none');
                }
            };

            this.isValidate = () => {

                this.elements.courseName.value ?
                    this.elements.courseName.classList.remove ('is-invalid') :
                    this.name.classList.add ('is-invalid');

                return this.elements.courseName.value && this.web3.utils.isAddress (this.data.universityAddress);
            };

            this.createCourse = () => {

                if (!this.isValidate ())
                    { return false; }

                this.toggleSpinner ();

                this.data.contract.deploy ({
                    data:       this.deploy.bytecode.object,
                    arguments:  [ this.elements.courseName.value ]
                }).send ({
                    from: this.data.universityAddress
                })
                    .then       (this.storeCourse)
                    .then       (data => alert ('Course successful created!'))
                    .catch      (console.error)
                    .finally    (this.toggleSpinner);
            };

            this.storeCourse = result => {

                return this.store.set ({
                    key         : result.options.address,
                    name        : this.elements.courseName.value,
                    students    : {}
                });
            };
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
})();
