const rodape = require('./rodape')
const rodapeNoFactory = require('./rodapeNoFactory')

const selectRodape = (values) => {
    if (values.noBaseboard) {
        return rodapeNoFactory()
    } else {
        return rodape(values)
    }
}

module.exports = selectRodape