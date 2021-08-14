const Joi = require('joi');

const validateRegistration = (data) => {
  return Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().required(), //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    account_status: Joi.string().valid('admin').valid('user').optional()
  })
    .options({ abortEarly: false })
    .validate(data);
};

const validateLogin = (data) => {
  return Joi.object({
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().required() //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  })
    .options({ abortEarly: false })
    .validate(data);
};

module.exports.validateRegistration = validateRegistration;
module.exports.validateLogin = validateLogin;
