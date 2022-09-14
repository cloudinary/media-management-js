
const cloudinary = require("../../cloudinary");


describe("config", function () {
  let cloudinaryUrlBackup;
  let accountUrlBackup;
  let proxyBackup;

  before(function () {
    cloudinaryUrlBackup = process.env.CLD_MEDIA_MANAGEMENT;
    proxyBackup = process.env.CLOUDINARY_API_PROXY;
  });

  after(function () {
    process.env.CLD_MEDIA_MANAGEMENT = cloudinaryUrlBackup || '';
    process.env.CLOUDINARY_API_PROXY = proxyBackup || '';
    cloudinary.config(true);
  });


  it("should allow nested values in CLD_MEDIA_MANAGEMENT", function () {
    process.env.CLD_MEDIA_MANAGEMENT = "cloudinary://key:secret@test123?foo[bar]=value";
    cloudinary.config(true);
    const foo = cloudinary.config().foo;
    expect(foo && foo.bar).to.eql('value');
  });

  it("should load a properly formatted CLD_MEDIA_MANAGEMENT", function () {
    process.env.CLD_MEDIA_MANAGEMENT = "cloudinary://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test";
    cloudinary.config(true);
  });

  it("should not be sensitive to case in CLD_MEDIA_MANAGEMENT's protocol", function () {
    process.env.CLD_MEDIA_MANAGEMENT = "CLouDiNaRY://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test";
    cloudinary.config(true);
  });

  it("should throw error when CLD_MEDIA_MANAGEMENT doesn't start with 'cloudinary://'", function () {
    process.env.CLD_MEDIA_MANAGEMENT = "https://123456789012345:ALKJdjklLJAjhkKJ45hBK92baj3@test?cloudinary=foo";
    try {
      cloudinary.config(true);
      expect().fail();
    } catch (err) {
      expect(err.message).to.eql("Invalid CLD_MEDIA_MANAGEMENT protocol. URL should begin with 'cloudinary://'");
    }
  });

  it("should not throw an error when CLD_MEDIA_MANAGEMENT environment variable is missing", function () {
    delete process.env.CLD_MEDIA_MANAGEMENT;
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
