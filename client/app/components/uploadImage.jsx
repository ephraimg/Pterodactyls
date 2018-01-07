import React from 'react';
import axios from 'axios';

class UploadImage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: ''
    };
    this._handleImageChange = this._handleImageChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  _handleSubmit(e) {
    e.preventDefault();
    return axios.post('/image', { imageUrl: this.state.imagePreviewUrl })
      .then(response => this.props.getImageUrl(response.data))
      .then(() => this.props.handleSubmit())
      .then(() => Promise.resolve(this.props.changeView('home')))
      .then(() => Promise.resolve(this.props.loadHome()))
      .catch(error => console.log(error));
  }

  _handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  }

  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    }
    return (
      <div>
        <form onSubmit={this._handleSubmit}>
          <input type="file" onChange={this._handleImageChange} />
        </form>
        {$imagePreview}
        <hr></hr>
        <a href='/'>
          <button 
            className="btn btn-default" 
            onClick={this._handleSubmit}>
          Submit
          </button>
        </a>
      </div>
    );
  }

}

export default UploadImage;
