import React from 'react';
import App, { Container } from 'next/app';
import Router from 'next/router';
import { NamespacesConsumer } from 'react-i18next';
import i18n from '../i18n';
import languagePathCorrection from '../lib/languagePathCorrection';
import { translation } from '../config';

import withApolloClient from '../lib/with-apollo-client'
import { ApolloProvider } from 'react-apollo'


const { enableSubpaths } = translation;

if (enableSubpaths) {
  Router.events.on('routeChangeStart', originalRoute => {
    const correctedPath = languagePathCorrection(originalRoute);
    if (correctedPath !== originalRoute) {
      Router.replace(correctedPath, correctedPath, { shallow: true });
    }
  });

  i18n.on('languageChanged', lng => {
    if (process.browser) {
      const originalRoute = window.location.pathname;
      const correctedPath = languagePathCorrection(originalRoute, lng);
      if (correctedPath !== originalRoute) {
        Router.replace(correctedPath, correctedPath, { shallow: true });
      }
    }
  });
}

// Using _app with translated content will give a warning:
// Warning: Did not expect server HTML to contain a <h1> in <div>.
// not sure - did neither find something wrong - nor seems the warning to make sense
class MyApp extends App {

  static async getInitialProps({ ctx }) {
    return {
      initialLanguage: ctx.req.language ?
        ctx.req.language : translation.defaultLanguage
    };
  };

  render() {
    const { Component, pageProps, initialLanguage, apolloClient } = this.props;

    return (
      <Container>
        <NamespacesConsumer
          {...pageProps}
          ns="common"
          i18n={(pageProps && pageProps.i18n) || i18n}
          wait={process.browser}
          initialLanguage={initialLanguage}
        >
          {t => (
            <React.Fragment>
              <h1>{t('common:integrates_react-i18next')}</h1>
              <button
                type="button"
                onClick={() => {
                  i18n.changeLanguage(i18n.languages[0] === 'en' ? 'de' : 'en');
                }}
              >
                Change locale
              </button>
              <ApolloProvider client={apolloClient}>
                <Component {...pageProps} />
              </ApolloProvider>
            </React.Fragment>
          )}
        </NamespacesConsumer>
      </Container>
    );
  }
}

export default withApolloClient(MyApp)



// BEGIN - BEFORE TRYING TO MERGE IN i18next. Performs a Server Side Render of GraphQL data fine.
/*
import App, {Container} from 'next/app'
import React from 'react'
import withApolloClient from '../lib/with-apollo-client'
import { ApolloProvider } from 'react-apollo'

class MyApp extends App {
  render () {
    const {Component, pageProps, apolloClient} = this.props
    return <Container>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </Container>
  }
}

export default withApolloClient(MyApp)
*/