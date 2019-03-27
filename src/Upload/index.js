import React, { Fragment, Component } from 'react';
import { Upload, Icon, message, Button } from 'antd';
import Image from '../Image';
// import styles from './index.less';

const defaultImageStyle = {
  width: 128,
  height: 128,
  margin: -1,
}

class DDUpload extends Component {
  state = {
    loading: false,
  }

  beforeUpload = async file => {
    const { ext = 'image', maxSize, minSize, dim } = this.props;

    // return new Promise((resolve, reject) => {
    if (typeof ext === 'string') {
      if (ext === 'image') {
        const isImage = file.type === "image/jpeg" ||
                        file.type === "image/png" ||
                        file.type === "image/jpg" ||
                        file.type === "image/gif";
        if (!isImage) {
          message.error("只支持png、jpeg、gif格式图片");
          throw new Error('只支持png、jpeg、gif格式图片');
        }
      }
    } else if (typeof ext === 'array') {
      const match = ext.includes(file.type);
      if (!match) {
        message.error("文件格式错误");
        throw new Error('文件格式错误');
      }
    }

    if (maxSize) {
      const isGT = file.size / 1024 > maxSize;
      if (isGT) {
        message.error(`请上传${maxSize}KB以下文件`);
        throw new Error('请上传${maxSize}KB以下文件');
      }
    }

    if (minSize) {
      const isLT = file.size / 1024 > minSize;
      if (isLT) {
        message.error(`请上传${minSize}KB以上文件`);
        throw new Error('请上传${minSize}KB以上文件');
      }
    }

    if (dim) {
      const { width, height } = await this.getImageSize(file)
      if (width !== dim.width || height !== dim.height) {
        message.error(`图片尺寸为${dim.width}*${dim.height}，请重新上传`);
        throw new Error('图片尺寸为${dim.width}*${dim.height}，请重新上传');
      }
    }

    return true;
  }

  getImageSize = img => {
    return new Promise((resolve, reject) => {
      // 读取图片数据
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        // 加载图片获取图片真实宽度和高度
        const image = new Image();
        image.onload = () => {
          const { width, height } = image;
          resolve({ width, height });
        };
        image.onerror = (err) => {
          reject(err);
        };
        image.src = data;
      };
      reader.onerror = (err) => {
        reject(err);
      }
      reader.readAsDataURL(img);
    })
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }

    const { formatApi } = this.props;
    
    if (info.file.status === "done") {
      this.setState({ loading: false });
      const result = formatApi(info.file.response);
      if (result) {
        this.props.onChange(result)
      }
    } else if (info.file.status === "error") {
      this.setState({ loading: false });
      formatApi(info.file.response)
    }
  }

  render() {
    const { 
      value, 
      children, 
      listType = 'picture-card', 
      imageStyle = defaultImageStyle, 
      right,
      ...restProps
    } = this.props;
    const { loading } = this.state;

    const uploadProps = {
      name: 'file',
      listType,
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      ...restProps,
    }

    let uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    if (listType !== 'picture-card') {
      uploadButton = <Button type="primary">上传</Button>
    }

    if (listType === 'picture-card') {
      return (
        <Fragment>
          <Upload {...uploadProps} onChange={this.handleChange}>
            {value && value.full_url ? <Image src={value.full_url} style={listType === 'picture-card' ? defaultImageStyle : imageStyle} /> : uploadButton}
          </Upload>
        </Fragment>
      );
    } else {

    }
    return (
      <Fragment>
        <Upload {...uploadProps} onChange={this.handleChange}>
          {value && value.full_url ? <Image src={value.full_url} style={listType === 'picture-card' ? defaultImageStyle : imageStyle} /> : null}
          <Button type="primary" style={{ marginLeft: 8 }}>上传</Button>
          {right}
        </Upload>
      </Fragment>
    );
  }
}

export default DDUpload;