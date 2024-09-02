const File = require('../models/files.js')
const { Op } = require("sequelize");

// 添加文件记录
const addFile = async (file) => {
  const res = await File.create(file)

  return Boolean(res)
}

// 获取文件列表
const getFileList = async (userId, lastTime) => {
  return await File.findAll({
    where: {
      userId,
      createdAt: {
        [Op.lt]: lastTime,
      }
    },
    limit: 30,
    order: [
      ['createdAt', 'DESC'],
    ],
    raw: true,
  })
}

module.exports = {
  addFile,
  getFileList,
}