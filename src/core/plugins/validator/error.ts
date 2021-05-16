import Hapi, {Lifecycle} from '@hapi/hapi'
import boom from "@hapi/boom"
import FailAction = Lifecycle.FailAction
import Method = Lifecycle.Method
const config = require('config')

const handleValidationError = (request: Hapi.Request, h: Hapi.ResponseToolkit, err: Error): FailAction => {

    console.error(`${(new Date()).toISOString()} - ${request.method.toUpperCase()} ${request.path} - ${err.name}: ${err.message}`)

    if (config.get('showErrors')) {
        console.error('Debug info: ', err)
        throw err
    } else {
        throw boom.badRequest(`Invalid request data`)
    }

}

export default handleValidationError as Method
