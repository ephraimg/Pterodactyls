import React from 'react';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: ''
    },
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.props.search(this.state.searchText);
      this.props.isFiltered();
    }
  }

  handleChange(e) {
    this.setState({
      searchText: e.target.value
    });
  }

  render() {
    return (<nav className='navbar navbar-inverse navbar-fixed-top app-navbar'>
      <div className="container">
        <div className="navbar-header">
          <a href="/" onClick={() => this.props.changeView('home')} className="navbar-brand">KuYiK</a>
        </div>
        <ul className="nav navbar-nav navbar-right m-r-0 hidden-xs">
          <li>
            {this.props.user.google_id ? <a href="#" onClick={() => this.props.changeView('create')}>Create a Post</a> : <a href="#" onClick={() => this.props.openModal()}>Sign In</a>}
          </li>

          <div className="navbar-form navbar-right app-search">
            <div className="form-group">
              <input
                className="form-control"
                onChange={(e) => this.handleChange(e)}
                onKeyUp={(e) => this.handleKeyUp(e)}
                placeholder="Search..">
              </input>
            </div>
          </div>
          {this.props.user.google_id
            ? <li><a href="/signout">Sign Out {this.props.user.google_name}</a></li>
            : null
          }
        </ul>
      </div>
    </nav>);
  }

}

export default NavBar;
