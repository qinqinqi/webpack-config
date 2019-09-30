const path = require('path') // path模块是node.js的核心模块，主要用来操作文件路径
const webpack = require('webpack')  // 引入已经安装的webpack模块
const HtmlWebpackPlugin = require('html-webpack-plugin')  //引入 htmlwebpackplugin 插件 作用生成html文件
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin') //引入extract-text-webpack-plugin 拆分css，将css从js中抽离，
const autoprefixer = require('autoprefixer');//给css自动加浏览器兼容性前缀的插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // 每次打包前，先清空打包后生成的dist文件包

module.exports={
	mode:'development',  // 4.x 新增,提供 mode 配置选项,会将 process.env.NODE_ENV 的值设为 development, 启用相应环境模式下的 webpack 内置的优化
	entry:{ //入口文件 1.只打包一个文件（单入口），写个字符串；2.把多个文件打包成一个文件，写个数组;3.把多个文件分别打包成多个文件，写成对象
		//多入口文件
		jquery:'./src/js/jquery-2.1.1.js',
		countTo:'./src/js/jquery.countTo.js',
		public:'./src/js/public.js',
		rem:'./src/js/rem.js',
		swiper:'./src/js/swiper-4.4.1.min.js'
	},
	output:{
		path:path.resolve(__dirname,'dist'), // __dirname：是node.js中的一个全局变量，它指向当前执行脚本所在的目录
		filename:'js/[name]-[hash:5].js', //[chunkhash:5]: 数字和字母组成的8位哈希值,[name]：是根据入口文件的自动生成的，有几个入口文件，就可以打包几个出口文件。
		publicPath: '/'  //表示打包文件中引用文件的路径前缀,如果你的图片存放在CDN上，那么你上线时可以加上这个参数，值为CDN地址，这样就可以让项目上线后的资源引用路径指向CDN了。
						   // 表示线上地址： "http://glkj.com/"
						   // 例如: publicPath: 'http://cdn.example.com/assets/[hash]/'
	
	},
	module:{ // 配置模块 主要用于解析css图片转换压缩等功能
		rules:[
			{//解析js
				test: '/\.(js|jsx)$/',  // 正则匹配
				use: [
					{
				    	loader:'babel-loader',
    					options:{// 该loader对应的参数
                            presets:['@babel/preset-env',],
                            plugins:['@babel/transform-runtime']
                        }
    				}
				],
				exclude: path.resolve(__dirname, 'node_modules'), //exclude  不包含node_modules中js文件
				include: path.resolve(__dirname, 'src'), // include  包含src中的js文件
			},
			{//解析less
				test: /\.less$/,
				use:ExtractTextWebpackPlugin.extract({
					fallback:'style-loader',
					use:[// 从右向左解析
						{loader:'css-loader'},
						{loader:'less-loader'},
						{
					    	loader: 'postcss-loader', //
					    	options: {
			       			plugins: [
		                            autoprefixer({
		                                overrideBrowserslist: ['ie >= 8','Firefox >= 20', 'Safari >= 5', 'Android >= 4','Ios >= 6', 'last 4 version']
		                            })
		                        ]
						    }
						},
						{
					    loader: 'px2rem-loader', // 解析less文件时，将px单位转换成rem单位。
					    options: {
					        remUnit: 75,//px转rem换算比率  1rem = 75px
					        remPrecision: 8 //保留小数点后到几位小数
						    }
						}
					]
				})
			},
			{//解析 css
				test:/\.css$/,
				use:ExtractTextWebpackPlugin.extract({ // 将css从js中分离出来
					fallback:'style-loader', // 回滚待查
					use:[
						{loader:'css-loader'},
						{
					    	loader: 'postcss-loader', //
					    	options: {
			       			plugins: [
		                            autoprefixer({
		                                overrideBrowserslist: ['ie >= 8','Firefox >= 20', 'Safari >= 5', 'Android >= 4','Ios >= 6', 'last 4 version']
		                            })
		                        ]
						    }
						},
						{
					    loader: 'px2rem-loader', // 解析css文件时，将px单位转换成rem单位
					    options: {
					        remUnit: 75, //px转rem换算比率  1rem = 75px
					        remPrecision: 8 //保留小数点后到几位小数
						    }
						}
					]
					
				})
			},
			{// 解析img图片
				test: /\.(png|jpg|jpeg|gif)$/,
				use: [
					{
						loader:'url-loader', // 将图片文件小于下方limit参数值的图片进行dataurl转码,转成base64路径啦(注意urlloader内置fileloader)
						options:{
							name: "[name]-[hash:5].min.[ext]", // 打包后的图片名
							limit: 20000, // 单位是B, 1Kb =1000B  size<=20kb 意思是 小于20kb的图片进行base64编码,而大于20kb则需要打包,这个打包也只是copy图片，并没有真正意义上压缩图片，压缩的话，需要安装压缩的loader
							//publicPath:'../image', // 表示打包文件中引用文件的路径前缀，即此处表示图片的引用路径前缀，如果你的图片存放在CDN上，那么你上线时可以加上这个参数，值为CDN地址，这样就可以让项目上线后的资源引用路径指向CDN了。
							outputPath: "image/" // 定义输出的图片路径
						}
					},
					{
						loader:'image-webpack-loader', // 图片压缩loader
						options:{
							 bypassOnDebug: true  // 待查
						}
					}
				]
			},
			{
                test: /\.html$/, // 打包html页面中的img图片 
                use: ["html-withimg-loader"] //打包html中的img标签中的图片，使用该loader图片会被打包，且路径处理得当，图片大的话也会直接压缩到dist目录中，小的话，直接转成base64路径引进去
            },

		]	
	},	
	plugins:[// 配置插件 用于生产模板等各项功能
		new CleanWebpackPlugin(), // 打包前，先将dist文件中的内容全部清除
		new webpack.ProvidePlugin({ // 自动加载模块插件  使用模块插件的时候，不需要通过 import/require引入 使用该模块
			$:'jquery',
			jQuery:'jquery'
		}),
		new HtmlWebpackPlugin({ //作用是打包生成对应的html文件
			template:'./src/index.html', //要处理的html模板文件(打包后，生成新的html文件) 
			filename:'pages/index.html',  // 打包生成的文件地址及文件名，filename配置的html文件目录是相对于webpackConfig.output.path路径而言的，不是相对于当前项目目录结构的。
			title:'index', // 设置该页面的title标题标签
			chunks:['index','common'],
			inject:'body',  // 所有js资源插入到head标签中
		}),
		new HtmlWebpackPlugin({ //作用是打包生成对应的html文件
			template:'./src/about.html', //要处理的html模板文件(打包后，生成新的html文件) 
			filename:'pages/about.html',  // 打包生成的文件地址及文件名，filename配置的html文件目录是相对于webpackConfig.output.path路径而言的，不是相对于当前项目目录结构的。
			title:'about', // 设置该页面的title标题标签
			chunks:['about','common'],
			inject:'body',  // 所有js资源插入到head标签中
		}),
		new HtmlWebpackPlugin({ //作用是打包生成对应的html文件
			template:'./src/contact.html', //要处理的html模板文件(打包后，生成新的html文件) 
			filename:'pages/contact.html',  // 打包生成的文件地址及文件名，filename配置的html文件目录是相对于webpackConfig.output.path路径而言的，不是相对于当前项目目录结构的。
			title:'contact', // 设置该页面的title标题标签
			chunks:['contact','common'],
			inject:'body',  // 所有js资源插入到head标签中
		}),
		new ExtractTextWebpackPlugin('css/[name].css'), // 将从js中分离后的css文件放到指定目录(放到dist下css目录下)并引入到当前js坐在的页面
		new webpack.HotModuleReplacementPlugin() // HotModuleReplacementPlugin为webpack内置插件调用使用webpack.[plugin-name]使用这些插件
	],
	devServer:{ // 配置本地开发服务器
		contentBase:path.resolve(__dirname,'dist'),//webpack-dev-ser运行时的文件根目录 (将 dist 目录下的文件，作为搭建的开发服务器可访问的文件)
		historyApiFallback:false,
		host:'localhost',  // 可以通过localhost访问
		overlay:{
			errors:true // 出现错误之后会在页面中出现遮罩层提示
		},
		inline:true,
		stats: 'errors-only',
		hot:true, // 启动热更新
		open:true // 启用webpack-dev-server时，自动打开浏览器
	},
	devtool: 'inline-source-map' //是一个工具，主要是查看编译后的文件如果报错，控制台提示错误来自于编译前的哪一个文件。方便找错

	
}

// 版权声明：本文为CSDN博主「今晚da老虎」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
// 原文链接：https://blog.csdn.net/weixin_39458031/article/details/86671664