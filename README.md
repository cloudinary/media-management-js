Cloudinary Media Management JS SDK
=========================
## About
The Cloudinary Media Management JS SDK allows you to quickly and easily integrate your application with Cloudinary.
Effortlessly upload and manage your cloud's assets.

#### Note
This Readme provides basic installation and usage information.
For the complete documentation, see the [Media Management SDK Guide](https://cloudinary.com/documentation/media_management_api).

## Table of Contents
- [Version Support](#Version-Support)
- [Installation](#installation)
- [Usage](#usage)
    - [Setup](#Setup)
    - [Upload](#Upload)
- [Contributions](#Contributions)
- [Get Help](#Get Help)

## Version Support
| SDK Version     | node 14-16 |
|-----------------|------------|
| 0.1.0-beta & up | V          |


## Installation
```bash
npm install @cloudinary/media-management
```

# Usage
### Setup
```js
// Import the Cloudinary library
import cloudinary from '@cloudinary/media-management';

// Config
cloudinary.config({
  cloud_name: 'cloud_name',
  api_key: 'api_key',
  api_secret: 'api_secret'
});
```

### Upload
```js
cloudinary.uploader.upload("/home/my_image.jpg").then((result) => {
    console.log(result)
});
```

## Contributions
- Ensure tests run locally (add test command)
- Open a PR and ensure Travis tests pass


## Get Help
If you run into an issue or have a question, you can either:
- Issues related to the SDK: [Open a Github issue](https://github.com/cloudinary/media-management-js/issues).
- Issues related to your account: [Open a support ticket](https://cloudinary.com/contact)


## About Cloudinary
Cloudinary is a powerful media API for websites and mobile apps alike, Cloudinary enables developers to efficiently manage, transform, optimize, and deliver images and videos through multiple CDNs. Ultimately, viewers enjoy responsive and personalized visual-media experiences—irrespective of the viewing device.

## Licence
Released under the MIT license.
