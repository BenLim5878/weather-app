import React, { Component } from 'react'

export default class PageWrapper extends Component {

    render() {
        var hscreen = "h-screen";
        var pt = "";

        if (this.props.hasNavBar) {
            pt = "pt-20"
        }

        if (this.props.hasDynamicContent) {
            hscreen = "min-h-screen"
        }
        return (
            <section className={`${this.props.style}`}>
                <div className={`relative w-4/5 mx-auto z-0 ${hscreen} ${pt}`} >
                    {this.props.children}
                </div>
            </section >
        )
    }
}

PageWrapper.defaultProps = {
    hasNavBar: true,
    hasDynamicContent: false,
    style: ""
}
