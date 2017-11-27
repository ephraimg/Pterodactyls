import React from 'react';
import axios from 'axios';
import UploadImage from './uploadImage.jsx';

const devStyle = {
  border: '1px solid black',
  padding: '2px',
  margin: '2px'
};

/* expected props:
   user, eventually, but for now we have the user type their name
*/

class PostingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authorInputText: '',
      locationInputText: '',
      titleInputText: '',
      subtitleInputText: '',
      mainInputText: '',
      imageUrl: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getImageUrl = this.getImageUrl.bind(this);
  }

  handleChange(e) {
    let key = e.target.name + 'InputText';
    this.setState({
      [key]: e.target.value
    });
  }

  handleSubmit() {
    let newPost = {
      author: this.state.authorInputText,
      location: this.state.locationInputText,
      title: this.state.titleInputText,
      subtitle: this.state.subtitleInputText,
      main: this.state.mainInputText,
      pics: this.state.imageUrl
    };
    console.log(newPost);
    axios.post('/posts', newPost);
  }

  getImageUrl(url) {
    this.setState({
      imageUrl: url
    });
  }

  render() {
    return (
      <div className="container-fluid container-fill-height">
        <div className="container-content-middle">
          <div className="m-x-auto text-center app-login-form signup-user">
            <h1>Tell Your Story, {this.props.user.google_name}</h1>
            <form className="form-group">
              <input name="author"
                className="form-control"
                value={this.props.user.google_name}
                onChange={e => this.handleChange(e)}>
              </input>
              <br></br>
              <input name="location"
                placeholder="Location"
                className="form-control"
                onChange={e => this.handleChange(e)}>
              </input>
              <br></br>
              <input name="title"
                placeholder="Title"
                className="form-control"
                onChange={e => this.handleChange(e)}>
              </input>
              <br></br>
              <input name="subtitle"
                placeholder="Subtitle"
                className="form-control"
                onChange={e => this.handleChange(e)}>
              </input>
              <br></br>
              <textarea name="main"
                placeholder="Your Story"
                className="form-control"
                onChange={e => this.handleChange(e)}>
              </textarea>
            </form>
            <footer className="screen-login">
              <UploadImage
                getImageUrl={this.getImageUrl}
                handleSubmit={this.handleSubmit}
                loadHome={this.props.loadHome}
                changeView={this.props.changeView} />
            </footer>
          </div>
        </div>
      </div>
    );
  }
}

export default PostingPage;
