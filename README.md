Cloudinary Media Management JS SDK
=========================
## About
The Cloudinary Media Management JS SDK allows you to quickly and easily integrate your application with Cloudinary.
Effortlessly upload and manage your cloud's assets.

## Installation
```bash
npm install @cloudinary/media-management
```

# Usage
### Setup
```js
// Require the Cloudinary library
const cloudinary = require('@cloudinary/media-management')
```

### Upload
```js
cloudinary.uploader.upload("/home/my_image.jpg").then(function (result) {
    console.log(result)
});
```
## Contributions
- Ensure tests run locally (add test command)
- Open a PR and ensure Travis tests pass


## Get Help
If you run into an issue or have a question, you can either:
- Issues related to the SDK: [Open a Github issue](https://github.com/cloudinary/cloudinary_npm/issues).
- Issues related to your account: [Open a support ticket](https://cloudinary.com/contact)


## About Cloudinary
Cloudinary is a powerful media API for websites and mobile apps alike, Cloudinary enables developers to efficiently manage, transform, optimize, and deliver images and videos through multiple CDNs. Ultimately, viewers enjoy responsive and personalized visual-media experiences—irrespective of the viewing device.

## Licence
Released under the MIT license.
