import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import './github-markdown.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import "./assets/themes/less.scss";
import "./assets/themes/erye.scss";
import "./assets/themes/github.scss";
import "./assets/themes/infoq.scss";
import "./assets/themes/list-writing.scss";
import "./assets/themes/apollo.scss";

ReactDOM.render(<MuiThemeProvider><App /></MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
