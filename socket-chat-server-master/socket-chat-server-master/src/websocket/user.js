const users = [];

// get current user
function getCurrentUser(socketId) {
  return users.find(user => user.socketId === socketId)
}

// join user to chat
function userJoin(socketId, userInfo) {
  const user = Object.assign({ socketId }, userInfo)
  users.push(user)

  return user;
}

function getUserById(id) {
  return users.find(user => user.id === id * 1)
}

// remove user
function removeUser(socketId) {
  let index = users.findIndex(item => item.socketId === socketId)
  if (index != -1) users.splice(index, 1)
  console.log(index, users);
}

module.exports = {
  userJoin,
  getCurrentUser,
  getUserById,
  removeUser,
}