import React, { Component } from "react";
import { Card } from "material-ui/Card";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import Snackbar from "material-ui/Snackbar";
import DropDownMenu from 'material-ui/DropDownMenu';

import TextField from "material-ui/TextField";

import fs from "fs";
import marked from "marked";

const ipc = require("electron").ipcRenderer;
const shell = require("electron").shell;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      open: false,
      history: [],
      message: false,
      value: '',
      show: false,
      className: 'github'
    };
  }

  shouldComponentUpdate(nextProps, nextState) {

    return nextState.data === this.state.data || nextState.className === this.state.className
  }

  componentWillMount() {
    localStorage.user = ''
    let { history, user } = localStorage;
    this.setState({ value: user, show: !!user })
    this.setState({ history: history ? JSON.parse(history) : [] });
    document.addEventListener("drop", e => {
      e.preventDefault();
      e.stopPropagation();

      for (let f of e.dataTransfer.files) {
        this.openFile(f.path);
      }
    });
    document.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  componentDidUpdate() {

    const links = document.querySelectorAll("a[href]");

    Array.prototype.forEach.call(links, function (link) {
      const url = link.getAttribute("href");
      if (url.indexOf("http") === 0) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          shell.openExternal(url);
        });
      }
    });
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  handleClose = p => {
    this.setState({ open: false });
    this.openFile(p);
  };

  openFile = p => {
    fs.readFile(p, "utf-8", (err, data) => {
      this.setState({ data: marked(data) });
      this.add(String(p));
    });
  };

  add(str) {
    let { history } = this.state;
    let index = history.findIndex(val => val.path === str);
    let parttern = /[\w.]+$/;
    let name = str.match(parttern)[0];
    let o = {
      path: str,
      name: name
    };
    if (!/\.md$/.test(name)) {
      this.setState({ message: true });
    } else {
      history.unshift(index >= 0 ? history.splice(index, 1)[0] : o);
      this.setState({ history });
      localStorage["history"] = JSON.stringify(history);
    }
  }

  open = () => {
    ipc.send("open-file-dialog");
    ipc.once("selected-directory", (event, p) => {
      this.openFile(p[0]);
    });
  };

  handleRequestClose = () => {
    this.setState({ message: false });
  }

  clear = () => {
    localStorage.clear();
    this.setState({ history: [] });
  }

  nameChage = event => {
    this.setState({
      value: event.target.value,
    });
  }

  keyup = event => {
    if (event.keyCode === 13) {
      localStorage['user'] = this.state.value
      this.setState({ show: true })
    }
  }

  changeTheme = (event, child) => {
    this.setState({ className: child.props.primaryText })
  }

  handleChange = (event, index, className) => this.setState({ className });

  render() {
    const { data, history, value, show, className } = this.state;
    return (
      <div className="App">
        {!show
          ? <div style={{ width: 800, margin: '200px auto' }}>
            <h2>请输入你的尊姓大名</h2>
            <TextField
              value={value}
              hintText="what is your name ？ 你叫啥 ？"
              onChange={this.nameChage}
              fullWidth={true}
              onKeyUp={this.keyup}
            />
          </div>
          : <div>
            <div style={{ width: 800, margin: "5px auto" }}>
              <RaisedButton
                backgroundColor="#a4c639"
                label="打开文件"
                onClick={this.open}
                labelColor="rgb(255,255,255)"
                style={{ marginRight: 20 }}
              />
              <RaisedButton
                label="查看历史"
                onClick={this.handleToggle}
                style={{ marginRight: 20 }}
              />
              <RaisedButton label="清空历史记录" onClick={this.clear} />
              <DropDownMenu value={this.state.className} onChange={this.handleChange} style={{ verticalAlign: 'bottom' }}>
                <MenuItem value={"github"} primaryText="github" />
                <MenuItem value={"apollo"} primaryText="apollo" />
                <MenuItem value={"erye"} primaryText="erye" />
                <MenuItem value={"infoq"} primaryText="infoq" />
                <MenuItem value={"less"} primaryText="less" />
              </DropDownMenu>
              <span style={{ float: "right" }}>欢迎你，{value}</span>
              <Drawer
                docked={false}
                width={200}
                open={this.state.open}
                onRequestChange={open => this.setState({ open })}
              >
                {history.map((val, key) => {
                  return (
                    <MenuItem
                      onClick={() => this.handleClose(val.path)}
                      key={key}
                    >
                      <div>{val.name}</div>
                      <div className="menu-list-small">{val.path}</div>
                    </MenuItem>
                  );
                })}
              </Drawer>
            </div>
          </div>
        }
        {show && <Card style={{ width: 800, margin: "0 auto 20px", padding: "20px" }}>
          {!data && <p>请打开文件</p>}
          <div className={className} dangerouslySetInnerHTML={{ __html: data }} />
        </Card>
        }

        <Snackbar
          open={this.state.message}
          message="文件格式错误"
          autoHideDuration={2000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default App;
