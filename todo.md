##### 10/11/2016
* create a `point` transform & validator to support: `{x: 20.639802, y: -87.073249}`
* move `model.fields` to `model.attrs` and consider moving validations to actual validator
  * required, max, min
* `serializer.attrs` should hold the `defaultValue` for when serializing from DB
  * defaultValue can get applied on deserialize ( pre-validation? )
