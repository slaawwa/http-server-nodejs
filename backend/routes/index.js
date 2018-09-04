import glob from 'glob'
import path from 'path'
// import pug from 'pug'

const ctrls = []
export default ctrls

export const setRoutes = server => {
    glob.sync('**/!(_)*{Ctrl,Ctrl.js}', { cwd: './backend/routes/' }).forEach(
        file => {
            let module = require(path.resolve(`./backend/routes/${file}`))
            if (typeof module === 'object' && module.default) {
                module = module.default
            }
            module = typeof module === 'function' ? module(server) : module
            console.log(' - ctrl::', file, Array.isArray(module))
            if (!Array.isArray(module)) {
                module = [module]
            }
            ctrls.push(...module)
        }
    )
    return ctrls
}
