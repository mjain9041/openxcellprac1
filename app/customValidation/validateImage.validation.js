const path = require('path')

exports.validateImage = function (value) {
    if (value == null) {
      throw new Error('Property image is required');
    } else if (value['property_pics[]'].length > 5) {
      throw new Error("Property image can't be greater then 5");
    } else {
      let isImage = true
      for (i = 0; i < value['property_pics[]'].length; i++) {
        let extension = (path.extname(value['property_pics[]'][i].name)).toLowerCase();
        if (extension != '.jpg' && extension != '.jpeg' && extension != '.png') {
          isImage = false
          break
        }
      }
      if (!isImage) {
        throw new Error('Property image must be image(Ex: jpg, jpeg, png)');
      }
    }
    return true
  }