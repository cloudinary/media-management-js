
const cloudinary = require("../../cloudinary");


describe("config", function () {
  let cloudinaryUrlBackup;
  let accountUrlBackup;
  let proxyBackup;

  before(function () {
    cloudinaryUrlBackup = process.env.CLOUDINARY_URL;
    proxyBackup = process.env.CLOUDINARY_API_PROXY;
  });

  after(function () {
    process.env.CLOUDINARY_URL = cloudinaryUrlBackup || '';
    process.env.CLOUDINARY_API_PROXY = proxyBackup || '';
    cloudinary.config(true);
  });


  it("should allow nested values in CLOUDINARY_URL", function () {
    process.env.CLOUDINARY_URL = "cloudinary://key:secret@test123?foo[bar]=value";
    cloudinary.config(true);
    const foo = cloudinary.config().foo;
    expect(foo && foo.bar).to.eql('value');
  });

  it("should load a properly formatted CLOUDINARY_URL", function () {
    process.env.CLOUDINARY_URL = "cloudinary://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test";
    cloudinary.config(true);
  });

  it("should not be sensitive to case in CLOUDINARY_URL's protocol", function () {
    process.env.CLOUDINARY_URL = "CLouDiNaRY://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test";
    cloudinary.config(true);
  });

  it("should throw error when CLOUDINARY_URL doesn't start with 'cloudinary://'", function () {
    process.env.CLOUDINARY_URL = "https://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test?cloudinary=foo";
    try {
      cloudinary.config(true);
      expect().fail();
    } catch (err) {
      expect(err.message).to.eql("Invalid CLOUDINARY_URL protocol. URL should begin with 'cloudinary://'");
    }
  });

  it("should not throw an error when CLOUDINARY_URL environment variable is missing", function () {
    delete process.env.CLOUDINARY_URL;
    cloudinary.config(true);
  });

  it("should support CLOUDINARY_API_PROXY environment variable", function () {
    const proxy = "https://myuser:mypass@example.com"
    process.env.CLOUDINARY_API_PROXY = proxy;
    const config = cloudinary.config(true);
    expect(config.api_proxy).to.eql(proxy)
  });

  it("should support `api_proxy` config param", function () {
    const proxy = "https://myuser:mypass@example.com"
    const config = cloudinary.config({api_proxy: proxy});
    expect(config.api_proxy).to.eql(proxy)
  });
});
