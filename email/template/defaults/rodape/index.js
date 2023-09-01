const rodape = require('./rodape')
const rodapeNoFactory = require('./rodapeNoFactory')

const selectRodape = (values) => {
    if (values && values.noBaseboard) {
        return rodape(values)
    } else {
        return rodapeNoFactory()
    }
}

module.exports = selectRodape