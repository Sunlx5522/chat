const prodPlugins = []
// 发布阶段，则向`prodPlugins `数组中加入插件`transform-remove-console`
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [
    ...prodPlugins
  ]
};