'use strict';

import $ from 'jquery';

import CNF from './cnf';

// let noti = require('../alert').default;
let noti = {
    error: err => {
        console.info('Err:', err);
    },
};
// let hbsAlertErrorHttp = require('../../hbs/alert-error-http.hbs');
let hbsAlertErrorHttp = context => {
    return `HTML ALERT`;
};
// var hbsAlertErrorValidation = require('../../hbs/alert-error-validation.hbs');
var hbsAlertErrorValidation = context => {
    return `HTML ALERT Validation`;
};

let fn = {
    isXHR: xhr => {
        // NOTE: Work on jQuery+3.0
        let isXHR = xhr.done && typeof xhr.done === 'function'
            && xhr.fail && typeof xhr.fail === 'function'
            && xhr.always && typeof xhr.always === 'function';
        return isXHR;
    },
    schema: {
        transform: obj => {
            let res = [];
            obj.data.map((x,i) => {
                res.push(fn.schema._get(obj.schema, x));
                return x;
            });
            return res;
        },
        _get: (schema, data, key=null) => {
            let res = data.u;
            if (!res) {
                data.u = {};
                for (var i = 0; i < schema.length; i++) {
                    let k = schema[i];
                    data.u[k] = data[i];
                }
            }
            return key === null? data.u: data.u[key];
        },
    },
    extra: {
        set: (extraFnName, xhr) => {
            if (fn.isXHR(xhr)) {
                xhr[extraFnName] = function(cb) {
                    if (xhr.readyState === 4) {
                        let res = xhr[extraFnName]._res;
                        if (extraFnName === 'then' && res && res.success) {
                            cb(res.data);
                        } else if (extraFnName === 'catch' && res && !res.success) {
                            cb(res);
                        }
                        return xhr;
                    }
                    xhr[extraFnName].callbacks.push(cb);
                    return xhr;
                };
                xhr[extraFnName].callbacks = [];
            }
        },
        get: (extraFnName, xhr, res) => {
            if (fn.isXHR(xhr)) {
                for (var i = 0; i < xhr[extraFnName].callbacks.length; i++) {
                    xhr[extraFnName].callbacks[i](res);
                }
            }
        },
    },
    defError: config => {
        return function(err, errTitle, errDescription) {
            noti.error({
                title: `HTTP ${errTitle} #${err.status}`,
                text : hbsAlertErrorHttp({errDescription, config}),
            });
        };
    },
    withoutParams: config => {
        let resFn = (data = {}) => {

            let xhr;
            // NOTE: Set default data values if needed
            if (config.default) {
                data = Object.assign({}, config.default, data);
            }

            // NOTE: Check requred data vaules
            if (fn.checkRequiredParams(config, data)) {

                // NOTE: Check request function
                if (config.fn) {
                    xhr = config.fn(data);
                } else {
                    xhr = $.ajax(config.url, {
                        data,
                        method: config.method,
                        /*dataFilter: (res, dataType) => {
                            res = JSON.parse(res);
                            console.log('- res:', res);
                            console.log('- dataType:', dataType);
                            if (config.schema && res && res.success && res.schema) {
                                Object.assign(res, {
                                    data: fn.schema.transform(res),
                                });
                            }
                            console.log('- data:', res);
                            // return res;
                            return res;
                            // return JSON.stringify(res);
                        },*/
                        converters: {
                            /*"text json": res => {
                                // if (typeof res === 'string') {
                                //     res = JSON.parse(res);
                                // }
                                return res;
                            },*/
                            // "text json": true,
                            // NOTE: Transform schema-data logic
                            "text json": res => {
                                res = JSON.parse(res);
                                if (config.schema && res && res.success && res.schema) {
                                    Object.assign(res, {
                                        data: fn.schema.transform(res),
                                    });
                                }
                                return res;
                            },
                        },
                    });
                }
            } else {
                // NOTE: If not exist required field in data return empty ajax obj
                xhr = $.ajax();
            }

            // NOTE: Check if it's ajax
            if (fn.isXHR(xhr)) {

                // NOTE: Set first done request function and check to then or to catch logic
                xhr.done(res => {
                    if (res && res.success) {
                        fn.extra.get('then', xhr, res.data);
                    } else {
                        console.error('Error:res.mess:', res, config);
                        if (config.catch) {
                            noti.error({text: res.message});
                        }
                        fn.extra.get('catch', xhr, res);
                    }
                });

                // NOTE: Set then and catch method
                // TODO: Check if needed
                fn.extra.set('then', xhr);
                fn.extra.set('catch', xhr);

                // NOTE: Set default error
                if (config.error) {
                    xhr.fail(fn.defError(config));
                }
            }

            return xhr;
        };
        // NOTE: Generate info function
        if (isDev) {
            resFn.info = fn.generateInfo(config);
        }
        // NOTE: Check config property
        if (!config.url && !config.fn) {
            console.warn('Warning: Module doesn\'t have "url" OR "fn"', config);
        }
        return resFn;
    },
    withParams: config => {
        return function() {

            let data = {};

            for (var i = 0, l = config.params.length; i < l; i++) {
                if (arguments.length-1 >= i) {
                    data[config.params[i]] = arguments[i];
                }
            }

            return fn.withoutParams(config)(data);
        };
    },
    checkRequiredParams: (config, data) => {

        let res = [];

        if (config.require) {
            for (var i = 0; i < config.require.length; i++) {
                let field = config.require[i];
                if (!(field in data)) {
                    res.push(field);
                }
            }
            if (res.length) {
                noti.error({
                    title: 'API validation error',
                    text : hbsAlertErrorValidation({
                        config,
                        fields: res,
                    }),
                });
                throw res;
            }
        }
        return !res.length;
    },
    defCNF: (config, key, defProp=true, str2array) => {
        if (!(key in config)) {
            config[key] = defProp;
        }
        if (str2array && typeof config[key] === 'string') {
            config[key] = [config[key]];
        }
        return fn;
    },
    getApi: function(config) {

        fn
            .defCNF(config, 'error')
            .defCNF(config, 'catch')
            .defCNF(config, 'schema')
            .defCNF(config, 'params', null, true)
            .defCNF(config, 'require', null, true)
            .defCNF(config, 'method', isProd? 'post': 'get');

        if (config.params) {
            if (config.require) {
                for (var i = 0; i < config.require.length; i++) {
                    if (config.params.indexOf(config.require[i]) === -1) {
                        let err = `Bad configuration api module:
                            Unlogic "params" and "require" options!
                            Params not exist: "${config.require[i]}"`;
                        alert(err);
                        throw err;
                    }
                }
            }
            return fn.withParams(config);
        }
        return fn.withoutParams(config);
    },
    generateInfo: function(config) {
        return () => {
            let table = {};
            for (let key in config) {
                table[key] = Array.isArray(config[key])
                    ? [config[key].join(', ')]
                    : [config[key]];
            }
            console.table(table);
            return config;
        }
    },
    typeof: cnf => {
        let type = typeof cnf;
        if (Array.isArray(cnf)) {
            type = 'array';
        }
        return type;
    },
    from: {
        'object': (cnf/*, name*/) => {
            let res = {},
                names = Object.keys(cnf),
                isGenCnf = 'name' in cnf && ('fn' in cnf || 'url' in cnf);
            if (isGenCnf) {
                res = fn.getApi(cnf);
            } else {
                for (var i = names.length - 1; i >= 0; i--) {
                    let name = names[i],
                        conf = cnf[name],
                        type = fn.typeof(conf);
                    res[name] = fn.from[type](conf, name);
                }
            }
            return res;
        },
        'array': cnf => {
            let res = {};

            for (var j in cnf) {
                let config = cnf[j];
                if (config.name && (config.url || config.fn)) {
                    res[config.name] = fn.getApi(config);
                } else {
                    res = fn.from[fn.typeof(config)](config);
                }
            }

            return res;
        },
        'function': (cnf, name) => {
            let config = cnf();
            config.name = name;
            return fn.getApi(config);
        },
        'string': (cnf, name) => {
            return fn.getApi({
                url: cnf,
                name,
            });
        },
    },
    generateApi: function(cnf = {}) {
        let res = fn.from[fn.typeof(cnf)](cnf);
        return res;
    },
};

var API = fn.generateApi(CNF);

API._schema = fn.schema.transform;

if (isDev) {
    window.api = API;
}

module.exports = API;
