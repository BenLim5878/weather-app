import React, { Component } from 'react';
import Head from 'next/head';

export default class Page extends Component {

    constructor() {
        super()
        this.state = {
            background: "index-background"
        }
    }

    componentDidMount() {
        if (this.props.isBackgroundTransparent) {
            this.setState({
                background: "transparent-background"
            })
        }
    }

    render() {
        return (
            <>
                <Head>
                    <title>WeatherOutlook™</title>
                    <link rel="icon" href="/app-favicon.svg" />
                </Head>
                <main className={`w-full h-fit min-h-screen ${this.props.className} ${this.state.background} overflow-hidden`}>
                    {this.props.children}
                </main>
            </>

        )
    }
}
