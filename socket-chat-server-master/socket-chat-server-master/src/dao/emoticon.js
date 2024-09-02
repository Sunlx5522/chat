const Emoticon = require('../models/emoticons.js')

// 添加表情
const addEmoticon = async (emoticon) => {
  const res = await Emoticon.create(emoticon)
  return Boolean(res) && res.get({ plain: true })
}

// 获取表情列表
const getEmoticonList = async (userId) => {
  return await Emoticon.findAll({
    where: {
      userId,
    },
    order: [
      ['createdAt', 'DESC'],
    ],
    raw: true,
  })
}

module.exports = {
  addEmoticon,
  getEmoticonList,
}