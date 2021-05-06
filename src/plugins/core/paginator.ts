import Hapi from '@hapi/hapi'

const paginatorPluginName = 'core/paginator'

const paginatorPlugin: Hapi.Plugin<undefined> = {
    name: paginatorPluginName,
    dependencies: [],
    register: (server: Hapi.Server) => {

    }
}

export {
    paginatorPluginName,
    paginatorPlugin
}
