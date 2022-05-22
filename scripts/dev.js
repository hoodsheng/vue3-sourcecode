// 引入es6的构建工具
const { build } = require("esbuild");
const { resolve } = require("path");
// 使用minimist解析命令行参数
const args = require("minimist")(process.argv.slice(2));
// console.log(args);

// 打包的目标文件
const target = args._[0] || "reactivity";
// 打包的格式
const format = args.f || "global";
// 打包时所用的package.json的配置
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));
// 输出的格式
// iife：立即执行函数
// cjs：node中的commonJS模块 module.export={}
// esm:浏览器的esModule模块  import xx from xx
const outputFormat = format.startsWith("global")
  ? "iife"
  : format === "cjs"
  ? "cjs"
  : "esm";
// 输出的文件
const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);

// 用esbuild去打包/构建
build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true,
  sourcemap: true,
  format: outputFormat,
  globalName: pkg.buildOptions?.name,
  platform: format === "cjs" ? "node" : "browser",
  watch: {
    // 监控文件变化
    onRebuild(error) {
      if (!error) console.log(`rebuilt~~~~`);
    },
  },
}).then(() => {
  console.log("watching~~~");
});
