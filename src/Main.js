import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import MyLocalize from './modules/Localize';

// import routes from './routes.js';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'

import Base from './components/Base.jsx';
import LoginPage from './containers/LoginPage.jsx';
import LogoutFunction from './containers/LogoutFunction.jsx';
import SignUpPage from './containers/SignUpPage.jsx';
import DashboardPage from './containers/DashboardPage.jsx';
import LegendsPage from './containers/LegendsPage.jsx';
import PdfInfoPage from './containers/PdfInfoPage.jsx';
import HomePage from './containers/HomePage.jsx';
import Auth from './modules/Auth';
import PdfPage from './containers/PdfPage';
import AboutPage from './containers/AboutPage.jsx';

import './style/css3-github-ribbon.css';

import { initws } from './WebSocket'
let ws = initws();

// remove tap delay, essential for MaterialUI to work properly
injectTapEventPlugin();

console.log('version:1.5');

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    Auth.isUserAuthenticated() ? (
      <Component {...props} {...rest} />
    ) : (
      <Redirect to={{
        pathname: '/',
        state: { from: props.location }
      }}/>
    )
  )}/>
)

const LoggedOutRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    Auth.isUserAuthenticated() ? (
      <Redirect to={{
        pathname: '/',
        state: { from: props.location }
      }}/>
    ) : (
      <Component {...props} {...rest} />
    )
  )}/>
)

const PropsRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    <Component {...props} {...rest} />
  )}/>
)

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false
    }
  };

  componentDidMount() {
    // check if user is logged in on refresh
    this.toggleAuthenticateStatus()
  }

  toggleAuthenticateStatus() {
    // check authenticated status and toggle state based on that
    this.setState({ authenticated: Auth.isUserAuthenticated() })
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Router>
          <div>
            <div className="top-bar">
              <div className="top-bar-left">
                <Link to="/">Annotation PDF tool</Link>
                <a href="https://github.com/var-mar/pdf-annotation-tool" class="github-ribbon">
                  Fork me on GitHub
                </a>
              </div>
              {this.state.authenticated ? (
                <div className="top-bar-right">
                  <Link to="/dashboard">{MyLocalize.translate('Dashboard')}</Link>
                  <Link to="/about">{MyLocalize.translate('About')}</Link>
                  <Link to="/logout">{MyLocalize.translate('Log out')}</Link>
                </div>
              ) : (
                <div className="top-bar-right">
                  <Link to="/login">{MyLocalize.translate('Log in')}</Link>
                  <Link to="/signup">{MyLocalize.translate('Sign up')}</Link>
                  <Link to="/about">{MyLocalize.translate('About')}</Link>
                </div>
              )}

            </div>

            <PropsRoute exact path="/" component={HomePage} toggleAuthenticateStatus={() => this.toggleAuthenticateStatus()} />
            <PrivateRoute path="/dashboard" component={DashboardPage}/>
            <PrivateRoute path="/legends" component={LegendsPage}/>
            <PrivateRoute path="/pdf" component={PdfPage}/>
            <PrivateRoute path="/pdfInfo" component={PdfInfoPage}/>
            <LoggedOutRoute path="/login" component={LoginPage} toggleAuthenticateStatus={() => this.toggleAuthenticateStatus()} />
            <LoggedOutRoute path="/signup" component={SignUpPage}/>
            <PropsRoute path="/about" component={AboutPage}/>
            <Route path="/logout" component={LogoutFunction}/>
          </div>

        </Router>
      </MuiThemeProvider>
    );
  }
}

export default Main;
