const path = require ('path');
// html 打包插件
const htmlPlugin = require('html-webpack-plugin');
// css分离与图片路径处理插件
const extractTextPlugin = require('extract-text-webpack-plugin');
// css压缩优化
const optimizeCss = require('optimize-css-assets-webpack-plugin');

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

var website = {
    publicPath:'./'
}
module.exports = {
    // 入口文件
    entry: {
        pageOne: path.join(__dirname,'./src/pageOne/js/pageOne.js'),
        pageTwo: path.join(__dirname,'./src/pageTwo/js/pageTwo.js')
    },
    // 输出文件
    output: {
        path: path.join(__dirname,'./build'),
        filename:'js/[name].[chunkhash].js',
        publicPath: website.publicPath
    },
    // 模式
    mode:'production',   //development   production
    module: {
        rules: [
            {
                test:/\.js?$/,
                loader:'babel-loader',
                //指定的js文件被babel处理
                include: [path.join(__dirname,'./src/pageOne/js/pageOne.js'),path.join(__dirname,'./src/pageTwo/js/pageTwo.js')],
                exclude: /node_modules/
            },
            {
                test:/\.css$/,
                use: extractTextPlugin.extract({
                    publicPath:'../',
                    fallback: {
                        loader: 'style-loader'
                    },
                    use: [{
                        loader: 'css-loader'
                    }]
                })
            },
            {
                test: /\.less$/,
                use: extractTextPlugin.extract({
                    publicPath:'../',
                    use:[{
                        loader: 'css-loader'
                    },{
                        loader: 'less-loader'
                    }],
                    fallback: 'style-loader'
                })
            },
            {//css中引入图片
                test: /\.(png|jpg|gif|gsp)/ ,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit:5000,//代表如果图片小于5000字节则会自动压缩成base64编码图片，否则复制文件到生产目录
                        name: '/[name].[hash].[ext]',
                        outputPath:'images/'
                    }
                }] 
            },
            {//html中引入图片
                test:/\.(htm|html)$/i,
                use: ['html-withimg-loader']
            }
        ]
    },
    plugins:[
        new CleanWebpackPlugin(), // 每次清除已生成
        new htmlPlugin({
            template: './src/pageOne/index.html',   //html模板
            filename: 'index.html',
            title: 'this is pageOne.html',
            //增加指定的chunks   加载对应js文件
            chunks:['pageOne']
         }),
        new htmlPlugin({
            template: './src/pageTwo/index.html',   //html模板
            filename: 'pageTwo.html',
            title: 'this is pageTwo.html',
            //增加指定的chunks   加载对应js文件
            chunks:['pageTwo']
         }),
        new extractTextPlugin({
            filename:(getPath)=>{
                return getPath('css/[name].[chunkhash].css')
            }
        }),
        new optimizeCss({
            assetNameRegExp:/\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions:{
                preset:['default',{
                    discardComments:{removeAll: true}
                }]
            },
            canPrint: true
        })
    ],
    devServer:{
        contentBase:path.resolve(__dirname,'build'),
        host: '192.168.1.89',
        compress: true,
        hot: true,
        port: 8088
    }
}