const cloudinary = require("../../cloudinary");
const createTestConfig = require('../testUtils/createTestConfig');
const utils = require('../../lib/utils');
const {generate_transformation_string} = require("../../lib/utils");


describe("cloudinary", function () {
  beforeEach(function () {
    cloudinary.config(createTestConfig({
      cloud_name: "test123",
      api_key: 'a',
      api_secret: 'b',
      signature_algorithm: 'sha1'
    }));
  });
  it("should use width and height from options only if crop is given", function () {
    var options, result;
    options = {
      width: 100,
      height: 100
    };
    result = generate_transformation_string(options);
    expect(result).to.eql("h_100,w_100");
    expect(options).to.eql({
      width: 100,
      height: 100
    });
    options = {
      width: 100,
      height: 100,
      crop: "crop"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({
      width: 100,
      height: 100
    });
    expect(result).to.eql("c_crop,h_100,w_100");
  });
  it("should not pass width and height to html in case of fit or limit crop", function () {
    var options, result;
    options = {
      width: 100,
      height: 100,
      crop: "limit"
    };
    result = generate_transformation_string(options);
    expect(result).to.eql("c_limit,h_100,w_100");
    expect(options).to.eql({});
    options = {
      width: 100,
      height: 100,
      crop: "fit"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("c_fit,h_100,w_100");
  });
  it("should not pass width and height to html in case angle was used", function () {
    var options, result;
    options = {
      width: 100,
      height: 100,
      crop: "scale",
      angle: "auto"
    };
    result = generate_transformation_string(options);
    expect(result).to.eql("a_auto,c_scale,h_100,w_100");
    expect(options).to.eql({});
  });
  it("should use x, y, radius, opacity, prefix, gravity and quality from options", function () {
    var options, result;
    options = {
      x: 1,
      y: 2,
      radius: 3,
      gravity: "center",
      quality: 0.4,
      prefix: "a",
      opacity: 20
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("g_center,o_20,p_a,q_0.4,r_3,x_1,y_2");
  });
  describe(":gravity", function () {
    it("should support 'ocr_text' as a value for gravity parameter", function () {
      const options = {
        gravity: "ocr_text",
        crop: "crop",
        width: 0.5
      };
      const result = generate_transformation_string(options);
      expect(result).to.eql("c_crop,g_ocr_text,w_0.5");
      expect(options).to.eql({});
    });
    it("should support 'auto:ocr_text' as a value for gravity parameter", function () {
      const options = {
        gravity: "auto:ocr_text",
        crop: "crop",
        width: 0.5
      };
      const result = generate_transformation_string(options);
      expect(result).to.eql("c_crop,g_auto:ocr_text,w_0.5");
      expect(options).to.eql({});
    });
  });
  describe(":quality", function () {
    it("support a percent value", function () {
      expect(generate_transformation_string({
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: 80,
        prefix: "a"
      })).to.eql(`g_center,p_a,q_80,r_3,x_1,y_2`);
      expect(generate_transformation_string({
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "80:444",
        prefix: "a"
      })).to.eql(`g_center,p_a,q_80:444,r_3,x_1,y_2`);
    });
    it("should support auto value", function () {
      expect(generate_transformation_string({
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "auto",
        prefix: "a"
      })).to.eql(`g_center,p_a,q_auto,r_3,x_1,y_2`);
      expect(generate_transformation_string({
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "auto:good",
        prefix: "a"
      })).to.eql(`g_center,p_a,q_auto:good,r_3,x_1,y_2`);
    });
  });
  describe(":radius", function() {
    const upload_path = 'https://res.cloudinary.com123/image/upload';
    it("should support a single value", function() {
      expect(generate_transformation_string({
        radius: 10
      })).to.eql(`r_10`);
      expect(generate_transformation_string({
        radius: '10'
      })).to.eql(`r_10`);
      expect(generate_transformation_string({
        variables: [['$v', 10]],
        radius: '$v'
      })).to.eql(`$v_10,r_$v`);
    });
    it("should support an array of values", function() {
      expect(generate_transformation_string({
        radius: [10, 20, 30]
      })).to.eql(`r_10:20:30`);
      expect(generate_transformation_string({
        variables: [['$v', 10]],
        radius: [10, 20, '$v']
      })).to.eql(`$v_10,r_10:20:$v`);
      expect(generate_transformation_string({
        variables: [['$v', 10]],
        radius: [10, 20, '$v', 40]
      })).to.eql(`$v_10,r_10:20:$v:40`);
    })
    it("should support colon separated values", function() {
      expect(generate_transformation_string({
        radius: "10:20"
      })).to.eql(`r_10:20`);
      expect(generate_transformation_string({
        variables: [['$v', 10]],
        radius: "10:20:$v:40"
      })).to.eql(`$v_10,r_10:20:$v:40`);
    })
  })
  it("should support named transformation", function() {
    var options, result;
    options = {
      transformation: "blip"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("t_blip");
  });
  it("should support array of named transformations", function () {
    var options, result;
    options = {
      transformation: ["blip", "blop"]
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("t_blip.blop");
  });
  it("should support base transformation", function () {
    var options, result;
    options = {
      transformation: {
        x: 100,
        y: 100,
        crop: "fill"
      },
      crop: "crop",
      width: 100
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({
      width: 100
    });
    expect(result).to.eql("c_fill,x_100,y_100/c_crop,w_100");
  });
  it("should support array of base transformations", function () {
    var options, result;
    options = {
      transformation: [
        {
          x: 100,
          y: 100,
          width: 200,
          crop: "fill"
        },
        {
          radius: 10
        }
      ],
      crop: "crop",
      width: 100
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({
      width: 100
    });
    expect(result).to.eql("c_fill,w_200,x_100,y_100/r_10/c_crop,w_100");
  });
  it("should not include empty transformations", function () {
    var options, result;
    options = {
      transformation: [
        {},
        {
          x: 100,
          y: 100,
          crop: "fill"
        },
        {}
      ]
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("c_fill,x_100,y_100");
  });
  it("should support size", function () {
    var options, result;
    options = {
      size: "10x10",
      crop: "crop"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({
      width: "10",
      height: "10"
    });
    expect(result).to.eql("c_crop,h_10,w_10");
  });
  it("should support background", function () {
    var options, result;
    options = {
      background: "red"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("b_red");
    options = {
      background: "#112233"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("b_rgb:112233");
  });
  it("should support default_image", function () {
    var options, result;
    options = {
      default_image: "default"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("d_default");
  });
  it("should support angle", function () {
    var options, result;
    options = {
      angle: 12
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("a_12");
  });
  it("should support effect", function () {
    var options, result;
    options = {
      effect: "sepia"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("e_sepia");
  });
  it("should support effect with param", function () {
    var options, result;
    options = {
      effect: ["sepia", 10]
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("e_sepia:10");
  });
  [
    ["overlay", "l"],
    ["underlay", "u"]
  ].forEach(([layer, short]) => {
    it(`should support ${layer}`, function () {
      var result;
      let options = {};
      options[layer] = "text:hello";
      result = generate_transformation_string(options);
      expect(options).to.eql({});
      expect(result).to.eql(`${short}_text:hello`);
    });
    it(`should not pass width/height to html for ${layer}`, function () {
      var options, result;
      options = {
        height: 100,
        width: 100
      };
      options[layer] = "text:hello";
      result = generate_transformation_string(options);
      expect(options).to.eql({});
      expect(result).to.eql(`h_100,${short}_text:hello,w_100`);
    });
  });
  it("should correctly sign api requests", function () {
    expect(utils.apiSignRequest({
      hello: null,
      goodbye: 12,
      world: "problem",
      undef: void 0
    }, "1234")).to.eql("f05cfe85cee78e7e997b3c7da47ba212dcbf1ea5");
  });
  it("should correctly sign api requests with signature algorithm SHA1", function () {
    cloudinary.config({ signature_algorithm: 'sha1' });
    expect(utils.apiSignRequest({
      username: "user@cloudinary.com",
      timestamp: 1568810420,
      cloud_name: "dn6ot3ged"
    }, "hdcixPpR2iKERPwqvH6sHdK9cyac")).to.eql("14c00ba6d0dfdedbc86b316847d95b9e6cd46d94");
  });
  it("should correctly sign api requests with signature algorithm SHA1 as default", function () {
    cloudinary.config({ signature_algorithm: null });
    expect(utils.apiSignRequest({
      username: "user@cloudinary.com",
      timestamp: 1568810420,
      cloud_name: "dn6ot3ged"
    }, "hdcixPpR2iKERPwqvH6sHdK9cyac")).to.eql("14c00ba6d0dfdedbc86b316847d95b9e6cd46d94");
  });
  it("should correctly sign api requests with signature algorithm SHA256", function () {
    cloudinary.config({ signature_algorithm: 'sha256' });
    expect(utils.apiSignRequest({
      username: "user@cloudinary.com",
      timestamp: 1568810420,
      cloud_name: "dn6ot3ged"
    }, "hdcixPpR2iKERPwqvH6sHdK9cyac")).to.eql("45ddaa4fa01f0c2826f32f669d2e4514faf275fe6df053f1a150e7beae58a3bd");
  });
  it("should correctly build signed preloaded image", function () {
    expect(utils.signed_preloaded_image({
      resource_type: "image",
      version: 1251251251,
      public_id: "abcd",
      format: "jpg",
      signature: "123515adfa151"
    })).to.eql("image/upload/v1251251251/abcd.jpg#123515adfa151");
  });
  it('should support custom function of type wasm with a source', function () {
    var options, result;
    options = {
      custom_function: { function_type: 'wasm', source: 'blur.wasm' }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_wasm:blur.wasm");
  });
  it('should support arbitrary custom function types', function () {
    var options, result;
    options = {
      custom_function: { function_type: 'amazing', source: 'awesome' }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_amazing:awesome");
  });
  it('should support custom function with no source', function () {
    var options, result;
    options = {
      custom_function: { function_type: 'wasm' }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_wasm:");
  });
  it('should support custom function with no function_type', function () {
    var options, result;
    options = {
      custom_function: { source: 'blur.wasm' }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_:blur.wasm");
  });
  it('should support custom function that is not an object', function () {
    var options, result;
    options = {
      custom_function: []
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_:");
  });
  it('should support custom function with no function_type or source', function () {
    var options, result;
    options = {
      custom_function: {}
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_:");
  });
  it('should support custom function of type remote', function () {
    var options, result;
    options = {
      custom_function: {
        function_type: 'remote',
        source:
          'https://df34ra4a.execute-api.us-west-2.amazonaws.com/default/cloudinaryFunction'
      }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_remote:aHR0cHM6Ly9kZjM0cmE0YS5leGVjdXRlLWFwaS51cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9kZWZhdWx0L2Nsb3VkaW5hcnlGdW5jdGlvbg");
  });
  it('should support custom pre function', function () {
    var options, result;
    options = {
      custom_pre_function: {
        function_type: 'remote',
        source:
          'https://df34ra4a.execute-api.us-west-2.amazonaws.com/default/cloudinaryFunction'
      }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_pre:remote:aHR0cHM6Ly9kZjM0cmE0YS5leGVjdXRlLWFwaS51cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9kZWZhdWx0L2Nsb3VkaW5hcnlGdW5jdGlvbg");
  });
  it('should generate url safe base64 in remote custom pre function', function () {
    var options, result;
    options = {
      custom_pre_function: {
        function_type: 'remote',
        source:
          "https://opengraphimg.com/.netlify/functions/generate-opengraph?author=opengraphimg&title=Hey%20Chris%20this%20is%20working"
      }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_pre:remote:aHR0cHM6Ly9vcGVuZ3JhcGhpbWcuY29tLy5uZXRsaWZ5L2Z1bmN0aW9ucy9nZW5lcmF0ZS1vcGVuZ3JhcGg_YXV0aG9yPW9wZW5ncmFwaGltZyZ0aXRsZT1IZXklMjBDaHJpcyUyMHRoaXMlMjBpcyUyMHdvcmtpbmc");
  });
  it('should support custom pre function with no function_type or source', function () {
    var options, result;
    options = {
      custom_pre_function: {}
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fn_pre::");
  });
  it("should support density", function () {
    var options, result;
    options = {
      density: 150
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("dn_150");
  });
  it("should support page", function () {
    var options, result;
    options = {
      page: 5
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("pg_5");
  });
  it("should support border", function () {
    var options, result;
    options = {
      border: {
        width: 5
      }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("bo_5px_solid_black");
    options = {
      border: {
        width: 5,
        color: "#ffaabbdd"
      }
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("bo_5px_solid_rgb:ffaabbdd");
    options = {
      border: "1px_solid_blue"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("bo_1px_solid_blue");
  });
  it("should support flags", function () {
    var options, result;
    options = {
      flags: "abc"
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fl_abc");
    options = {
      flags: ["abc", "def"]
    };
    result = generate_transformation_string(options);
    expect(options).to.eql({});
    expect(result).to.eql("fl_abc.def");
  });
  it("should correctly sign_request", function () {
    var params = utils.sign_request({
      public_id: "folder/file",
      version: "1234"
    }, {
      api_key: '1234',
      api_secret: 'b'
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234",
      signature: "7a3349cbb373e4812118d625047ede50b90e7b67",
      api_key: "1234"
    });
  });
  it("should correctly process_request_params", function () {
    var params = utils.process_request_params({
      public_id: "folder/file",
      version: "1234",
      colors: void 0
    }, {
      api_key: '1234',
      api_secret: 'b',
      unsigned: true
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234"
    });
    params = utils.process_request_params({
      public_id: "folder/file",
      version: "1234"
    }, {
      api_key: '1234',
      api_secret: 'b'
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234",
      signature: "7a3349cbb373e4812118d625047ede50b90e7b67",
      api_key: "1234"
    });
  });
  it("should not affect user variable names containing predefined names", function() {
    const options = { transformation: [
      {
        $mywidth: "100",
        $aheight: 300
      },
      {
        width: "3 + $mywidth * 3 + 4 / 2 * initialWidth * $mywidth",
        height: "3 * initialHeight + $aheight",
        crop: 'scale'
      }
    ]};
    const result = generate_transformation_string(options);
    expect(result).to.contain("$aheight_300,$mywidth_100/c_scale,h_3_mul_ih_add_$aheight,w_3_add_$mywidth_mul_3_add_4_div_2_mul_iw_mul_$mywidth");
  });
});
