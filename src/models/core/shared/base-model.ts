import * as joiful from "joiful"
import Joi from "joi"

const internalModelMapping: { className: string, fieldName: string, type: typeof BaseModel }[] = []

function model(objectClass: typeof BaseModel) {
    return function(target: BaseModel, propertyKey: string) {
        if (!internalModelMapping.find(map => map.className == target.constructor.name && map.fieldName == propertyKey)) {
            internalModelMapping.push({
                className: target.constructor.name,
                fieldName: propertyKey,
                type: objectClass,
            })
        }
    }
}

class BaseModel {

    public static getValidator(): Joi.ObjectSchema {
        return (joiful.getSchema(this) as Joi.ObjectSchema).label(this.name.toLowerCase())
    }

    public static fromJSON<T>(json: object): T {
        const obj = Object.assign(new this(), json)
        Object.keys(obj).forEach(key => {
            const result = internalModelMapping.find(x => x.className == this.name && x.fieldName == key)
            if (result) {
                // @ts-ignore
                obj[key] = result.type.fromJSON<result.type>(obj[key])
            }
        })
        // @ts-ignore
        return obj as T
    }

    public asJSON(): object {
        return JSON.parse(JSON.stringify(this))
    }

}

export {
    model,
    BaseModel
}
