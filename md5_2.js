const common = require('./libs/common')

var str = common.md5('123456' + 'abcdefg12345')

console.log(str)