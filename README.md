Cloudinary Media Management Node SDK
=========================
## About
The Cloudinary Media Management Node SDK allows you to quickly and easily integrate your application with Cloudinary.
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
cloudinary.uploader.upload("/home/my_image.jpg", (error, result)=>{
  console.log(result, error);
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


## Additional Resources
- [Cloudinary Transformation and REST API References](https://cloudinary.com/documentation/cloudinary_references): Comprehensive references, including syntax and examples for all SDKs.
- [MediaJams.dev](https://mediajams.dev/): Bite-size use-case tutorials written by and for Cloudinary Developers
- [DevJams](https://www.youtube.com/playlist?list=PL8dVGjLA2oMr09amgERARsZyrOz_sPvqw): Cloudinary developer podcasts on YouTube.
- [Cloudinary Academy](https://training.cloudinary.com/): Free self-paced courses, instructor-led virtual courses, and on-site courses.
- [Code Explorers and Feature Demos](https://cloudinary.com/documentation/code_explorers_demos_index): A one-stop shop for all code explorers, Postman collections, and feature demos found in the docs.
- [Cloudinary Roadmap](https://cloudinary.com/roadmap): Your chance to follow, vote, or suggest what Cloudinary should develop next. 
- [Cloudinary Facebook Community](https://www.facebook.com/groups/CloudinaryCommunity): Learn from and offer help to other Cloudinary developers.
- [Cloudinary Account Registration](https://cloudinary.com/users/register/free): Free Cloudinary account registration.
- [Cloudinary Website](https://cloudinary.com): Learn about Cloudinary's products, partners, customers, pricing, and more.


## Licence
Released under the MIT license.
