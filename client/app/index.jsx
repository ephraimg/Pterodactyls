import React from 'react';
import {render} from 'react-dom';

import axios from 'axios';
import NavBar from './components/navbar.jsx';
import PostingPage from './components/createPosts.jsx';
import FullPost from './components/fullPost.jsx';
import PostPreviewList from './components/PostPreviewList.jsx';
import PostPreview from './components/postPreview.jsx';
import SignIn from './components/signIn.jsx';
import Modal from 'react-modal';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      frontPosts: [],
      view: 'home',
      fullPost: [],
      filteredItems: [],
      filtered: false,
      user: {},
      modalIsOpen: false
    };

    this.search = this.search.bind(this);
    this.loadHome = this.loadHome.bind(this);
    this.changeView = this.changeView.bind(this);
    this.setFullPost = this.setFullPost.bind(this);
    this.isFiltered = this.isFiltered.bind(this);
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    this.loadHome();
    this.setState({
      view: 'home',
      filtered: false
    });
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    this.subtitle.style.color = '#0D89DE';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  loadHome() {
    axios.get('/home')
      .then(response => this.setState(
        { frontPosts: response.data.posts, user: response.data.user },
        () => console.log('Home page loaded!', this.state.frontPosts)
      ));
  }

  search(query) {
    let data = this.state.frontPosts.filter(item => item.title.toLowerCase().search(query) !== -1 || item.author.toLowerCase().search(query) !== -1);
    this.setState({
      filteredItems: data,
      filtered: true
    });
  }

  changeView(view) {
    this.setState({
      view: view
    });
  }

  setFullPost(post) {
    this.setState({
      fullPost: post
    });
  }

  renderView() {
    console.log('Current user is: ', this.state.user);
    const {view} = this.state;

    if (view === 'home') {
      return <PostPreviewList
        posts={this.state.frontPosts}
        changeView={this.changeView}
        setFullPost={this.setFullPost}
        filteredItems={this.state.filteredItems}
        filtered={this.state.filtered} />;
    } else if (view === 'create') {
      if (this.state.user.google_id) {
        return <PostingPage
          user={this.state.user}
          loadHome={this.loadHome}
          changeView={this.changeView} />;
      } else {
        this.setState({
          view: 'home'
        });
      }

    } else if (view === 'post') {
      return <FullPost fullPost={this.state.fullPost} />;
    }
  }

  isFiltered() {
    this.setState({
      filtered: true
    });
  }

  render () {
    return (
      <div>
        <NavBar
          user={this.state.user}
          search={this.search}
          changeView={this.changeView}
          isFiltered={this.isFiltered}
          openModal={this.openModal} />
        <br/>
        { this.renderView() }

        <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2 ref={subtitle => this.subtitle = subtitle}>Sign in to post your own story</h2>
          <SignIn />
        </Modal>
      </div>
      </div>


    );
  }
}

render(<App/>, document.getElementById('app'));
